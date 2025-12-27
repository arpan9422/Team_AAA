import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from './equipment.service';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  changeTeamSchema,
  changeStatusSchema,
  assignEquipmentSchema,
  returnEquipmentSchema,
} from './equipment.validation';
import { EquipmentStatus } from '@prisma/client';
import { z } from 'zod';

export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
  }

  getAllEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, teamId, location, department } = req.query;

      const filters: any = {};
      if (status) filters.status = status as EquipmentStatus;
      if (teamId) filters.teamId = teamId as string;
      if (location) filters.location = location as string;
      if (department) filters.department = department as string;

      const equipment = await this.equipmentService.getAllEquipment(filters);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  };

  getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const equipment = await this.equipmentService.getEquipmentById(id);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  };

  createEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createEquipmentSchema.parse(req.body);
      const equipment = await this.equipmentService.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateEquipmentSchema.parse(req.body);
      const equipment = await this.equipmentService.updateEquipment(id, validatedData);
      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  changePrimaryTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = changeTeamSchema.parse(req.body);
      const result = await this.equipmentService.changePrimaryTeam(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = changeStatusSchema.parse(req.body);
      const result = await this.equipmentService.changeStatus(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  getEquipmentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const history = await this.equipmentService.getEquipmentHistory(id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  getEquipmentHealth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const health = await this.equipmentService.getEquipmentHealth(id);
      res.json(health);
    } catch (error) {
      next(error);
    }
  };

  getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await this.equipmentService.getLocations();
      res.json(locations);
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departments = await this.equipmentService.getDepartments();
      res.json(departments);
    } catch (error) {
      next(error);
    }
  };

  checkWarrantyStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const warranty = await this.equipmentService.checkWarrantyStatus(id);
      res.json(warranty);
    } catch (error) {
      next(error);
    }
  };

  assignEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = assignEquipmentSchema.parse(req.body);
      const assignment = await this.equipmentService.assignEquipmentToUser(id, validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  returnEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = returnEquipmentSchema.parse(req.body);
      const result = await this.equipmentService.returnEquipmentFromUser(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      next(error);
    }
  };

  getEquipmentAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const assignments = await this.equipmentService.getEquipmentAssignments(id);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  };

  getUserAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { activeOnly } = req.query;
      const assignments = await this.equipmentService.getUserAssignments(
        userId,
        activeOnly === 'true'
      );
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  };

  getActiveAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const assignment = await this.equipmentService.getActiveAssignment(id);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  };
}
