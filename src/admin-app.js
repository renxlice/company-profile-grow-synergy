const express = require('express');
const path = require('path');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoutes');
const {
    adminSecurityMiddleware,
    csrfProtection,
    sanitizeInput
} = require('./common/middleware/admin-security-middleware');

// Apply security middleware to all admin routes
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply security middleware to admin routes
app.use('/admin', adminSecurityMiddleware);
app.use('/admin', csrfProtection);
app.use('/admin', sanitizeInput);

// Admin authentication routes
app.use('/admin/auth', adminAuthRoutes);

// Admin dashboard and management routes
app.use('/admin', adminRoutes);

// Serve static files with proper MIME types and security headers
app.use('/public', express.static(path.join(__dirname, 'public'), {
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

// Serve JS files specifically (for admin-security.js)
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Security error:', err);
    
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    res.status(err.status || 500).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
