import { PrismaClient, RequestStatus, PriorityLevel, RequestType } from '@prisma/client';

const prisma = new PrismaClient();

export class EmployeeService {
  async createMaintenanceRequest(userId: string, data: {
    title: string;
    description: string;
    requestType: RequestType;
    equipmentId?: string;
    teamId?: string;
    priority?: PriorityLevel;
  }) {
    return prisma.maintenanceRequest.create({
      data: {
        title: data.title,
        description: data.description,
        requestType: data.requestType,
        priority: data.priority || PriorityLevel.MEDIUM,
        status: RequestStatus.NEW,
        equipmentId: data.equipmentId,
        teamId: data.teamId,
        createdBy: userId, // Automatically linked from the token
      },
    });
  }

  async getMyRequests(userId: string) {
    return prisma.maintenanceRequest.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        equipment: true,
        team: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMyEquipment(userId: string) {
    return prisma.equipmentAssignment.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        equipment: {
          include: {
            primaryTeam: true,
          },
        },
      },
    });
  }
}
