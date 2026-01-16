// Environment-based console control
// Use NODE_ENV=silent to disable console logs

if (process.env.NODE_ENV === 'silent') {
    // Store original console methods
    const originalConsole = {
        log: console.log,
        info: console.info,
        debug: console.debug,
        warn: console.warn,
        error: console.error
    };

    // Disable console methods
    console.log = function() {};
    console.info = function() {};
    console.debug = function() {};
    console.warn = function() {};
    
    // Keep error logging for critical errors
    console.error = function(...args) {
        if (args[0] && args[0].includes && args[0].includes('Error:')) {
            originalConsole.error.apply(console, args);
        }
    };

    console.log('Console logging disabled (NODE_ENV=silent)');
}
