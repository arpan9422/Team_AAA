import prisma from '../../config/database';
import { CreateEquipmentInput, UpdateEquipmentInput } from './equipment.validation';
import { EquipmentStatus, EquipmentEvent } from '@prisma/client';

export class EquipmentRepository {
  async findAll(filters?: {
    status?: EquipmentStatus;
    teamId?: string;
    location?: string;
    department?: string;
  }) {
    return prisma.equipment.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.teamId && { primaryTeamId: filters.teamId }),
        ...(filters?.location && { location: filters.location }),
        ...(filters?.department && { department: filters.department }),
      },
      include: {
        primaryTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.equipment.findUnique({
      where: { id },
      include: {
        primaryTeam: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findBySerialNumber(serialNumber: string) {
    return prisma.equipment.findUnique({
      where: { serialNumber },
    });
  }

  async create(data: CreateEquipmentInput & { primaryTeamId: string }) {
    return prisma.equipment.create({
      data,
      include: {
        primaryTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateEquipmentInput) {
    return prisma.equipment.update({
      where: { id },
      data,
      include: {
        primaryTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async changeTeam(id: string, primaryTeamId: string) {
    return prisma.equipment.update({
      where: { id },
      data: { primaryTeamId },
      include: {
        primaryTeam: true,
      },
    });
  }

  async changeStatus(id: string, status: EquipmentStatus) {
    return prisma.equipment.update({
      where: { id },
      data: { status },
    });
  }

  async getHistory(equipmentId: string) {
    return prisma.equipmentHistory.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addHistory(equipmentId: string, eventType: EquipmentEvent, eventNote?: string) {
    return prisma.equipmentHistory.create({
      data: {
        equipmentId,
        eventType,
        eventNote,
      },
    });
  }

  async getHealth(equipmentId: string) {
    return prisma.equipmentHealth.findUnique({
      where: { equipmentId },
    });
  }

  async checkWarrantyStatus(id: string): Promise<boolean> {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: { warrantyEnd: true },
    });

    if (!equipment || !equipment.warrantyEnd) {
      return false;
    }

    return new Date() < equipment.warrantyEnd;
  }

  async countByTeam(teamId: string): Promise<number> {
    return prisma.equipment.count({
      where: { primaryTeamId: teamId },
    });
  }

  async getUniqueLocations(): Promise<string[]> {
    const equipment = await prisma.equipment.findMany({
      where: { location: { not: null } },
      select: { location: true },
      distinct: ['location'],
    });
    return equipment.map((e) => e.location).filter((l): l is string => l !== null);
  }

  async getUniqueDepartments(): Promise<string[]> {
    const equipment = await prisma.equipment.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ['department'],
    });
    return equipment.map((e) => e.department).filter((d): d is string => d !== null);
  }

  async assignToUser(equipmentId: string, userId: string, notes?: string) {
    // First, mark any existing active assignments for this equipment as inactive
    await prisma.equipmentAssignment.updateMany({
      where: {
        equipmentId,
        isActive: true,
      },
      data: {
        isActive: false,
        returnedAt: new Date(),
      },
    });

    // Create new assignment
    return prisma.equipmentAssignment.create({
      data: {
        equipmentId,
        userId,
        notes,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
          },
        },
      },
    });
  }

  async returnEquipment(assignmentId: string, notes?: string) {
    return prisma.equipmentAssignment.update({
      where: { id: assignmentId },
      data: {
        isActive: false,
        returnedAt: new Date(),
        notes: notes || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
          },
        },
      },
    });
  }

  async getActiveAssignment(equipmentId: string) {
    return prisma.equipmentAssignment.findFirst({
      where: {
        equipmentId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getEquipmentAssignments(equipmentId: string) {
    return prisma.equipmentAssignment.findMany({
      where: { equipmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getUserAssignments(userId: string, activeOnly: boolean = false) {
    return prisma.equipmentAssignment.findMany({
      where: {
        userId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
