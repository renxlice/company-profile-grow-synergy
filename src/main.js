const express = require('express');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// CONSOLE LOG UNTUK VERIFIKASI FILE DIGUNAKAN
console.log('=== MAIN.JS LOADED ===');
console.log('Current time:', new Date().toISOString());
console.log('Working directory:', __dirname);

const { setupSecurity } = require('./middleware/security');
const { maintenanceMiddleware } = require('./middleware/maintenance');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads/admin');
        
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

// Setup security middleware
const generalLimiter = setupSecurity(app);

// Session middleware
app.use(session({
    secret: 'grow-synergy-admin-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Maintenance mode middleware
app.use(maintenanceMiddleware);

// Remove any existing CSP headers to allow external resources
app.use((req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    next();
});

// Debug route - paling awal untuk testing
app.get('/debug', (req, res) => {
    console.log('DEBUG ROUTE HIT!');
    res.json({ 
        message: 'Debug route working!', 
        timestamp: new Date().toISOString(),
        port: PORT,
        method: req.method,
        url: req.url
    });
});

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with security headers
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: '1d', // Cache for 1 day
    etag: true
}));

// Serve JS files specifically with proper MIME types
app.use('/js', express.static(path.join(__dirname, 'public', 'js'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Ensure JavaScript files have correct MIME type
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// Serve other static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Set proper MIME types
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        
        // Security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// Routes
app.use('/home', require('./routes/index'));
app.use('/about', require('./routes/about'));
app.use('/synergy-academy', require('./routes/synergy-academy'));
app.use('/synergy-experts', require('./routes/synergy-experts'));
app.use('/synergy-portfolio', require('./routes/synergy-portfolio'));

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// Simple test route to verify server is responding
app.get('/api/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Log all registered routes for debugging
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log('Route:', r.route.path, 'Methods:', Object.keys(r.route.methods));
    }
});

// Admin login page route (handle form submission)
app.post('/admin/login', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', { username, password });
        console.log('Session object:', req.session);
        
        // Firebase Auth dengan Firestore
        const admin = require('firebase-admin');
        const bcrypt = require('bcryptjs');
        
        // Find admin in Firestore (sama seperti adminAuth.js)
        const adminSnapshot = await admin.firestore()
            .collection('admins')
            .where('email', '==', username)
            .limit(1)
            .get();
        
        if (adminSnapshot.empty) {
            console.log('Admin not found for email:', username);
            return res.render('admin/login', { 
                title: 'Admin Login',
                error: 'Invalid credentials' 
            });
        }
        
        const adminDoc = adminSnapshot.docs[0];
        const adminData = adminDoc.data();
        
        console.log('Admin found:', { email: adminData.email, isActive: adminData.isActive });
        
        // Check if admin is active
        if (!adminData.isActive) {
            console.log('Admin account is deactivated');
            return res.render('admin/login', { 
                title: 'Admin Login',
                error: 'Account is deactivated' 
            });
        }
        
        // Verify password dengan bcrypt (sama seperti adminAuth.js)
        const isPasswordValid = await bcrypt.compare(password, adminData.password);
        
        console.log('Password verification result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password for admin:', username);
            return res.render('admin/login', { 
                title: 'Admin Login',
                error: 'Invalid credentials' 
            });
        }
        
        console.log('Login successful for admin:', username);
        
        // Create session dengan data dari Firestore
        req.session = req.session || {};
        req.session.isLoggedIn = true;
        req.session.adminId = adminDoc.id;
        req.session.adminEmail = adminData.email;
        req.session.adminName = adminData.name;
        req.session.adminRole = adminData.role || 'admin';
        
        // Update last login (sama seperti adminAuth.js)
        await admin.firestore()
            .collection('admins')
            .doc(adminDoc.id)
            .update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                lastLoginIP: req.ip
            });
        
        // Redirect to dashboard
        res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', { 
            title: 'Admin Login',
            error: 'Login failed' 
        });
    }
});

// Admin login page route
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { title: 'Admin Login' });
});

