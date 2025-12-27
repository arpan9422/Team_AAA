import { Response, NextFunction } from 'express';
import { MaintenanceRequestService } from './maintenance-request.service';
import {
  createMaintenanceRequestSchema,
  reassignRequestSchema,
  rejectAssignmentSchema,
  updateRequestPrioritySchema,
  updateRequestStatusSchema,
  acceptRequestSchema,
} from './maintenance-request.validation';
import { RequestStatus, PriorityLevel } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../../shared/types';

export class MaintenanceRequestController {
  private requestService: MaintenanceRequestService;

  constructor() {
    this.requestService = new MaintenanceRequestService();
  }

  getAllRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status, teamId, technicianId, equipmentId, priority } = req.query;

      const filters: any = {};
      if (status) filters.status = status as RequestStatus;
      if (teamId) filters.teamId = teamId as string;
      if (technicianId) filters.technicianId = technicianId as string;
      if (equipmentId) filters.equipmentId = equipmentId as string;
      if (priority) filters.priority = priority as PriorityLevel;

      const requests = await this.requestService.getAllRequests(filters);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  };

  getRequestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const request = await this.requestService.getRequestById(id);
      res.json(request);
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validatedData = createMaintenanceRequestSchema.parse(req.body);
      const request = await this.requestService.createRequest(validatedData, req.user!.userId);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  reassignRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = reassignRequestSchema.parse(req.body);
      const result = await this.requestService.reassignRequest(id, validatedData, req.user!.userId);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  rejectAndReassign = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = rejectAssignmentSchema.parse(req.body);
      const result = await this.requestService.rejectAndReassign(id, validatedData, req.user!.userId);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  updatePriority = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateRequestPrioritySchema.parse(req.body);
      const result = await this.requestService.updateRequestPriority(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateRequestStatusSchema.parse(req.body);
      const result = await this.requestService.updateRequestStatus(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  getTeamRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.params;
      const { status } = req.query;
      const requests = await this.requestService.getTeamRequests(
        teamId,
        status as RequestStatus | undefined
      );
      res.json(requests);
    } catch (error) {
      next(error);
    }
  };

  getTeamTechnicians = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.params;
      const technicians = await this.requestService.getTeamTechnicians(teamId);
      res.json(technicians);
    } catch (error) {
      next(error);
    }
  };

  getStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;
      const stats = await this.requestService.getRequestStatistics(teamId as string | undefined);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getAssignmentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const history = await this.requestService.getAssignmentHistory(id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  acceptRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = acceptRequestSchema.parse(req.body);
      const result = await this.requestService.acceptRequest(id, req.user!.userId, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };
}
