// Global maintenance state
let maintenanceMode = false;

// Toggle maintenance mode
const toggleMaintenance = (enable = true) => {
    maintenanceMode = enable;
    console.log(`Maintenance mode ${enable ? 'enabled' : 'disabled'}`);
    return { success: true, maintenanceMode: maintenanceMode };
};

// Check if maintenance mode is active
const isMaintenanceMode = () => {
    return maintenanceMode;
};

module.exports = {
    toggleMaintenance,
    isMaintenanceMode
};