// Firebase login callback route
app.post('/admin/firebase-login', express.json(), async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;
        
        console.log('Firebase login callback:', { uid, email, displayName });
        
        // Create session dengan Firebase user data
        req.session = req.session || {};
        req.session.isLoggedIn = true;
        req.session.adminId = uid;
        req.session.adminEmail = email;
        req.session.adminName = displayName || 'Admin User';
        req.session.adminRole = 'super_admin';
        req.session.adminUID = uid;
        req.session.photoURL = photoURL;
        
        console.log('Session created:', req.session);
        
        res.json({ success: true, message: 'Login successful' });
        
    } catch (error) {
        console.error('Firebase login callback error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Admin dashboard route
app.get('/admin/dashboard', (req, res) => {
    if (!req.session?.isLoggedIn) {
        return res.redirect('/admin/login');
    }
    
    // Generate CSRF token
    const crypto = require('crypto');
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    res.render('admin/dashboard', { 
        title: 'Admin Dashboard',
        username: req.session.adminName || 'Admin',
        csrfToken: csrfToken
    });
});

// Admin testimonials page route
app.get('/admin/testimonials', (req, res) => {
    if (!req.session?.isLoggedIn) {
        return res.redirect('/admin/login');
    }
    res.render('admin/testimonials', { 
        title: 'Manajemen Testimoni',
        layout: false // Using custom layout in the template
    });
});

// Admin blogs page route
app.get('/admin/blogs', (req, res) => {
    if (!req.session?.isLoggedIn) {
        return res.redirect('/admin/login');
    }
    res.render('admin/blogs', { 
        title: 'Blog Management - Admin',
        username: req.session.adminName || 'Admin'
    });
});

// Admin blogs form page route (create/edit)
app.get('/admin/blogs/create', (req, res) => {
    if (!req.session?.isLoggedIn) {
        return res.redirect('/admin/login');
    }
    res.render('admin/blogs-form', { 
        title: 'Create Article - Admin',
        username: req.session.adminName || 'Admin',
        item: null
    });
});

app.get('/admin/blogs/edit/:id', (req, res) => {
    if (!req.session?.isLoggedIn) {
        return res.redirect('/admin/login');
    }
    // For now, render the form without data (the API will fetch the data)
    res.render('admin/blogs-form', { 
        title: 'Edit Article - Admin',
        username: req.session.adminName || 'Admin',
        item: { id: req.params.id } // Pass the ID for the form action
    });
});

// Handle blog update form submission
app.post('/admin/blogs/update/:id', upload.single('image'), express.urlencoded({ extended: true }), express.json(), async (req, res) => {
    try {
        if (!req.session?.isLoggedIn) {
            return res.redirect('/admin/login');
        }

        const admin = require('firebase-admin');
        const blogId = req.params.id;
        const updateData = req.body;

        // Handle image upload
        if (req.file) {
            updateData.image = '/uploads/admin/' + req.file.filename;
        }

        // Parse tags if provided
        if (updateData.tags) {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Add update metadata
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updateData.updatedBy = req.session.adminId;

        // Update blog in Firestore
        await admin.firestore()
            .collection('blogs')
            .doc(blogId)
            .update(updateData);

        console.log('Blog updated successfully:', blogId);
        res.redirect('/admin/blogs');
        
    } catch (error) {
        console.error('Error updating blog:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Failed to clean up uploaded file:', cleanupError);
            }
        }
        
        res.render('admin/blogs-form', {
            title: 'Edit Article - Admin',
            username: req.session.adminName || 'Admin',
            item: { ...req.body, id: req.params.id },
            error: 'Failed to update blog: ' + error.message
        });
    }
});

// Handle blog create form submission
app.post('/admin/blogs/create', upload.single('image'), express.urlencoded({ extended: true }), express.json(), async (req, res) => {
    try {
        if (!req.session?.isLoggedIn) {
            return res.redirect('/admin/login');
        }

        const admin = require('firebase-admin');
        const { title, slug, excerpt, content, author, tags, published } = req.body;
        
        // Generate slug if not provided
        const blogSlug = slug || title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Parse tags
        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        // Handle image upload
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/admin/' + req.file.filename;
        }
        
        // Create blog data
        const blogData = {
            title: title,
            slug: blogSlug,
            excerpt: excerpt || '',
            content: content,
            author: author,
            tags: parsedTags,
            image: imagePath,
            published: published || false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.session.adminId
        };
        
        const blogRef = await admin.firestore()
            .collection('blogs')
            .add(blogData);
        
        console.log('Blog created successfully:', blogRef.id);
        res.redirect('/admin/blogs');
        
    } catch (error) {
        console.error('Error creating blog:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Failed to clean up uploaded file:', cleanupError);
            }
        }
        
        res.render('admin/blogs-form', {
            title: 'Create Article - Admin',
            username: req.session.adminName || 'Admin',
            item: req.body,
            error: 'Failed to create blog: ' + error.message
        });
    }
});

// Initialize Firebase Admin SDK with fallback
let db = null;
try {
    const admin = require('firebase-admin');
    const serviceAccount = require('./config/company-profile-grow-synergy-firebase-adminsdk-fbsvc-ecfa344bdd.json');
    
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://company-profile-grow-synergy-default-rtdb.firebaseio.com",
            storageBucket: "company-profile-grow-synergy.appspot.com"
        });
    }
    
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.warn('⚠️  Firebase Admin SDK initialization failed, using mock data:', error.message);
    db = null;
}

