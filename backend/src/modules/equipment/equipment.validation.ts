import { z } from 'zod';
import { EquipmentStatus } from '@prisma/client';

export const createEquipmentSchema = z.object({
  name: z.string().min(1).max(100),
  serialNumber: z.string().min(1).max(100),
  location: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  primaryTeamId: z.string().uuid({
    message: 'Primary team is required. Equipment must be assigned to a team.',
  }),
  purchaseDate: z.string().datetime().optional(),
  warrantyEnd: z.string().datetime().optional(),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyEnd: z.string().datetime().optional(),
});

export const changeTeamSchema = z.object({
  primaryTeamId: z.string().uuid(),
  reason: z.string().optional(),
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(EquipmentStatus),
  reason: z.string().optional(),
});

export const assignEquipmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  notes: z.string().optional(),
});

export const returnEquipmentSchema = z.object({
  notes: z.string().optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type ChangeTeamInput = z.infer<typeof changeTeamSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type AssignEquipmentInput = z.infer<typeof assignEquipmentSchema>;
export type ReturnEquipmentInput = z.infer<typeof returnEquipmentSchema>;
