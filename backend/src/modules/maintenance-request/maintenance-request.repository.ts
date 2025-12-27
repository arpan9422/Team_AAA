import prisma from '../../config/database';
import { CreateMaintenanceRequestInput } from './maintenance-request.validation';
import { RequestStatus, PriorityLevel } from '@prisma/client';

export class MaintenanceRequestRepository {
  async findAll(filters?: {
    status?: RequestStatus;
    teamId?: string;
    technicianId?: string;
    equipmentId?: string;
    priority?: PriorityLevel;
  }) {
    return prisma.maintenanceRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.teamId && { teamId: filters.teamId }),
        ...(filters?.technicianId && { technicalId: filters.technicianId }),
        ...(filters?.equipmentId && { equipmentId: filters.equipmentId }),
        ...(filters?.priority && { priority: filters.priority }),
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            location: true,
            status: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            type: true,
            location: true,
            department: true,
            status: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignmentHistory: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignerUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
        workLogs: {
          include: {
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { loggedAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateMaintenanceRequestInput & { teamId: string; createdBy: string }) {
    return prisma.maintenanceRequest.create({
      data,
      include: {
        equipment: true,
        team: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async assignToTechnician(requestId: string, technicianId: string, assignedBy: string) {
    // Update the request
    const request = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        technicalId: technicianId,
        status: RequestStatus.IN_PROGRESS,
      },
      include: {
        technician: true,
        equipment: true,
      },
    });

    // Record in assignment history
    await prisma.assignmentHistory.create({
      data: {
        requestId,
        assignedTo: technicianId,
        assignedBy,
      },
    });

    return request;
  }

  async updateStatus(id: string, status: RequestStatus) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        ...(status === RequestStatus.REPAIRED && { completedAt: new Date() }),
      },
    });
  }

  async updatePriority(id: string, priority: PriorityLevel) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data: { priority },
    });
  }

  async getTeamRequests(teamId: string, status?: RequestStatus) {
    return prisma.maintenanceRequest.findMany({
      where: {
        teamId,
        ...(status && { status }),
      },
      include: {
        equipment: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getTechnicianRequests(technicianId: string, status?: RequestStatus) {
    return prisma.maintenanceRequest.findMany({
      where: {
        technicalId: technicianId,
        ...(status && { status }),
      },
      include: {
        equipment: true,
        team: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getAssignmentHistory(requestId: string) {
    return prisma.assignmentHistory.findMany({
      where: { requestId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignerUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async addEscalationLog(requestId: string, reason: string) {
    return prisma.escalationLog.create({
      data: {
        requestId,
        reason,
      },
    });
  }

  async getTeamTechnicians(teamId: string) {
    return prisma.user.findMany({
      where: {
        teamId,
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        technicianProfile: {
          select: {
            currentLoad: true,
            skillTags: true,
            experienceYears: true,
          },
        },
      },
    });
  }

  async countRequestsByStatus(teamId?: string) {
    return prisma.maintenanceRequest.groupBy({
      by: ['status'],
      where: teamId ? { teamId } : {},
      _count: true,
    });
  }

  async updateTechnicianLoad(technicianId: string, increment: number) {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: technicianId },
    });

    if (!profile) {
      return null;
    }

    return prisma.technicianProfile.update({
      where: { userId: technicianId },
      data: {
        currentLoad: Math.max(0, profile.currentLoad + increment),
      },
    });
  }
}