// API routes for public data
app.get('/api/hero-section', async (req, res) => {
    try {
        const page = req.query.page || 'home';
        
        if (db) {
            // Use Firestore if available
            const heroSnapshot = await db
                .collection('hero_sections')
                .where('page', '==', page)
                .where('isActive', '==', true)
                .limit(1)
                .get();
            
            if (heroSnapshot.empty) {
                return res.json([]);
            }
            
            const heroDoc = heroSnapshot.docs[0];
            const heroData = heroDoc.data();
            
            return res.json([{
                id: heroDoc.id,
                backgroundImage: heroData.backgroundImage || '/images/hero-background.jpg'
                // Hanya background image yang dinamis, text lainnya statis
            }]);
        } else {
            // Fallback to mock data - same data for all pages
            const mockHeroData = {
                home: {
                    id: 'mock-hero-home',
                    backgroundImage: '/images/hero-background.jpg'
                    // Hanya background image yang dinamis, text lainnya statis
                },
                about: {
                    id: 'mock-hero-about',
                    backgroundImage: '/images/hero-background.jpg'
                },
                synergy_experts: {
                    id: 'mock-hero-experts',
                    backgroundImage: '/images/hero-background.jpg'
                },
                synergy_academy: {
                    id: 'mock-hero-academy',
                    backgroundImage: '/images/hero-background.jpg'
                },
                synergy_portfolio: {
                    id: 'mock-hero-portfolio',
                    backgroundImage: '/images/hero-background.jpg'
                }
            };
            
            const heroData = mockHeroData[page] || mockHeroData.home;
            return res.json([heroData]);
        }
        
    } catch (error) {
        console.error('Get hero section error:', error);
        res.status(500).json({ error: 'Failed to get hero section' });
    }
});

// Get experts for public pages
app.get('/api/experts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        if (db) {
            // Use Firestore if available
            const expertsSnapshot = await db
                .collection('experts')
                .orderBy('createdAt', 'desc')
                .limit(limit)
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
                    image: expertData.image
                });
            });
            
            return res.json(experts);
        } else {
            // Fallback to mock data
            const mockExperts = [
                {
                    id: 'expert1',
                    name: 'Dr. Ahmad Wijaya, M.Sc.',
                    position: 'Senior Data Analyst',
                    experience: '15+ Tahun Pengalaman di bidang data science dan machine learning',
                    description: 'Expert dalam data analitik dengan pengalaman 15+ tahun di perusahaan Fortune 500. Spesialis dalam machine learning dan statistical modeling.',
                    rating: 4.9,
                    reviewCount: 1250,
                    image: 'https://picsum.photos/seed/expert1/300/300.jpg'
                },
                {
                    id: 'expert2',
                    name: 'Sarah Putri, S.Kom., M.T.',
                    position: 'Data Science Lead',
                    experience: '12+ Tahun Pengalaman',
                    description: 'Data Science Lead dengan 12+ tahun pengalaman. Spesialis dalam Python programming dan data visualization.',
                    rating: 4.8,
                    reviewCount: 960,
                    image: 'https://picsum.photos/seed/expert2/300/300.jpg'
                },
                {
                    id: 'expert3',
                    name: 'Budi Santoso, S.E., M.M.',
                    position: 'Business Intelligence Expert',
                    experience: '10+ Tahun Pengalaman',
                    description: 'Business Intelligence Expert dengan 10+ tahun pengalaman. Expert dalam business intelligence dan dashboard development.',
                    rating: 4.7,
                    reviewCount: 650,
                    image: 'https://picsum.photos/seed/expert3/300/300.jpg'
                },
                {
                    id: 'expert4',
                    name: 'Andi Pratama, S.Kom.',
                    position: 'Full Stack Developer',
                    experience: '8+ Tahun Pengalaman',
                    description: 'Full Stack Developer dengan 8+ tahun pengalaman. Expert dalam web development dan mobile applications.',
                    rating: 4.6,
                    reviewCount: 580,
                    image: 'https://picsum.photos/seed/expert4/300/300.jpg'
                }
            ];
            
            const limitedExperts = mockExperts.slice(0, limit);
            return res.json(limitedExperts);
        }
        
    } catch (error) {
        console.error('Get experts error:', error);
        res.status(500).json({ error: 'Failed to get experts' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        firebase: db ? 'connected' : 'using mock data'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n=== SERVER STARTED ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Firebase Status: ${db ? 'Connected' : 'Using Mock Data'}`);
    console.log(`Current time: ${new Date().toISOString()}`);
    
    console.log(`\n=== IMPORTANT ROUTES ===`);
    console.log(`  GET  /debug - Debug route`);
    console.log(`  GET  /api/admin/maintenance/status - Maintenance status`);
    console.log(`  POST /api/admin/maintenance/toggle - Toggle maintenance`);
    console.log(`  GET  /api/test - Test route`);
    
    console.log(`\n=== ALL REGISTERED ROUTES ===`);
    app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
            console.log(`  ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
        }
    });
    console.log(`=== ROUTE REGISTRATION COMPLETE ===\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
