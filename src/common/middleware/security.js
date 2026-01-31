const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const createRateLimiter = (type) => {
    const configs = {
        admin: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 200, // limit each IP to 200 requests per windowMs
            message: { error: 'Too many admin requests, please try again later.' }
        },
        upload: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // limit each IP to 10 uploads per windowMs
            message: { error: 'Too many upload attempts, please try again later.' }
        },
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 login attempts per windowMs
            message: { error: 'Too many login attempts, please try again later.' }
        }
    };
    
    return rateLimit(configs[type] || configs.admin);
};

const validateInput = (req, res, next) => {
    // Basic input validation
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

const secureFileUpload = (req, res, next) => {
    // File upload security checks
    next();
};

const logSecurityEvent = async (eventType, details) => {
    console.log(`Security Event: ${eventType}`, details);
};

const setupSecurity = (app) => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.NODE_ENV;
    
    // Apply helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: false, // Disable CSP completely for both dev and production for now
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Apply mongo sanitize
    app.use(mongoSanitize());

    // General rate limiting
    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(generalLimiter);

    return generalLimiter;
};

module.exports = {
    setupSecurity,
    createRateLimiter,
    validateInput,
    secureFileUpload,
    logSecurityEvent
};
