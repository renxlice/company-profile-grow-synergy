// Environment-based console control
const originalConsole = console;

// Check if console should be disabled
const shouldDisableConsole = () => {
  const env = process.env.NODE_ENV;
  return env === 'production' || env === 'silent' || env === 'prod';
};

// Function to disable console
const disableConsole = () => {
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
  
  // Keep original console for emergency access
  console.original = originalConsole;
};

// Function to restore console
const restoreConsole = () => {
  Object.keys(originalConsole).forEach(method => {
    if (typeof originalConsole[method] === 'function') {
      console[method] = originalConsole[method];
    }
  });
};

// Apply console settings based on environment
if (shouldDisableConsole()) {
  disableConsole();
  console.original.log('Console disabled for production environment');
} else {
  restoreConsole();
  console.log('Console enabled for development environment');
}

// Export functions for runtime control if needed
module.exports = {
  disableConsole,
  restoreConsole,
  shouldDisableConsole
};
