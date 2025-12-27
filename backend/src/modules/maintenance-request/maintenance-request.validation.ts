import { z } from 'zod';
import { RequestType, PriorityLevel } from '@prisma/client';

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  requestType: z.nativeEnum(RequestType),
  equipmentId: z.string().uuid('Invalid equipment ID'),
  priority: z.nativeEnum(PriorityLevel).default('MEDIUM'),
  scheduledDate: z.string().datetime().optional(),
});

export const reassignRequestSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID'),
  reason: z.string().min(1, 'Reason is required'),
});

export const rejectAssignmentSchema = z.object({
  reason: z.string().min(1, 'Reason for rejection is required'),
  reassignTo: z.string().uuid('Invalid technician ID').optional(),
});

export const updateRequestPrioritySchema = z.object({
  priority: z.nativeEnum(PriorityLevel),
  reason: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP']),
  reason: z.string().optional(),
});

export const acceptRequestSchema = z.object({
  notes: z.string().optional(),
});

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;
export type ReassignRequestInput = z.infer<typeof reassignRequestSchema>;
export type RejectAssignmentInput = z.infer<typeof rejectAssignmentSchema>;
export type UpdateRequestPriorityInput = z.infer<typeof updateRequestPrioritySchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type AcceptRequestInput = z.infer<typeof acceptRequestSchema>;
