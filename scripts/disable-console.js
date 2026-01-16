// Script to disable console.log output without removing console.log statements
// This can be run before starting the application

// Disable console methods
console.log = function() {};
console.info = function() {};
console.debug = function() {};
console.warn = function() {};
console.error = function() {};

// Keep error logging for critical errors
console.error = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('Error:')) {
        process.stderr.write(args.join(' ') + '\n');
    }
};

console.log('Console logging disabled - only critical errors will show');
