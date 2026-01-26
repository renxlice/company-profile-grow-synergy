const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const { setupSecurity } = require('./middleware/security');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

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

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

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
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Firebase Status: ${db ? 'Connected' : 'Using Mock Data'}`);
    console.log(`Available routes:`);
    console.log(`  GET  / - Home page`);
    console.log(`  GET  /about - About page`);
    console.log(`  GET  /synergy-academy - Academy page`);
    console.log(`  GET  /synergy-experts - Experts page`);
    console.log(`  GET  /synergy-portfolio - Portfolio page`);
    console.log(`  GET  /api/hero-section - Hero section API`);
    console.log(`  GET  /api/experts - Experts API`);
    console.log(`  POST /api/admin/auth/login - Admin login`);
    console.log(`  POST /api/admin/auth/create-admin - Create admin`);
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
