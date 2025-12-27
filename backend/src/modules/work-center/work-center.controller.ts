import { Request, Response, NextFunction } from 'express';
import { WorkCenterService } from './work-center.service';

const workCenterService = new WorkCenterService();

export class WorkCenterController {
  async createWorkCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const workCenter = await workCenterService.createWorkCenter(req.body);
      res.status(201).json({
        success: true,
        message: 'Work center created successfully',
        data: workCenter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllWorkCenters(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const workCenters = await workCenterService.getAllWorkCenters(includeInactive);
      res.status(200).json({
        success: true,
        data: workCenters,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkCenterById(req: Request, res: Response, next: NextFunction) {
    try {
      const workCenter = await workCenterService.getWorkCenterById(req.params.id);
      res.status(200).json({
        success: true,
        data: workCenter,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const workCenter = await workCenterService.updateWorkCenter(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Work center updated successfully',
        data: workCenter,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkCenter(req: Request, res: Response, next: NextFunction) {
    try {
      await workCenterService.deleteWorkCenter(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Work center deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignWorkers(req: Request, res: Response, next: NextFunction) {
    try {
      const workCenter = await workCenterService.assignWorkers(
        req.params.id,
        req.body.workerIds
      );
      res.status(200).json({
        success: true,
        message: 'Workers assigned successfully',
        data: workCenter,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTask(req: Request, res: Response, next: NextFunction) {
    try {
      const managerId = (req as any).user.id;
      const request = await workCenterService.assignTask(
        req.params.id,
        managerId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Task assigned successfully. Technician can start work immediately.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const statistics = await workCenterService.getWorkCenterStatistics(
        req.params.id
      );
      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workCenterController = new WorkCenterController();
