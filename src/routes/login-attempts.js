// Login attempts tracking for enhanced security
const loginAttempts = {};

module.exports = {
    loginAttempts,
    
    // Record failed login attempt
    recordFailedAttempt: (ip) => {
        if (!loginAttempts[ip]) {
            loginAttempts[ip] = {
                count: 0,
                lastAttempt: 0
            };
        }
        
        loginAttempts[ip].count++;
        loginAttempts[ip].lastAttempt = Date.now();
        
        // Auto-cleanup old entries
        setTimeout(() => {
            if (loginAttempts[ip] && Date.now() - loginAttempts[ip].lastAttempt > 24 * 60 * 60 * 1000) {
                delete loginAttempts[ip];
            }
        }, 24 * 60 * 60 * 1000); // 24 hours
    },
    
    // Clear successful login attempt
    clearAttempts: (ip) => {
        delete loginAttempts[ip];
    },
    
    // Check if IP is locked out
    isLockedOut: (ip) => {
        if (!loginAttempts[ip]) return false;
        
        const timeSinceLastAttempt = Date.now() - loginAttempts[ip].lastAttempt;
        const lockoutTime = 15 * 60 * 1000; // 15 minutes
        
        return loginAttempts[ip].count >= 5 && timeSinceLastAttempt < lockoutTime;
    },
    
    // Get remaining lockout time
    getLockoutTimeRemaining: (ip) => {
        if (!loginAttempts[ip]) return 0;
        
        const timeSinceLastAttempt = Date.now() - loginAttempts[ip].lastAttempt;
        const lockoutTime = 15 * 60 * 1000; // 15 minutes
        
        return Math.max(0, lockoutTime - timeSinceLastAttempt);
    }
};
