import { Injectable } from '@nestjs/common';

@Injectable()
export class MaintenanceService {
  private maintenanceMode = false;

  setMaintenanceMode(enabled: boolean): { success: boolean; maintenanceMode: boolean } {
    this.maintenanceMode = enabled;
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true, maintenanceMode: this.maintenanceMode };
  }

  isMaintenanceMode(): boolean {
    return this.maintenanceMode;
  }

  getStatus(): { maintenanceMode: boolean; message: string } {
    return {
      maintenanceMode: this.maintenanceMode,
      message: this.maintenanceMode ? 'Maintenance mode is active' : 'Maintenance mode is inactive'
    };
  }
}
