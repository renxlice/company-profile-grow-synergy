// Maintenance Mode Middleware
// Start with maintenance mode disabled, but allow control in production
let maintenanceMode = false;

// Toggle maintenance mode
const toggleMaintenance = (enable = true) => {
    // Allow maintenance toggle in both development and production
    // Only show maintenance page in production
    maintenanceMode = enable;
    console.log(`Maintenance mode ${enable ? 'enabled' : 'disabled'} (${process.env.NODE_ENV || 'development'} mode)`);
    return { success: true, maintenanceMode: maintenanceMode };
};

// Check if maintenance mode is active
const isMaintenanceMode = () => {
    return maintenanceMode;
};

// Middleware to check maintenance mode
const maintenanceMiddleware = (req, res, next) => {
    console.log(`Maintenance middleware: checking ${req.path}, maintenanceMode=${maintenanceMode}`);
    
    // Skip maintenance check for admin routes, login page, maintenance page, API routes, and static assets
    if (req.path.startsWith('/admin') || 
        req.path === '/maintenance' || 
        req.path === '/admin/login' ||
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/js') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/images') ||
        req.path.startsWith('/uploads') || // IMPORTANT: Allow uploads folder for dashboard images
        req.path.startsWith('/_next') || // Next.js static files
        req.path.includes('favicon.ico') ||
        req.path.includes('.well-known') || // Chrome devtools and other well-known paths
        req.path.includes('robots.txt') ||
        req.path.includes('sitemap.xml')) {
        console.log(`Maintenance middleware: skipping ${req.path} (admin/static asset)`);
        return next();
    }
    
    // If maintenance mode is active, show maintenance page
    if (maintenanceMode) {
        console.log(`Maintenance middleware: showing maintenance page for ${req.path} (${process.env.NODE_ENV || 'development'} mode)`);
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
    
    console.log(`Maintenance middleware: allowing ${req.path} (maintenance mode off)`);
    next();
};

module.exports = {
    toggleMaintenance,
    isMaintenanceMode,
    maintenanceMiddleware
};
