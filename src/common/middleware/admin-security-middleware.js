const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const validator = require('validator');

// Enhanced security middleware for all admin routes
const adminSecurityMiddleware = (req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy - Completely disabled to allow external CSS/JS resources
    // CSP is causing blocking issues with Tailwind CSS and Font Awesome
    // In production, consider implementing proper CSP with correct domains
    
    next();
};

// Rate limiting for admin routes
const adminRouteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for static assets
        return req.url.includes('/css/') || req.url.includes('/js/') || req.url.includes('/images/');
    }
});

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
    // Generate CSRF token for GET requests
    if (req.method === 'GET') {
        const crypto = require('crypto');
        const csrfToken = crypto.randomBytes(32).toString('hex');
        res.locals.csrfToken = csrfToken;
        res.cookie('csrf-token', csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }
    
    // Validate CSRF token for POST/PUT/DELETE requests
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        const cookieToken = req.cookies?.['csrf-token'];
        
        if (!token || !cookieToken || token !== cookieToken) {
            return res.status(403).json({ 
                error: 'Invalid CSRF token' 
            });
        }
    }
    
    next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    // Remove potentially dangerous characters
                    req.body[key] = validator.escape(req.body[key].trim());
                    
                    // Additional validation for specific fields
                    if (key.includes('email') && req.body[key]) {
                        if (!validator.isEmail(req.body[key])) {
                            return res.status(400).json({ 
                                error: `Invalid email format for ${key}` 
                            });
                        }
                    }
                    
                    if (key.includes('url') && req.body[key]) {
                        if (!validator.isURL(req.body[key])) {
                            return res.status(400).json({ 
                                error: `Invalid URL format for ${key}` 
                            });
                        }
                    }
                }
            });
        }
        
        // Sanitize query parameters
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = validator.escape(req.query[key].trim());
                }
            });
        }
        
        next();
    } catch (error) {
        console.error('Input sanitization error:', error);
        res.status(500).json({ error: 'Input processing error' });
    }
};

// SQL Injection prevention middleware
const preventSQLInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\#|\/\*|\*\/)/g,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(\b(OR|AND)\s+\'\w+\'\s*=\s*\'\w+\')/gi,
        /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi
    ];
    
    const checkForSQLInjection = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                for (const pattern of sqlPatterns) {
                    if (pattern.test(obj[key])) {
                        console.warn('Potential SQL injection detected:', { key, value: obj[key] });
                        return true;
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkForSQLInjection(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };
    
    // Check request body
    if (req.body && checkForSQLInjection(req.body)) {
        return res.status(400).json({ 
            error: 'Invalid input detected' 
        });
    }
    
    // Check query parameters
    if (req.query && checkForSQLInjection(req.query)) {
        return res.status(400).json({ 
            error: 'Invalid query parameters' 
        });
    }
    
    next();
};

// XSS prevention middleware
const preventXSS = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
    ];
    
    const checkForXSS = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                for (const pattern of xssPatterns) {
                    if (pattern.test(obj[key])) {
                        console.warn('Potential XSS detected:', { key, value: obj[key] });
                        return true;
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkForXSS(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };
    
    // Check request body
    if (req.body && checkForXSS(req.body)) {
        return res.status(400).json({ 
            error: 'Invalid content detected' 
        });
    }
    
    // Check query parameters
    if (req.query && checkForXSS(req.query)) {
        return res.status(400).json({ 
            error: 'Invalid query parameters' 
        });
    }
    
    next();
};

// Apply security middleware to all admin routes
router.use(adminSecurityMiddleware);
router.use(adminRouteLimiter);
router.use(mongoSanitize());
router.use(helmet({
    contentSecurityPolicy: false, // Disable CSP to avoid conflicts
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply input validation and sanitization to all routes
router.use(sanitizeInput);
router.use(preventSQLInjection);
router.use(preventXSS);

module.exports = {
    adminSecurityMiddleware,
    adminRouteLimiter,
    csrfProtection,
    sanitizeInput,
    preventSQLInjection,
    preventXSS
};
