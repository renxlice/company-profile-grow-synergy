/**
 * CSRF Protection Middleware
 */

const crypto = require('crypto');

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
    try {
        // Skip CSRF for GET, HEAD, OPTIONS requests
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            // Generate and set CSRF token for safe requests
            const token = generateCSRFToken();
            csrfTokens.set(token, {
                createdAt: Date.now(),
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
            
            // Set token in response header and cookie
            res.set('X-CSRF-Token', token);
            res.cookie('csrf-token', token, {
                httpOnly: false, // Allow JavaScript access
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000 // 1 hour
            });
            
            // Also make available to templates
            if (res.locals) {
                res.locals.csrfToken = token;
            }
            
            return next();
        }
        
        // For state-changing requests, validate CSRF token
        const tokenFromHeader = req.get('X-CSRF-Token');
        const tokenFromBody = req.body?.csrfToken;
        const tokenFromCookie = req.cookies?.['csrf-token'];
        
        const token = tokenFromHeader || tokenFromBody || tokenFromCookie;
        
        if (!token) {
            return res.status(403).json({
                error: 'CSRF token missing'
            });
        }
        
        const tokenData = csrfTokens.get(token);
        
        if (!tokenData) {
            return res.status(403).json({
                error: 'Invalid CSRF token'
            });
        }
        
        // Check token age (1 hour expiry)
        if (Date.now() - tokenData.createdAt > 60 * 60 * 1000) {
            csrfTokens.delete(token);
            return res.status(403).json({
                error: 'CSRF token expired'
            });
        }
        
        // Optional: Check if user agent matches (additional security)
        if (tokenData.userAgent !== req.get('User-Agent')) {
            csrfTokens.delete(token);
            return res.status(403).json({
                error: 'CSRF token validation failed'
            });
        }
        
        // Clean up old tokens periodically
        cleanupOldTokens();
        
        next();
        
    } catch (error) {
        console.error('CSRF protection error:', error);
        res.status(500).json({
            error: 'CSRF validation failed'
        });
    }
};

// Clean up old tokens (older than 1 hour)
const cleanupOldTokens = () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [token, data] of csrfTokens.entries()) {
        if (now - data.createdAt > oneHour) {
            csrfTokens.delete(token);
        }
    }
};

// Periodic cleanup every 30 minutes
setInterval(cleanupOldTokens, 30 * 60 * 1000);

// Generate token for API usage
const generateToken = (req, res) => {
    const token = generateCSRFToken();
    csrfTokens.set(token, {
        createdAt: Date.now(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    
    return token;
};

// Validate token manually
const validateToken = (token, req) => {
    const tokenData = csrfTokens.get(token);
    
    if (!tokenData) {
        return false;
    }
    
    // Check token age
    if (Date.now() - tokenData.createdAt > 60 * 60 * 1000) {
        csrfTokens.delete(token);
        return false;
    }
    
    // Check user agent
    if (tokenData.userAgent !== req.get('User-Agent')) {
        csrfTokens.delete(token);
        return false;
    }
    
    return true;
};

module.exports = {
    csrfProtection,
    generateToken,
    validateToken,
    generateCSRFToken
};
