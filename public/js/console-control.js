// Advanced Console Control for Production
(function() {
    'use strict';
    
    // Check URL parameters for override
    const urlParams = new URLSearchParams(window.location.search);
    const forceConsole = urlParams.get('debug') === 'true' || urlParams.get('console') === 'true';
    
    // Check if we're in development environment
    const isDevelopment = window.location.hostname.includes('localhost') || 
                         window.location.hostname.includes('127.0.0.1') || 
                         window.location.hostname.includes('192.168.') ||
                         window.location.protocol === 'file:' ||
                         window.location.port !== '';
    
    // Check if we're in staging (optional staging domains)
    const isStaging = window.location.hostname.includes('staging.') || 
                     window.location.hostname.includes('dev.') ||
                     window.location.hostname.includes('test.');
    
    // Determine if console should be disabled
    const disableConsole = !forceConsole && !isDevelopment && !isStaging;
    
    if (disableConsole) {
        // Store original console methods for potential restoration
        const originalConsole = {
            log: console.log,
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
            table: console.table,
            trace: console.trace,
            group: console.group,
            groupEnd: console.groupEnd,
            groupCollapsed: console.groupCollapsed,
            clear: console.clear,
            assert: console.assert,
            count: console.count,
            countReset: console.countReset,
            dir: console.dir,
            dirxml: console.dirxml,
            time: console.time,
            timeEnd: console.timeEnd,
            timeLog: console.timeLog,
            profile: console.profile,
            profileEnd: console.profileEnd
        };
        
        // Disable all console methods in production
        Object.keys(originalConsole).forEach(method => {
            if (typeof console[method] === 'function') {
                console[method] = function() {};
            }
        });
        
        // Keep error logs for critical debugging (optional - uncomment if needed)
        // console.error = originalConsole.error.bind(console);
        
        // Add a global function to restore console if needed (for debugging)
        window.restoreConsole = function() {
            Object.keys(originalConsole).forEach(method => {
                console[method] = originalConsole[method];
            });
            console.log('Console restored by restoreConsole()');
        };
        
        // Add a global function to check console status
        window.isConsoleDisabled = function() {
            return disableConsole;
        };
        
    } else {
        // In development/staging or when forced, keep console active
        console.log('Console is active - Environment:', {
            isDevelopment,
            isStaging,
            forceConsole,
            hostname: window.location.hostname,
            port: window.location.port
        });
    }
})();
