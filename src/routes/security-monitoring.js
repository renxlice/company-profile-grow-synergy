/**
 * Security Monitoring and Alerting Routes
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { verifyAdminToken } = require('./adminAuth');

// Security metrics collection
const securityMetrics = {
    loginAttempts: {
        total: 0,
        failed: 0,
        successful: 0,
        byIP: new Map(),
        byHour: new Map()
    },
    suspiciousActivity: {
        xssAttempts: 0,
        sqlInjectionAttempts: 0,
        bruteForceAttempts: 0,
        rapidRequests: 0
    },
    sessions: {
        active: 0,
        expired: 0,
        destroyed: 0
    },
    alerts: []
};

// Get security dashboard
router.get('/dashboard', verifyAdminToken, async (req, res) => {
    try {
        // Check if requester is super admin or has security role
        if (req.admin.role !== 'super_admin' && req.admin.role !== 'security_admin') {
            return res.status(403).json({
                error: 'Access denied. Security admin required.'
            });
        }

        // Get recent security logs
        const recentLogs = await admin.firestore()
            .collection('security_logs')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const logs = recentLogs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));

        // Calculate metrics
        const metrics = calculateSecurityMetrics(logs);

        // Get active sessions count
        const activeSessions = await getActiveSessionsCount();

        res.json({
            metrics: {
                ...metrics,
                activeSessions,
                totalAlerts: securityMetrics.alerts.length
            },
            recentLogs: logs.slice(0, 20), // Return last 20 logs
            alerts: securityMetrics.alerts.slice(-10) // Return last 10 alerts
        });

    } catch (error) {
        console.error('Security dashboard error:', error);
        res.status(500).json({ error: 'Failed to get security data' });
    }
});

// Get detailed security logs
router.get('/logs', verifyAdminToken, async (req, res) => {
    try {
        // Check permissions
        if (req.admin.role !== 'super_admin' && req.admin.role !== 'security_admin') {
            return res.status(403).json({
                error: 'Access denied. Security admin required.'
            });
        }

        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const eventType = req.query.eventType;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let query = admin.firestore()
            .collection('security_logs')
            .orderBy('timestamp', 'desc');

        // Apply filters
        if (eventType) {
            query = query.where('eventType', '==', eventType);
        }

        if (startDate) {
            query = query.where('timestamp', '>=', new Date(startDate));
        }

        if (endDate) {
            query = query.where('timestamp', '<=', new Date(endDate));
        }

        const logs = await query.limit(limit).offset(offset).get();

        const logData = logs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));

        // Get total count for pagination
        const countQuery = admin.firestore()
            .collection('security_logs');

        const countSnapshot = await countQuery.get();
        const totalCount = countSnapshot.size;

        res.json({
            logs: logData,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Get security logs error:', error);
        res.status(500).json({ error: 'Failed to get security logs' });
    }
});

// Get security analytics
router.get('/analytics', verifyAdminToken, async (req, res) => {
    try {
        // Check permissions
        if (req.admin.role !== 'super_admin' && req.admin.role !== 'security_admin') {
            return res.status(403).json({
                error: 'Access denied. Security admin required.'
            });
        }

        const timeRange = req.query.timeRange || '24h'; // 24h, 7d, 30d

        // Calculate time range
        const now = new Date();
        let startTime;

        switch (timeRange) {
            case '7d':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        // Get logs for the time range
        const logs = await admin.firestore()
            .collection('security_logs')
            .where('timestamp', '>=', startTime)
            .orderBy('timestamp', 'desc')
            .get();

        const logData = logs.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));

        // Generate analytics
        const analytics = generateSecurityAnalytics(logData, timeRange);

        res.json(analytics);

    } catch (error) {
        console.error('Security analytics error:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

// Block IP address
router.post('/block-ip', verifyAdminToken, async (req, res) => {
    try {
        // Only super admin can block IPs
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                error: 'Only super admin can block IP addresses'
            });
        }

        const { ip, reason, duration = 24 } = req.body; // duration in hours

        if (!ip || !reason) {
            return res.status(400).json({
                error: 'IP address and reason are required'
            });
        }

        // Add to blocked IPs collection
        await admin.firestore()
            .collection('blocked_ips')
            .add({
                ip: ip,
                reason: reason,
                blockedBy: req.admin.email,
                blockedAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
                isActive: true
            });

        // Log the action
        await logSecurityEvent('IP_BLOCKED', {
            blockedIP: ip,
            reason: reason,
            duration: duration,
            blockedBy: req.admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            message: `IP ${ip} blocked for ${duration} hours`,
            ip: ip,
            duration: duration
        });

    } catch (error) {
        console.error('Block IP error:', error);
        res.status(500).json({ error: 'Failed to block IP' });
    }
});

// Get blocked IPs
router.get('/blocked-ips', verifyAdminToken, async (req, res) => {
    try {
        // Check permissions
        if (req.admin.role !== 'super_admin' && req.admin.role !== 'security_admin') {
            return res.status(403).json({
                error: 'Access denied. Security admin required.'
            });
        }

        const blockedIPs = await admin.firestore()
            .collection('blocked_ips')
            .where('isActive', '==', true)
            .orderBy('blockedAt', 'desc')
            .get();

        const ips = blockedIPs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            blockedAt: doc.data().blockedAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate()
        }));

        res.json({ blockedIPs: ips });

    } catch (error) {
        console.error('Get blocked IPs error:', error);
        res.status(500).json({ error: 'Failed to get blocked IPs' });
    }
});

// Helper functions
function calculateSecurityMetrics(logs) {
    const metrics = {
        totalEvents: logs.length,
        loginAttempts: 0,
        failedLogins: 0,
        successfulLogins: 0,
        suspiciousActivity: 0,
        sessionEvents: 0,
        byHour: {},
        topIPs: {}
    };

    logs.forEach(log => {
        // Count by event type
        switch (log.eventType) {
            case 'LOGIN_SUCCESS':
                metrics.successfulLogins++;
                metrics.loginAttempts++;
                break;
            case 'LOGIN_FAILED':
                metrics.failedLogins++;
                metrics.loginAttempts++;
                break;
            case 'XSS_ATTEMPT':
            case 'SQL_INJECTION_ATTEMPT':
            case 'BRUTE_FORCE_ATTEMPT':
            case 'SUSPICIOUS_ACTIVITY':
                metrics.suspiciousActivity++;
                break;
            case 'SESSION_CREATED':
            case 'SESSION_DESTROYED':
            case 'AUTO_LOGOUT':
                metrics.sessionEvents++;
                break;
        }

        // Count by hour
        const hour = log.timestamp?.getHours() || 0;
        metrics.byHour[hour] = (metrics.byHour[hour] || 0) + 1;

        // Count by IP
        const ip = log.details?.ip || 'unknown';
        metrics.topIPs[ip] = (metrics.topIPs[ip] || 0) + 1;
    });

    // Sort top IPs
    const sortedIPs = Object.entries(metrics.topIPs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [ip, count]) => {
            obj[ip] = count;
            return obj;
        }, {});

    metrics.topIPs = sortedIPs;

    return metrics;
}

function generateSecurityAnalytics(logs, timeRange) {
    const analytics = {
        timeRange: timeRange,
        totalEvents: logs.length,
        eventTypes: {},
        timeline: [],
        riskLevel: 'LOW'
    };

    // Count by event types
    logs.forEach(log => {
        analytics.eventTypes[log.eventType] = (analytics.eventTypes[log.eventType] || 0) + 1;
    });

    // Generate timeline data
    const timelineData = {};
    logs.forEach(log => {
        const timeKey = log.timestamp?.toISOString().slice(0, 16) || 'unknown';
        timelineData[timeKey] = (timelineData[timeKey] || 0) + 1;
    });

    analytics.timeline = Object.entries(timelineData)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));

    // Calculate risk level
    const suspiciousCount = analytics.eventTypes['XSS_ATTEMPT'] + 
                          analytics.eventTypes['SQL_INJECTION_ATTEMPT'] + 
                          analytics.eventTypes['BRUTE_FORCE_ATTEMPT'] +
                          analytics.eventTypes['SUSPICIOUS_ACTIVITY'];

    if (suspiciousCount > 10) {
        analytics.riskLevel = 'HIGH';
    } else if (suspiciousCount > 3) {
        analytics.riskLevel = 'MEDIUM';
    }

    return analytics;
}

async function getActiveSessionsCount() {
    try {
        // This would integrate with your session store
        // For now, return a placeholder
        return 0;
    } catch (error) {
        console.error('Get active sessions count error:', error);
        return 0;
    }
}

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

module.exports = router;
