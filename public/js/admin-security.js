/**
 * Admin Security Module
 * Auto-logout after 15 minutes idle and enhanced security features
 */

class AdminSecurity {
    constructor() {
        this.IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
        this.WARNING_TIMEOUT = 1 * 60 * 1000; // 1 minute before logout
        this.idleTimer = null;
        this.warningTimer = null;
        this.lastActivity = Date.now();
        this.warningShown = false;
        
        this.init();
    }

    init() {
        this.setupActivityListeners();
        this.startIdleTimer();
        this.setupTokenRefresh();
        this.setupSecurityHeaders();
        this.setupCSRFProtection();
    }

    // Track user activity
    setupActivityListeners() {
        const events = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 
            'touchstart', 'click', 'keydown', 'focus'
        ];

        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetIdleTimer();
                this.hideWarning();
            }, true);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.resetIdleTimer();
                this.checkSessionValidity();
            }
        });

        // Track window focus/blur
        window.addEventListener('focus', () => {
            this.checkSessionValidity();
        });
    }

    // Reset idle timer
    resetIdleTimer() {
        this.lastActivity = Date.now();
        this.warningShown = false;
        
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
        }
        
        this.startIdleTimer();
    }

    // Start idle detection
    startIdleTimer() {
        // Show warning 1 minute before logout
        this.warningTimer = setTimeout(() => {
            this.showIdleWarning();
        }, this.IDLE_TIMEOUT - this.WARNING_TIMEOUT);

        // Auto logout after 15 minutes
        this.idleTimer = setTimeout(() => {
            this.autoLogout();
        }, this.IDLE_TIMEOUT);
    }

    // Show idle warning
    showIdleWarning() {
        if (this.warningShown) return;
        
        this.warningShown = true;
        
        const warningModal = document.createElement('div');
        warningModal.id = 'idleWarningModal';
        warningModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        warningModal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sesi Akan Berakhir</h3>
                    <p class="text-sm text-gray-600 mb-4">
                        Anda telah tidak aktif selama 14 menit. Sesi akan berakhir dalam <span id="countdown">60</span> detik.
                    </p>
                    <div class="flex space-x-3">
                        <button onclick="adminSecurity.extendSession()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                            <i class="fas fa-clock mr-2"></i>Perpanjang Sesi
                        </button>
                        <button onclick="adminSecurity.logoutNow()" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout Sekarang
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(warningModal);
        this.startCountdown();
    }

    // Start countdown timer
    startCountdown() {
        let seconds = 60;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            seconds--;
            if (countdownElement) {
                countdownElement.textContent = seconds;
            }
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                this.autoLogout();
            }
        }, 1000);
    }

    // Hide warning modal
    hideWarning() {
        const warningModal = document.getElementById('idleWarningModal');
        if (warningModal) {
            warningModal.remove();
        }
    }

    // Extend session
    extendSession() {
        this.hideWarning();
        this.resetIdleTimer();
        this.showNotification('Sesi diperpanjang selama 15 menit', 'success');
        
        // Refresh token
        this.refreshToken();
    }

    // Auto logout
    async autoLogout() {
        this.showNotification('Sesi berakhir karena tidak aktif', 'warning');
        
        // Log security event
        await this.logSecurityEvent('AUTO_LOGOUT', {
            reason: 'idle_timeout',
            idleDuration: Date.now() - this.lastActivity
        });
        
        // Clear tokens and redirect
        setTimeout(() => {
            this.clearSession();
            window.location.href = '/admin/login';
        }, 2000);
    }

    // Manual logout
    async logoutNow() {
        await this.logSecurityEvent('MANUAL_LOGOUT', {
            reason: 'user_action'
        });
        
        this.clearSession();
        window.location.href = '/admin/login';
    }

    // Check session validity
    async checkSessionValidity() {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                this.autoLogout();
                return;
            }

            // Verify token with server
            const response = await fetch('/admin/verify-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                this.autoLogout();
            }
        } catch (error) {
            console.error('Session check failed:', error);
            this.autoLogout();
        }
    }

    // Token refresh
    setupTokenRefresh() {
        // Refresh token every 30 minutes
        setInterval(() => {
            this.refreshToken();
        }, 30 * 60 * 1000);
    }

    // Refresh token
    async refreshToken() {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            const response = await fetch('/admin/refresh-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }

    // Setup security headers
    setupSecurityHeaders() {
        // Add meta tags for security
        const metaTags = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            { name: 'X-Frame-Options', content: 'DENY' },
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
            { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;" }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.keys(tag).forEach(key => {
                meta.setAttribute(key, tag[key]);
            });
            document.head.appendChild(meta);
        });
    }

    // Setup CSRF protection
    setupCSRFProtection() {
        // Get CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (csrfToken) {
            // Add CSRF token to all fetch requests
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                if (args[1] && args[1].headers) {
                    args[1].headers['X-CSRF-Token'] = csrfToken;
                }
                return originalFetch.apply(this, args);
            };
        }
    }

    // Clear session
    clearSession() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.clear();
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    type === 'error' ? 'fa-times-circle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Log security events
    async logSecurityEvent(eventType, details) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            await fetch('/admin/log-security-event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventType,
                    details: {
                        ...details,
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    }
                })
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    // Check for suspicious activity
    checkSuspiciousActivity() {
        // Check for multiple rapid requests
        const requestCount = parseInt(localStorage.getItem('requestCount') || '0');
        const lastRequestTime = parseInt(localStorage.getItem('lastRequestTime') || '0');
        const now = Date.now();
        
        if (now - lastRequestTime < 1000) { // Less than 1 second between requests
            localStorage.setItem('requestCount', (requestCount + 1).toString());
            
            if (requestCount > 10) { // More than 10 requests per second
                this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                    type: 'rapid_requests',
                    count: requestCount + 1
                });
                
                // Temporarily block further requests
                this.showNotification('Aktivitas mencurigakan terdeteksi', 'error');
                return false;
            }
        } else {
            localStorage.setItem('requestCount', '1');
        }
        
        localStorage.setItem('lastRequestTime', now.toString());
        return true;
    }
}

// Initialize admin security
let adminSecurity;

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on admin pages
    if (window.location.pathname.startsWith('/admin')) {
        adminSecurity = new AdminSecurity();
        
        // Add to global scope for button onclick handlers
        window.adminSecurity = adminSecurity;
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSecurity;
}
