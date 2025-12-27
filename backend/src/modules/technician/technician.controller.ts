import { Response, NextFunction } from 'express';
import { TechnicianService } from './technician.service';
import { AuthRequest } from '../../shared/types';

export class TechnicianController {
  private technicianService: TechnicianService;

  constructor() {
    this.technicianService = new TechnicianService();
  }

  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dashboard = await this.technicianService.getDashboard(req.user!.userId);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };

  getEquipmentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { equipmentId } = req.params;
      const history = await this.technicianService.getEquipmentHistory(equipmentId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };
}
