/**
 * Enhanced Session Management Middleware
 */

const crypto = require('crypto');
const admin = require('firebase-admin');

// Session store (in production, use Redis or database)
const sessions = new Map();

// Session configuration
const SESSION_CONFIG = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    cookieName: 'admin-session',
    secureCookie: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
};

// Generate secure session ID
const generateSessionId = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create new session
const createSession = async (adminData, req) => {
    try {
        const sessionId = generateSessionId();
        const sessionData = {
            id: sessionId,
            adminId: adminData.id,
            email: adminData.email,
            role: adminData.role,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            isActive: true
        };
        
        // Store session
        sessions.set(sessionId, sessionData);
        
        // Log session creation
        await logSecurityEvent('SESSION_CREATED', {
            sessionId: sessionId.substring(0, 8) + '...',
            adminId: adminData.id,
            email: adminData.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return sessionId;
    } catch (error) {
        console.error('Session creation error:', error);
        throw error;
    }
};

// Session middleware
const sessionMiddleware = (req, res, next) => {
    try {
        // Get session ID from cookie or header
        const sessionId = req.cookies?.[SESSION_CONFIG.cookieName] || 
                         req.get('Authorization')?.replace('Bearer ', '');
        
        if (!sessionId) {
            req.session = null;
            return next();
        }
        
        const sessionData = sessions.get(sessionId);
        
        if (!sessionData) {
            // Invalid session - clear cookie
            res.clearCookie(SESSION_CONFIG.cookieName);
            req.session = null;
            return next();
        }
        
        // Check session age
        if (Date.now() - sessionData.createdAt > SESSION_CONFIG.maxAge) {
            sessions.delete(sessionId);
            res.clearCookie(SESSION_CONFIG.cookieName);
            req.session = null;
            return next();
        }
        
        // Check if session is active
        if (!sessionData.isActive) {
            sessions.delete(sessionId);
            res.clearCookie(SESSION_CONFIG.cookieName);
            req.session = null;
            return next();
        }
        
        // Update last activity
        sessionData.lastActivity = Date.now();
        sessions.set(sessionId, sessionData);
        
        // Attach session to request
        req.session = sessionData;
        
        // Set session cookie
        res.cookie(SESSION_CONFIG.cookieName, sessionId, {
            httpOnly: SESSION_CONFIG.httpOnly,
            secure: SESSION_CONFIG.secureCookie,
            sameSite: SESSION_CONFIG.sameSite,
            maxAge: SESSION_CONFIG.maxAge
        });
        
        next();
        
    } catch (error) {
        console.error('Session middleware error:', error);
        req.session = null;
        next();
    }
};

// Require authentication middleware
const requireAuth = async (req, res, next) => {
    try {
        if (!req.session) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        
        // Verify admin still exists and is active in Firestore
        const adminDoc = await admin.firestore()
            .collection('admins')
            .doc(req.session.adminId)
            .get();
        
        if (!adminDoc.exists) {
            await destroySession(req.session.id, req);
            return res.status(401).json({
                error: 'Admin account not found'
            });
        }
        
        const adminData = adminDoc.data();
        
        if (!adminData.isActive) {
            await destroySession(req.session.id, req);
            return res.status(401).json({
                error: 'Account is deactivated'
            });
        }
        
        // Update admin data in session
        req.session.email = adminData.email;
        req.session.role = adminData.role;
        
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: 'Authentication failed'
        });
    }
};

// Destroy session
const destroySession = async (sessionId, req) => {
    try {
        const sessionData = sessions.get(sessionId);
        
        if (sessionData) {
            // Log session destruction
            await logSecurityEvent('SESSION_DESTROYED', {
                sessionId: sessionId.substring(0, 8) + '...',
                adminId: sessionData.adminId,
                email: sessionData.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            sessions.delete(sessionId);
        }
    } catch (error) {
        console.error('Session destruction error:', error);
    }
};

// Clean up expired sessions
const cleanupExpiredSessions = () => {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, sessionData] of sessions.entries()) {
        if (now - sessionData.createdAt > SESSION_CONFIG.maxAge || 
            now - sessionData.lastActivity > SESSION_CONFIG.maxAge) {
            sessions.delete(sessionId);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
};

// Periodic cleanup every 30 minutes
setInterval(cleanupExpiredSessions, 30 * 60 * 1000);

// Get active sessions for admin
const getActiveSessions = async (adminId) => {
    try {
        const adminSessions = [];
        
        for (const [sessionId, sessionData] of sessions.entries()) {
            if (sessionData.adminId === adminId && sessionData.isActive) {
                adminSessions.push({
                    id: sessionId.substring(0, 8) + '...',
                    createdAt: sessionData.createdAt,
                    lastActivity: sessionData.lastActivity,
                    userAgent: sessionData.userAgent,
                    ip: sessionData.ip
                });
            }
        }
        
        return adminSessions;
    } catch (error) {
        console.error('Get active sessions error:', error);
        return [];
    }
};

// Destroy all sessions for admin (force logout from all devices)
const destroyAllAdminSessions = async (adminId, req) => {
    try {
        let destroyedCount = 0;
        
        for (const [sessionId, sessionData] of sessions.entries()) {
            if (sessionData.adminId === adminId) {
                await logSecurityEvent('FORCE_LOGOUT', {
                    sessionId: sessionId.substring(0, 8) + '...',
                    adminId: adminId,
                    email: sessionData.email,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                sessions.delete(sessionId);
                destroyedCount++;
            }
        }
        
        return destroyedCount;
    } catch (error) {
        console.error('Destroy all sessions error:', error);
        return 0;
    }
};

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

module.exports = {
    sessionMiddleware,
    requireAuth,
    createSession,
    destroySession,
    getActiveSessions,
    destroyAllAdminSessions,
    SESSION_CONFIG
};
