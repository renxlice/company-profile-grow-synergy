const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

// Security middleware
router.use(helmet());
router.use(mongoSanitize());

// Rate limiting untuk login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting untuk admin operations
const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many admin operations, please try again later.',
        retryAfter: '1 hour'
    }
});

// Input validation and sanitization
const validateAndSanitizeInput = (req, res, next) => {
    try {
        // Sanitize semua input
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = validator.escape(req.body[key].trim());
                }
            });
        }
        
        // Validate email format
        if (req.body.email && !validator.isEmail(req.body.email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Validate password strength
        if (req.body.password) {
            const password = req.body.password;
            if (password.length < 8) {
                return res.status(400).json({ 
                    error: 'Password must be at least 8 characters long' 
                });
            }
            if (!validator.isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })) {
                return res.status(400).json({ 
                    error: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character' 
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Input validation error:', error);
        res.status(500).json({ error: 'Validation error' });
    }
};

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
        
        // Check last login time (optional: force re-login after certain time)
        const lastLogin = adminData.lastLogin?.toDate();
        const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours
        
        if (lastLogin && (Date.now() - lastLogin.getTime()) > maxSessionTime) {
            return res.status(401).json({ 
                error: 'Session expired. Please login again.' 
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

// Admin login route dengan security
router.post('/login', loginLimiter, validateAndSanitizeInput, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Log login attempt (tanpa sensitive data)
        console.log('Login attempt for:', email);
        
        // Find admin in Firestore
        const adminSnapshot = await admin.firestore()
            .collection('admins')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (adminSnapshot.empty) {
            // Log failed attempt
            await logSecurityEvent('LOGIN_FAILED', {
                email: email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                reason: 'Admin not found'
            });
            
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }
        
        const adminDoc = adminSnapshot.docs[0];
        const adminData = adminDoc.data();
        
        // Check if admin is active
        if (!adminData.isActive) {
            await logSecurityEvent('LOGIN_FAILED', {
                email: email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                reason: 'Account deactivated'
            });
            
            return res.status(401).json({ 
                error: 'Account is deactivated' 
            });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, adminData.password);
        
        if (!isPasswordValid) {
            // Log failed attempt
            await logSecurityEvent('LOGIN_FAILED', {
                email: email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                reason: 'Invalid password'
            });
            
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: adminDoc.id,
                email: adminData.email,
                role: adminData.role || 'admin'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { 
                expiresIn: '24h',
                issuer: 'grow-synergy-admin'
            }
        );
        
        // Update last login
        await admin.firestore()
            .collection('admins')
            .doc(adminDoc.id)
            .update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                lastLoginIP: req.ip
            });
        
        // Log successful login
        await logSecurityEvent('LOGIN_SUCCESS', {
            email: email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        // Return success response (tanpa sensitive data)
        res.json({
            message: 'Login successful',
            token: token,
            admin: {
                id: adminDoc.id,
                email: adminData.email,
                name: adminData.name,
                role: adminData.role || 'admin'
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        await logSecurityEvent('LOGIN_ERROR', {
            error: error.message,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(500).json({ error: 'Login failed' });
    }
});

// Create admin account (super admin only)
router.post('/create-admin', adminLimiter, verifyAdminToken, validateAndSanitizeInput, async (req, res) => {
    try {
        const { email, password, name, role = 'admin' } = req.body;
        
        // Check if requester is super admin
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({ 
                error: 'Only super admin can create admin accounts' 
            });
        }
        
        // Check if admin already exists
        const existingAdmin = await admin.firestore()
            .collection('admins')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (!existingAdmin.empty) {
            return res.status(400).json({ 
                error: 'Admin with this email already exists' 
            });
        }
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create admin account
        const adminData = {
            email: email,
            password: hashedPassword,
            name: name,
            role: role,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.admin.id
        };
        
        const adminRef = await admin.firestore()
            .collection('admins')
            .add(adminData);
        
        // Log admin creation
        await logSecurityEvent('ADMIN_CREATED', {
            newAdminEmail: email,
            createdBy: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.status(201).json({
            message: 'Admin account created successfully',
            adminId: adminRef.id
        });
        
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin account' });
    }
});

// Change password
router.post('/change-password', adminLimiter, verifyAdminToken, validateAndSanitizeInput, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get current admin data
        const adminDoc = await admin.firestore()
            .collection('admins')
            .doc(req.admin.id)
            .get();
        
        const adminData = adminDoc.data();
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminData.password);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                error: 'Current password is incorrect' 
            });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        await admin.firestore()
            .collection('admins')
            .doc(req.admin.id)
            .update({
                password: hashedNewPassword,
                passwordChangedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        
        // Log password change
        await logSecurityEvent('PASSWORD_CHANGED', {
            email: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Logout (invalidate token on client side)
router.post('/logout', verifyAdminToken, async (req, res) => {
    try {
        // Log logout
        await logSecurityEvent('LOGOUT', {
            email: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ message: 'Logout successful' });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Security logging function
async function logSecurityEvent(eventType, details) {
    try {
        await admin.firestore()
            .collection('security_logs')
            .add({
                eventType: eventType,
                details: details,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                ip: details.ip || 'unknown',
                userAgent: details.userAgent || 'unknown'
            });
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

// Get security logs (super admin only)
router.get('/security-logs', adminLimiter, verifyAdminToken, async (req, res) => {
    try {
        // Check if requester is super admin
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({ 
                error: 'Only super admin can view security logs' 
            });
        }
        
        const limit = parseInt(req.query.limit) || 100;
        const logs = await admin.firestore()
            .collection('security_logs')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        const logData = logs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));
        
        res.json({ logs: logData });
        
    } catch (error) {
        console.error('Get security logs error:', error);
        res.status(500).json({ error: 'Failed to get security logs' });
    }
});

module.exports = router;
