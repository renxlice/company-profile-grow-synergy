const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const { validateInput, secureFileUpload, createRateLimiter, logSecurityEvent } = require('../middleware/security');
const { toggleMaintenance, isMaintenanceMode } = require('../middleware/maintenance');

// JWT token verification middleware
const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Verify admin exists in Firestore
        const adminDoc = await admin.firestore()
            .collection('admins')
            .doc(decoded.adminId)
            .get();
        
        if (!adminDoc.exists) {
            return res.status(401).json({ 
                error: 'Invalid token. Admin not found.' 
            });
        }
        
        const adminData = adminDoc.data();
        
        // Check if admin is active
        if (!adminData.isActive) {
            return res.status(401).json({ 
                error: 'Account is deactivated.' 
            });
        }
        
        req.admin = {
            id: decoded.adminId,
            email: adminData.email,
            role: adminData.role || 'admin'
        };
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token.' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please login again.' 
            });
        }
        res.status(500).json({ error: 'Token verification failed' });
    }
};

// Rate limiters
const adminLimiter = createRateLimiter('admin');
const uploadLimiter = createRateLimiter('upload');

// Secure file upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/admin');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Limit to 1 file per request
    },
    fileFilter: function (req, file, cb) {
        // Allowed file types
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'), false);
        }
    }
});

// Expert management routes

// Get all experts (admin view)
router.get('/experts', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const expertsSnapshot = await admin.firestore()
            .collection('experts')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        
        const experts = [];
        expertsSnapshot.forEach(doc => {
            const expertData = doc.data();
            experts.push({
                id: doc.id,
                name: expertData.name,
                position: expertData.position,
                experience: expertData.experience,
                description: expertData.description,
                rating: expertData.rating,
                reviewCount: expertData.reviewCount,
                image: expertData.image,
                createdAt: expertData.createdAt?.toDate(),
                updatedAt: expertData.updatedAt?.toDate()
            });
        });
        
        // Get total count for pagination
        const totalSnapshot = await admin.firestore()
            .collection('experts')
            .get();
        const total = totalSnapshot.size;
        
        res.json({
            experts: experts,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get experts error:', error);
        res.status(500).json({ error: 'Failed to get experts' });
    }
});

// Get single expert
router.get('/experts/:expertId', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const expertDoc = await admin.firestore()
            .collection('experts')
            .doc(req.params.expertId)
            .get();
        
        if (!expertDoc.exists) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        
        const expertData = expertDoc.data();
        res.json({
            id: expertDoc.id,
            name: expertData.name,
            position: expertData.position,
            experience: expertData.experience,
            description: expertData.description,
            rating: expertData.rating,
            reviewCount: expertData.reviewCount,
            image: expertData.image,
            createdAt: expertData.createdAt?.toDate(),
            updatedAt: expertData.updatedAt?.toDate()
        });
        
    } catch (error) {
        console.error('Get expert error:', error);
        res.status(500).json({ error: 'Failed to get expert' });
    }
});

