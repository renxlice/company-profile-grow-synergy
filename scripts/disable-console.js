// Disable console methods for production
const originalConsole = console;

// Override console methods to suppress output
console.log = function() {};
console.info = function() {};
console.debug = function() {};
console.warn = function() {};
console.error = function() {};
console.trace = function() {};
console.time = function() {};
console.timeEnd = function() {};
console.group = function() {};
console.groupEnd = function() {};
console.groupCollapsed = function() {};

// Keep console methods available for debugging if needed
console.original = originalConsole;

// Optional: Allow console output in development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
  // Restore console methods in development
  Object.keys(originalConsole).forEach(method => {
    if (typeof originalConsole[method] === 'function') {
      console[method] = originalConsole[method];
    }
  });
}
