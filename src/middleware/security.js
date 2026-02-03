const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const createRateLimiter = (type) => {
    const configs = {
        admin: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // reduced from 200 to 100
            message: { error: 'Too many admin requests, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true
        },
        upload: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // limit each IP to 10 uploads per windowMs
            message: { error: 'Too many upload attempts, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false
        },
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 3, // reduced from 5 to 3 for stricter security
            message: { error: 'Too many login attempts, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true
        },
        password: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3, // limit password change attempts
            message: { error: 'Too many password change attempts, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false
        }
    };
    
    return rateLimit(configs[type] || configs.admin);
};

const validateInput = (config = {}) => {
    return (req, res, next) => {
        try {
            // Basic input validation and sanitization
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    if (typeof req.body[key] === 'string') {
                        // Remove potential XSS and injection patterns
                        let value = req.body[key];
                        
                        // Trim whitespace
                        value = value.trim();
                        
                        // Remove null bytes
                        value = value.replace(/\0/g, '');
                        
                        // Limit length to prevent buffer overflow
                        if (value.length > 2000) {
                            return res.status(400).json({ 
                                error: 'Input too long' 
                            });
                        }
                        
                        // Basic XSS pattern detection
                        const xssPatterns = [
                            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                            /javascript:/gi,
                            /on\w+\s*=/gi,
                            /<iframe/gi,
                            /<object/gi,
                            /<embed/gi
                        ];
                        
                        for (const pattern of xssPatterns) {
                            if (pattern.test(value)) {
                                console.warn('XSS pattern detected:', { key, value: value.substring(0, 100), ip: req.ip });
                                return res.status(400).json({ 
                                    error: 'Invalid input detected' 
                                });
                            }
                        }
                        
                        req.body[key] = value;
                    }
                });
            }
            next();
        } catch (error) {
            console.error('Input validation error:', error);
            res.status(500).json({ error: 'Validation error' });
        }
    };
};

const secureFileUpload = (req, res, next) => {
    try {
        // Enhanced file upload security checks
        if (req.files) {
            const allowedMimeTypes = [
                'image/jpeg',
                'image/png', 
                'image/gif',
                'image/webp',
                'application/pdf'
            ];
            
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            
            Object.keys(req.files).forEach(key => {
                const file = req.files[key];
                
                // Check file size
                if (file.size > maxFileSize) {
                    return res.status(400).json({
                        error: 'File too large. Maximum size is 5MB'
                    });
                }
                
                // Check MIME type
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return res.status(400).json({
                        error: 'Invalid file type. Only images and PDFs are allowed'
                    });
                }
                
                // Check file extension
                const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
                const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
                
                if (!allowedExtensions.includes(fileExtension)) {
                    return res.status(400).json({
                        error: 'Invalid file extension'
                    });
                }
                
                // Sanitize filename
                const sanitizedFilename = file.name
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                    .replace(/_{2,}/g, '_')
                    .toLowerCase();
                
                file.name = sanitizedFilename;
            });
        }
        
        next();
    } catch (error) {
        console.error('File upload security error:', error);
        res.status(500).json({ error: 'File validation failed' });
    }
};

const logSecurityEvent = async (eventType, details) => {
    try {
        // Enhanced security logging
        const logEntry = {
            eventType,
            details: {
                ...details,
                timestamp: new Date().toISOString(),
                userAgent: details.userAgent || 'unknown',
                ip: details.ip || 'unknown'
            },
            severity: getSeverityLevel(eventType)
        };
        
        console.log(`Security Event [${logEntry.severity}]: ${eventType}`, logEntry);
        
        // In production, you would send this to a logging service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement production logging service integration
            // await sendToLoggingService(logEntry);
        }
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
};

const getSeverityLevel = (eventType) => {
    const highSeverityEvents = ['LOGIN_FAILED', 'BRUTE_FORCE_ATTEMPT', 'XSS_ATTEMPT', 'SQL_INJECTION_ATTEMPT'];
    const mediumSeverityEvents = ['AUTO_LOGOUT', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED'];
    
    if (highSeverityEvents.includes(eventType)) return 'HIGH';
    if (mediumSeverityEvents.includes(eventType)) return 'MEDIUM';
    return 'LOW';
};

const setupSecurity = (app) => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.NODE_ENV;
    
    // Apply helmet for security headers with enhanced configuration
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                manifestSrc: ["'self'"]
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));

    // Apply mongo sanitize
    app.use(mongoSanitize());

    // General rate limiting with stricter settings
    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // reduced from 1000 to 500
        message: {
            error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
    });

    app.use(generalLimiter);

    // Add request timeout
    app.use((req, res, next) => {
        req.setTimeout(30000); // 30 second timeout
        res.setTimeout(30000);
        next();
    });

    return generalLimiter;
};

module.exports = {
    setupSecurity,
    createRateLimiter,
    validateInput,
    secureFileUpload,
    logSecurityEvent
};
