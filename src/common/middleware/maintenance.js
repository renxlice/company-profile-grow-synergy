// Maintenance Mode Middleware
let maintenanceMode = false;

// Toggle maintenance mode
const toggleMaintenance = (enable = true) => {
    maintenanceMode = enable;
    return { success: true, maintenanceMode: maintenanceMode };
};

// Check if maintenance mode is active
const isMaintenanceMode = () => {
    return maintenanceMode;
};

// Middleware to check maintenance mode
const maintenanceMiddleware = (req, res, next) => {
    // Skip maintenance check for admin routes, login page, maintenance page, and API routes
    if (req.path.startsWith('/admin') || 
        req.path === '/maintenance' || 
        req.path === '/admin/login' ||
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/images')) {
        return next();
    }
    
    // If maintenance mode is active, show maintenance page
    if (maintenanceMode) {
        const fs = require('fs');
        const path = require('path');
        
        try {
            const maintenanceTemplate = fs.readFileSync(path.join(__dirname, '../views/maintenance.hbs'), 'utf8');
            
            // Simple template replacement
            let html = maintenanceTemplate
                .replace(/\{\{title\}\}/g, 'Maintenance Mode - GROW SYNERGY INDONESIA')
                .replace(/\{\{description\}\}/g, 'Website sedang dalam maintenance. Kami akan segera kembali.');
            
            return res.status(503).send(html);
        } catch (error) {
            console.error('Error rendering maintenance page:', error);
            return res.status(503).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Maintenance</title></head>
                <body>
                    <h1>Website Under Maintenance</h1>
                    <p>Kami akan segera kembali.</p>
                </body>
                </html>
            `);
        }
    }
    
    next();
};

module.exports = {
    toggleMaintenance,
    isMaintenanceMode,
    maintenanceMiddleware
};
