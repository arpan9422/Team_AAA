import { z } from 'zod';

export const createWorkCenterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    code: z.string().min(1, 'Code is required').max(50),
    type: z.string().max(100).optional(),
    tag: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    costPerHour: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    timeEfficiency: z.number().int().min(0).max(100).optional(),
    oeeTarget: z.number().int().min(0).max(100).optional(),
    assignedWorkerIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateWorkCenterSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(50).optional(),
    type: z.string().max(100).optional(),
    tag: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    costPerHour: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    timeEfficiency: z.number().int().min(0).max(100).optional(),
    oeeTarget: z.number().int().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const assignWorkersSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    workerIds: z.array(z.string().uuid()).min(1, 'At least one worker must be assigned'),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150),
    description: z.string().optional(),
    technicianId: z.string().uuid('Technician ID is required'),
    equipmentId: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    requestType: z.enum(['CORRECTIVE', 'PREVENTIVE']).default('CORRECTIVE'),
    scheduledDate: z.string().datetime().optional(),
  }),
});

export const workCenterIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
