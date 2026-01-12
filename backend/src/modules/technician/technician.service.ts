import prisma from '../../config/database';
import { RequestStatus } from '@prisma/client';

export class TechnicianService {
  async getDashboard(technicianId: string) {
    // Get technician details
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
      include: {
        team: true,
        technicianProfile: true,
      },
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      throw new Error('Technician not found');
    }

    if (!technician.teamId) {
      return {
        technician: {
          id: technician.id,
          name: technician.name,
          email: technician.email,
          team: null,
          profile: technician.technicianProfile,
        },
        stats: {
          activeJobs: 0,
          pendingJobs: 0,
          completedThisMonth: 0,
          overdueJobs: 0,
        },
        recentCompletedJobs: [],
      };
    }

    // Get active jobs count (IN_PROGRESS)
    const activeJobs = await prisma.maintenanceRequest.count({
      where: {
        assignedTechnicianId: technicianId,
        status: RequestStatus.IN_PROGRESS,
      },
    });

    // Get pending jobs in queue (NEW requests in team)
    const pendingJobs = await prisma.maintenanceRequest.count({
      where: {
        teamId: technician.teamId,
        status: RequestStatus.NEW,
      },
    });

    // Get jobs completed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await prisma.maintenanceRequest.count({
      where: {
        assignedTechnicianId: technicianId,
        status: {
          in: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
        },
        completedAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get overdue jobs (started more than 24 hours ago and still in progress)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const overdueJobs = await prisma.maintenanceRequest.count({
      where: {
        assignedTechnicianId: technicianId,
        status: RequestStatus.IN_PROGRESS,
        startTime: {
          lt: oneDayAgo,
        },
      },
    });

    // Get recent completed jobs
    const recentCompletedJobs = await prisma.maintenanceRequest.findMany({
      where: {
        assignedTechnicianId: technicianId,
        status: {
          in: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
        },
      },
      include: {
        equipment: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
    });

    return {
      technician: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        team: technician.team,
        profile: technician.technicianProfile,
      },
      stats: {
        activeJobs,
        pendingJobs,
        completedThisMonth,
        overdueJobs,
      },
      recentCompletedJobs,
    };
  }

  async getEquipmentHistory(equipmentId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        primaryTeam: true,
      },
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    // Get maintenance history
    const maintenanceHistory = await prisma.maintenanceRequest.findMany({
      where: {
        equipmentId,
      },
      include: {
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
        team: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate equipment metrics
    const totalRequests = maintenanceHistory.length;
    const completedRequests = maintenanceHistory.filter(
      (r) => r.status === RequestStatus.REPAIRED || r.status === RequestStatus.SCRAP
    ).length;
    const temporaryFixes = maintenanceHistory.filter((r) => r.isTemporaryFix).length;
    const avgHoursSpent =
      completedRequests > 0
        ? maintenanceHistory
          .filter((r) => r.hoursSpent)
          .reduce((sum, r) => sum + (r.hoursSpent || 0), 0) / completedRequests
        : 0;

    // Check if under warranty
    const isUnderWarranty = equipment.warrantyEnd
      ? new Date(equipment.warrantyEnd) > new Date()
      : false;

    return {
      equipment: {
        id: equipment.id,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        type: equipment.type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        location: equipment.location,
        status: equipment.status,
        healthScore: equipment.healthScore,
        isUnrepairable: equipment.isUnrepairable,
        scrapNotes: equipment.scrapNotes,
        warrantyEnd: equipment.warrantyEnd,
        isUnderWarranty,
        primaryTeam: equipment.primaryTeam,
      },
      metrics: {
        totalRequests,
        completedRequests,
        temporaryFixes,
        avgHoursSpent: Math.round(avgHoursSpent * 100) / 100,
      },
      maintenanceHistory,
    };
  }
}