// Create expert
router.post('/experts', 
    adminLimiter, 
    verifyAdminToken, 
    validateInput({
        name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        position: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        experience: { required: true, type: 'string', minLength: 1, maxLength: 500 },
        description: { required: false, type: 'string', maxLength: 1000 },
        rating: { required: true, type: 'number', min: 0, max: 5 },
        reviewCount: { required: true, type: 'number', min: 0 }
    }),
    async (req, res) => {
        try {
            const { name, position, experience, description, rating, reviewCount } = req.body;
            
            // Create expert data
            const expertData = {
                name: name,
                position: position,
                experience: experience,
                description: description || '',
                rating: rating,
                reviewCount: reviewCount,
                image: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: req.admin.id
            };
            
            const expertRef = await admin.firestore()
                .collection('experts')
                .add(expertData);
            
            // Log expert creation
            await logSecurityEvent('EXPERT_CREATED', {
                expertId: expertRef.id,
                expertName: name,
                createdBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.status(201).json({
                message: 'Expert created successfully',
                expertId: expertRef.id
            });
            
        } catch (error) {
            console.error('Create expert error:', error);
            res.status(500).json({ error: 'Failed to create expert' });
        }
    }
);

// Update expert
router.put('/experts/:expertId', 
    adminLimiter, 
    verifyAdminToken, 
    validateInput({
        name: { required: false, type: 'string', minLength: 1, maxLength: 100 },
        position: { required: false, type: 'string', minLength: 1, maxLength: 100 },
        experience: { required: false, type: 'string', minLength: 1, maxLength: 500 },
        description: { required: false, type: 'string', maxLength: 1000 },
        rating: { required: false, type: 'number', min: 0, max: 5 },
        reviewCount: { required: false, type: 'number', min: 0 }
    }),
    async (req, res) => {
        try {
            const expertId = req.params.expertId;
            const updateData = req.body;
            
            // Check if expert exists
            const expertDoc = await admin.firestore()
                .collection('experts')
                .doc(expertId)
                .get();
            
            if (!expertDoc.exists) {
                return res.status(404).json({ error: 'Expert not found' });
            }
            
            // Add update metadata
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            updateData.updatedBy = req.admin.id;
            
            await admin.firestore()
                .collection('experts')
                .doc(expertId)
                .update(updateData);
            
            // Log expert update
            await logSecurityEvent('EXPERT_UPDATED', {
                expertId: expertId,
                updatedBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({ message: 'Expert updated successfully' });
            
        } catch (error) {
            console.error('Update expert error:', error);
            res.status(500).json({ error: 'Failed to update expert' });
        }
    }
);

// Delete expert
router.delete('/experts/:expertId', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const expertId = req.params.expertId;
        
        // Check if expert exists
        const expertDoc = await admin.firestore()
            .collection('experts')
            .doc(expertId)
            .get();
        
        if (!expertDoc.exists) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        
        const expertData = expertDoc.data();
        
        // Delete associated image file if exists
        if (expertData.image && expertData.image.startsWith('/uploads/')) {
            try {
                const imagePath = path.join(__dirname, '../public', expertData.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (fileError) {
                console.error('Failed to delete image file:', fileError);
                // Continue with expert deletion even if file deletion fails
            }
        }
        
        // Delete expert from Firestore
        await admin.firestore()
            .collection('experts')
            .doc(expertId)
            .delete();
        
        // Log expert deletion
        await logSecurityEvent('EXPERT_DELETED', {
            expertId: expertId,
            expertName: expertData.name,
            deletedBy: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ message: 'Expert deleted successfully' });
        
    } catch (error) {
        console.error('Delete expert error:', error);
        res.status(500).json({ error: 'Failed to delete expert' });
    }
});

// Upload expert image
router.post('/experts/:expertId/upload-image', 
    uploadLimiter, 
    verifyAdminToken, 
    upload.single('image'),
    secureFileUpload,
    async (req, res) => {
        try {
            const expertId = req.params.expertId;
            
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            // Check if expert exists
            const expertDoc = await admin.firestore()
                .collection('experts')
                .doc(expertId)
                .get();
            
            if (!expertDoc.exists) {
                // Clean up uploaded file if expert doesn't exist
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Expert not found' });
            }
            
            const expertData = expertDoc.data();
            
            // Delete old image if exists
            if (expertData.image && expertData.image.startsWith('/uploads/')) {
                try {
                    const oldImagePath = path.join(__dirname, '../public', expertData.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (fileError) {
                    console.error('Failed to delete old image file:', fileError);
                }
            }
            
            // Update expert with new image path
            const imagePath = '/uploads/admin/' + req.file.filename;
            
            await admin.firestore()
                .collection('experts')
                .doc(expertId)
                .update({
                    image: imagePath,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: req.admin.id
                });
            
            // Log image upload
            await logSecurityEvent('EXPERT_IMAGE_UPLOADED', {
                expertId: expertId,
                fileName: req.file.filename,
                fileSize: req.file.size,
                uploadedBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({
                message: 'Image uploaded successfully',
                imagePath: imagePath
            });
            
        } catch (error) {
            console.error('Upload image error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Failed to clean up uploaded file:', cleanupError);
                }
            }
            
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }
);

// Hero section management

// Get hero sections
router.get('/hero-sections', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const heroSnapshot = await admin.firestore()
            .collection('hero_sections')
            .orderBy('createdAt', 'desc')
            .get();
        
        const heroSections = [];
        heroSnapshot.forEach(doc => {
            const heroData = doc.data();
            heroSections.push({
                id: doc.id,
                title: heroData.title,
                subtitle: heroData.subtitle,
                description: heroData.description,
                backgroundImage: heroData.backgroundImage,
                page: heroData.page,
                isActive: heroData.isActive,
                createdAt: heroData.createdAt?.toDate(),
                updatedAt: heroData.updatedAt?.toDate()
            });
        });
        
        res.json({ heroSections: heroSections });
        
    } catch (error) {
        console.error('Get hero sections error:', error);
        res.status(500).json({ error: 'Failed to get hero sections' });
    }
});

// Create/update hero section
router.post('/hero-sections', 
    adminLimiter, 
    verifyAdminToken,
    validateInput({
        title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
        subtitle: { required: true, type: 'string', minLength: 1, maxLength: 200 },
        description: { required: true, type: 'string', minLength: 1, maxLength: 500 },
        page: { required: true, type: 'string', minLength: 1, maxLength: 50 }
    }),
    async (req, res) => {
        try {
            const { title, subtitle, description, page, backgroundImage } = req.body;
            
            // Check if hero section already exists for this page
            const existingHero = await admin.firestore()
                .collection('hero_sections')
                .where('page', '==', page)
                .limit(1)
                .get();
            
            const heroData = {
                title: title,
                subtitle: subtitle,
                description: description,
                page: page,
                backgroundImage: backgroundImage || null,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: req.admin.id
            };
            
            if (existingHero.empty) {
                // Create new hero section
                const heroRef = await admin.firestore()
                    .collection('hero_sections')
                    .add(heroData);
                
                await logSecurityEvent('HERO_SECTION_CREATED', {
                    heroId: heroRef.id,
                    page: page,
                    createdBy: req.admin.email,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                res.status(201).json({
                    message: 'Hero section created successfully',
                    heroId: heroRef.id
                });
            } else {
                // Update existing hero section
                const heroDoc = existingHero.docs[0];
                heroData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
                heroData.updatedBy = req.admin.id;
                
                await admin.firestore()
                    .collection('hero_sections')
                    .doc(heroDoc.id)
                    .update(heroData);
                
                await logSecurityEvent('HERO_SECTION_UPDATED', {
                    heroId: heroDoc.id,
                    page: page,
                    updatedBy: req.admin.email,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                res.json({
                    message: 'Hero section updated successfully',
                    heroId: heroDoc.id
                });
            }
            
        } catch (error) {
            console.error('Save hero section error:', error);
            res.status(500).json({ error: 'Failed to save hero section' });
        }
    }
);

// Upload hero background image
router.post('/hero-sections/upload-background', 
    uploadLimiter, 
    verifyAdminToken, 
    upload.single('image'),
    secureFileUpload,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            const imagePath = '/uploads/admin/' + req.file.filename;
            
            // Log image upload
            await logSecurityEvent('HERO_BACKGROUND_UPLOADED', {
                fileName: req.file.filename,
                fileSize: req.file.size,
                uploadedBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({
                message: 'Background image uploaded successfully',
                imagePath: imagePath
            });
            
        } catch (error) {
            console.error('Upload background error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Failed to clean up uploaded file:', cleanupError);
                }
            }
            
            res.status(500).json({ error: 'Failed to upload background image' });
        }
    }
);

// Get admin profile
router.get('/profile', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const adminDoc = await admin.firestore()
            .collection('admins')
            .doc(req.admin.id)
            .get();
        
        if (!adminDoc.exists) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        const adminData = adminDoc.data();
        
        res.json({
            id: adminDoc.id,
            email: adminData.email,
            name: adminData.name,
            role: adminData.role,
            lastLogin: adminData.lastLogin?.toDate(),
            createdAt: adminData.createdAt?.toDate()
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Testimonials Management Routes
const testimonialLimiter = createRateLimiter(15, 15, 'testimonial');

// Get all testimonials
router.get('/testimonials', testimonialLimiter, verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await admin.firestore()
            .collection('testimonials')
            .orderBy('createdAt', 'desc')
            .get();
        
        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        }));
        
        res.json(testimonials);
    } catch (error) {
        console.error('Get testimonials error:', error);
        res.status(500).json({ error: 'Failed to get testimonials' });
    }
});

// Get single testimonial
router.get('/testimonials/:id', testimonialLimiter, verifyAdminToken, async (req, res) => {
    try {
        const doc = await admin.firestore()
            .collection('testimonials')
            .doc(req.params.id)
            .get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        
        res.json({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        });
    } catch (error) {
        console.error('Get testimonial error:', error);
        res.status(500).json({ error: 'Failed to get testimonial' });
    }
});

// Create testimonial
router.post('/testimonials', testimonialLimiter, verifyAdminToken, validateInput({
    name: { required: true, type: 'string', maxLength: 100 },
    position: { required: true, type: 'string', maxLength: 100 },
    rating: { required: true, type: 'number', min: 1, max: 5 },
    message: { required: true, type: 'string', maxLength: 1000 },
    status: { type: 'string', enum: ['approved', 'pending', 'rejected'], default: 'approved' }
}), async (req, res) => {
    try {
        const testimonialData = {
            ...req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.admin.id
        };
        
        const docRef = await admin.firestore()
            .collection('testimonials')
            .add(testimonialData);
        
        logSecurityEvent('testimonial_created', req.admin.id, {
            testimonialId: docRef.id,
            name: req.body.name
        });
        
        res.status(201).json({
            id: docRef.id,
            ...testimonialData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Create testimonial error:', error);
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

// Update testimonial
router.put('/testimonials/:id', testimonialLimiter, verifyAdminToken, validateInput({
    name: { type: 'string', maxLength: 100 },
    position: { type: 'string', maxLength: 100 },
    rating: { type: 'number', min: 1, max: 5 },
    message: { type: 'string', maxLength: 1000 },
    status: { type: 'string', enum: ['approved', 'pending', 'rejected'] }
}), async (req, res) => {
    try {
        const docRef = admin.firestore()
            .collection('testimonials')
            .doc(req.params.id);
        
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        
        const updateData = {
            ...req.body,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: req.admin.id
        };
        
        await docRef.update(updateData);
        
        logSecurityEvent('testimonial_updated', req.admin.id, {
            testimonialId: req.params.id,
            updatedFields: Object.keys(req.body)
        });
        
        res.json({
            id: req.params.id,
            ...doc.data(),
            ...updateData,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
});

// Delete testimonial
router.delete('/testimonials/:id', testimonialLimiter, verifyAdminToken, async (req, res) => {
    try {
        const docRef = admin.firestore()
            .collection('testimonials')
            .doc(req.params.id);
        
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        
        const testimonialData = doc.data();
        
        await docRef.delete();
        
        logSecurityEvent('testimonial_deleted', req.admin.id, {
            testimonialId: req.params.id,
            name: testimonialData.name
        });
        
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Delete testimonial error:', error);
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// Bulk update testimonial status
router.patch('/testimonials/bulk-status', testimonialLimiter, verifyAdminToken, validateInput({
    testimonialIds: { required: true, type: 'array' },
    status: { required: true, type: 'string', enum: ['approved', 'pending', 'rejected'] }
}), async (req, res) => {
    try {
        const { testimonialIds, status } = req.body;
        const batch = admin.firestore().batch();
        
        testimonialIds.forEach(id => {
            const docRef = admin.firestore().collection('testimonials').doc(id);
            batch.update(docRef, {
                status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: req.admin.id
            });
        });
        
        await batch.commit();
        
        logSecurityEvent('testimonials_bulk_updated', req.admin.id, {
            testimonialIds,
            status
        });
        
        res.json({ 
            message: `Updated ${testimonialIds.length} testimonials to ${status}`,
            updatedCount: testimonialIds.length
        });
    } catch (error) {
        console.error('Bulk update testimonials error:', error);
        res.status(500).json({ error: 'Failed to bulk update testimonials' });
    }
});

// Get testimonials statistics
router.get('/testimonials/stats', testimonialLimiter, verifyAdminToken, async (req, res) => {
    try {
        const snapshot = await admin.firestore()
            .collection('testimonials')
            .get();
        
        const testimonials = snapshot.docs.map(doc => doc.data());
        
        const stats = {
            total: testimonials.length,
            approved: testimonials.filter(t => t.status === 'approved').length,
            pending: testimonials.filter(t => t.status === 'pending').length,
            rejected: testimonials.filter(t => t.status === 'rejected').length,
            averageRating: testimonials.length > 0 
                ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
                : 0,
            recentCount: testimonials.filter(t => {
                const createdAt = t.createdAt?.toDate();
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return createdAt > thirtyDaysAgo;
            }).length
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Get testimonials stats error:', error);
        res.status(500).json({ error: 'Failed to get testimonials statistics' });
    }
});

// Blog Management Routes

// Get all blogs
router.get('/blogs', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const blogsSnapshot = await admin.firestore()
            .collection('blogs')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        
        const blogs = [];
        blogsSnapshot.forEach(doc => {
            const blogData = doc.data();
            blogs.push({
                id: doc.id,
                title: blogData.title,
                slug: blogData.slug,
                excerpt: blogData.excerpt,
                content: blogData.content,
                author: blogData.author,
                tags: blogData.tags || [],
                image: blogData.image,
                published: blogData.published,
                createdAt: blogData.createdAt?.toDate(),
                updatedAt: blogData.updatedAt?.toDate()
            });
        });
        
        // Get total count for pagination
        const totalSnapshot = await admin.firestore()
            .collection('blogs')
            .get();
        const total = totalSnapshot.size;
        
        res.json({
            blogs: blogs,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ error: 'Failed to get blogs' });
    }
});

// Get single blog
router.get('/blogs/:blogId', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const blogDoc = await admin.firestore()
            .collection('blogs')
            .doc(req.params.blogId)
            .get();
        
        if (!blogDoc.exists) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blogData = blogDoc.data();
        res.json({
            id: blogDoc.id,
            title: blogData.title,
            slug: blogData.slug,
            excerpt: blogData.excerpt,
            content: blogData.content,
            author: blogData.author,
            tags: blogData.tags || [],
            image: blogData.image,
            published: blogData.published,
            createdAt: blogData.createdAt?.toDate(),
            updatedAt: blogData.updatedAt?.toDate()
        });
        
    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ error: 'Failed to get blog' });
    }
});

// Create blog
router.post('/blogs', 
    adminLimiter, 
    verifyAdminToken, 
    validateInput({
        title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
        slug: { required: false, type: 'string', maxLength: 200 },
        excerpt: { required: false, type: 'string', maxLength: 500 },
        content: { required: true, type: 'string', minLength: 1 },
        author: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        tags: { required: false, type: 'string' },
        published: { required: false, type: 'boolean' }
    }),
    async (req, res) => {
        try {
            const { title, slug, excerpt, content, author, tags, published } = req.body;
            
            // Generate slug if not provided
            const blogSlug = slug || title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            // Parse tags
            const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            // Create blog data
            const blogData = {
                title: title,
                slug: blogSlug,
                excerpt: excerpt || '',
                content: content,
                author: author,
                tags: parsedTags,
                image: null,
                published: published || false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: req.admin.id
            };
            
            const blogRef = await admin.firestore()
                .collection('blogs')
                .add(blogData);
            
            // Log blog creation
            await logSecurityEvent('BLOG_CREATED', {
                blogId: blogRef.id,
                blogTitle: title,
                createdBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.status(201).json({
                message: 'Blog created successfully',
                blogId: blogRef.id
            });
            
        } catch (error) {
            console.error('Create blog error:', error);
            res.status(500).json({ error: 'Failed to create blog' });
        }
    }
);

// Update blog
router.put('/blogs/update/:blogId', 
    adminLimiter, 
    verifyAdminToken, 
    validateInput({
        title: { required: false, type: 'string', minLength: 1, maxLength: 200 },
        slug: { required: false, type: 'string', maxLength: 200 },
        excerpt: { required: false, type: 'string', maxLength: 500 },
        content: { required: false, type: 'string', minLength: 1 },
        author: { required: false, type: 'string', minLength: 1, maxLength: 100 },
        tags: { required: false, type: 'string' },
        published: { required: false, type: 'boolean' }
    }),
    async (req, res) => {
        try {
            const blogId = req.params.blogId;
            const updateData = req.body;
            
            // Check if blog exists
            const blogDoc = await admin.firestore()
                .collection('blogs')
                .doc(blogId)
                .get();
            
            if (!blogDoc.exists) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            
            // Generate slug if title is updated but slug is not provided
            if (updateData.title && !updateData.slug) {
                updateData.slug = updateData.title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            
            // Parse tags if provided
            if (updateData.tags) {
                updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
            
            // Add update metadata
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            updateData.updatedBy = req.admin.id;
            
            await admin.firestore()
                .collection('blogs')
                .doc(blogId)
                .update(updateData);
            
            // Log blog update
            await logSecurityEvent('BLOG_UPDATED', {
                blogId: blogId,
                updatedBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({ message: 'Blog updated successfully' });
            
        } catch (error) {
            console.error('Update blog error:', error);
            res.status(500).json({ error: 'Failed to update blog' });
        }
    }
);

// Delete blog
router.delete('/blogs/:blogId', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        const blogId = req.params.blogId;
        
        // Check if blog exists
        const blogDoc = await admin.firestore()
            .collection('blogs')
            .doc(blogId)
            .get();
        
        if (!blogDoc.exists) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blogData = blogDoc.data();
        
        // Delete associated image file if exists
        if (blogData.image && blogData.image.startsWith('/uploads/')) {
            try {
                const imagePath = path.join(__dirname, '../public', blogData.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (fileError) {
                console.error('Failed to delete image file:', fileError);
                // Continue with blog deletion even if file deletion fails
            }
        }
        
        // Delete blog from Firestore
        await admin.firestore()
            .collection('blogs')
            .doc(blogId)
            .delete();
        
        // Log blog deletion
        await logSecurityEvent('BLOG_DELETED', {
            blogId: blogId,
            blogTitle: blogData.title,
            deletedBy: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ message: 'Blog deleted successfully' });
        
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// Upload blog image
router.post('/blogs/:blogId/upload-image', 
    uploadLimiter, 
    verifyAdminToken, 
    upload.single('image'),
    secureFileUpload,
    async (req, res) => {
        try {
            const blogId = req.params.blogId;
            
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            // Check if blog exists
            const blogDoc = await admin.firestore()
                .collection('blogs')
                .doc(blogId)
                .get();
            
            if (!blogDoc.exists) {
                // Clean up uploaded file if blog doesn't exist
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Blog not found' });
            }
            
            const blogData = blogDoc.data();
            
            // Delete old image if exists
            if (blogData.image && blogData.image.startsWith('/uploads/')) {
                try {
                    const oldImagePath = path.join(__dirname, '../public', blogData.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (fileError) {
                    console.error('Failed to delete old image file:', fileError);
                }
            }
            
            // Update blog with new image path
            const imagePath = '/uploads/admin/' + req.file.filename;
            
            await admin.firestore()
                .collection('blogs')
                .doc(blogId)
                .update({
                    image: imagePath,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: req.admin.id
                });
            
            // Log image upload
            await logSecurityEvent('BLOG_IMAGE_UPLOADED', {
                blogId: blogId,
                fileName: req.file.filename,
                fileSize: req.file.size,
                uploadedBy: req.admin.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            res.json({
                message: 'Image uploaded successfully',
                imagePath: imagePath
            });
            
        } catch (error) {
            console.error('Upload image error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Failed to clean up uploaded file:', cleanupError);
                }
            }
            
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }
);

// Maintenance Mode Management Routes

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
    res.json({ message: 'Admin routes are working', session: req.session?.isLoggedIn || false });
});

// Get maintenance mode status (public endpoint)
router.get('/maintenance/status', async (req, res) => {
    console.log('Maintenance status route hit');
    try {
        const status = isMaintenanceMode();
        console.log('Maintenance status:', status);
        
        res.json({
            enabled: status,
            message: status ? 'System is under maintenance' : 'System is operating normally'
        });
    } catch (error) {
        console.error('Get maintenance status error:', error);
        res.status(500).json({ error: 'Failed to get maintenance status' });
    }
});

// Toggle maintenance mode
router.post('/maintenance/toggle', async (req, res) => {
    console.log('Maintenance toggle route hit - Session:', req.session?.isAuthenticated);
    try {
        // Check if user is logged in via session
        if (!req.session?.isAuthenticated) {
            console.log('Access denied - not logged in');
            return res.status(401).json({ error: 'Access denied. Please login.' });
        }
        
        const { enable } = req.body;
        console.log('Toggle request - enable:', enable);
        
        // Refresh session to prevent timeout
        if (req.session) {
            req.session.touch();
            req.session.lastActivity = new Date().getTime();
        }
        
        const result = toggleMaintenance(enable);
        console.log('Toggle result:', result);
        
        // Log maintenance mode toggle
        await logSecurityEvent('MAINTENANCE_MODE_TOGGLED', {
            enabled: enable,
            toggledBy: req.session.user,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({
            success: true,
            maintenanceMode: result.maintenanceMode,
            message: enable ? 'Maintenance mode enabled' : 'Maintenance mode disabled'
        });
    } catch (error) {
        console.error('Toggle maintenance mode error:', error);
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
});

module.exports = router;
