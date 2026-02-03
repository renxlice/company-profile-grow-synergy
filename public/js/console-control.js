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
        
        // Filter out common non-critical errors and warnings
        const filteredError = function(...args) {
            const message = args.join(' ').toString();
            
            // List of patterns to suppress
            const suppressPatterns = [
                /using deprecated parameters/i,
                /feature_collector\.js/i,
                /404.*not found/i,
                /GET.*\/uploads\/.*404/i,
                /Image.*404.*not found/i,
                /favicon\.ico.*404/i,
                /net::ERR_FILE_NOT_FOUND/i,
                /net::ERR_CONNECTION_REFUSED/i,
                /Failed to load resource/i,
                /Non-Error promise rejection/i,
                /ResizeObserver loop limit exceeded/i,
                /Script error/i,
                /Uncaught SyntaxError/i,
                /Unexpected token/i
            ];
            
            // Check if message should be suppressed
            const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
            
            if (!shouldSuppress) {
                // Only show critical errors
                originalConsole.error.apply(console, args);
            }
        };
        
        // Filter warnings
        const filteredWarn = function(...args) {
            const message = args.join(' ').toString();
            
            // Suppress all warnings in production
            const suppressPatterns = [
                /deprecated/i,
                /feature_collector/i,
                /404/i,
                /not found/i
            ];
            
            const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
            
            if (!shouldSuppress) {
                originalConsole.warn.apply(console, args);
            }
        };
        
        // Disable all console methods in production
        Object.keys(originalConsole).forEach(method => {
            if (typeof console[method] === 'function') {
                if (method === 'error') {
                    console[method] = filteredError;
                } else if (method === 'warn') {
                    console[method] = filteredWarn;
                } else {
                    console[method] = function() {};
                }
            }
        });
        
        // Suppress unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            event.preventDefault();
        });
        
        // Suppress error events for non-critical errors
        window.addEventListener('error', function(event) {
            const message = event.message || '';
            
            // Suppress common non-critical errors
            if (message.includes('404') || 
                message.includes('not found') ||
                message.includes('feature_collector') ||
                message.includes('deprecated')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }, true);
        
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
