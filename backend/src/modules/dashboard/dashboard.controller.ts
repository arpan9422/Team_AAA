import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import prisma from '../../config/database';
import { RequestStatus } from '@prisma/client';

export class DashboardController {
  getTotalEquipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId, status } = req.query;

      const count = await prisma.equipment.count({
        where: {
          ...(teamId && { primaryTeamId: teamId as string }),
          ...(status && { status: status as any }),
        },
      });

      res.json({ total: count });
    } catch (error) {
      next(error);
    }
  };

  getActiveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;

      const count = await prisma.maintenanceRequest.count({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          ...(teamId && { teamId: teamId as string }),
        },
        include: {
          equipment: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      });

      res.json({
        total: count,
        requests,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompletedThisMonth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;

      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.maintenanceRequest.count({
        where: {
          status: RequestStatus.REPAIRED,
          completedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          status: RequestStatus.REPAIRED,
          completedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
          ...(teamId && { teamId: teamId as string }),
        },
        include: {
          equipment: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });

      res.json({
        total: count,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        requests,
      });
    } catch (error) {
      next(error);
    }
  };

  getOverdueRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;
      const now = new Date();

      const count = await prisma.maintenanceRequest.count({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          scheduledDate: {
            lt: now,
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          scheduledDate: {
            lt: now,
          },
          ...(teamId && { teamId: teamId as string }),
        },
        include: {
          equipment: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
              location: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { scheduledDate: 'asc' }],
      });

      res.json({
        total: count,
        requests,
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.query;
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Total equipment
      const totalEquipment = await prisma.equipment.count({
        where: {
          ...(teamId && { primaryTeamId: teamId as string }),
        },
      });

      // Active equipment
      const activeEquipment = await prisma.equipment.count({
        where: {
          status: 'ACTIVE',
          ...(teamId && { primaryTeamId: teamId as string }),
        },
      });

      // Active requests (NEW + IN_PROGRESS)
      const activeRequests = await prisma.maintenanceRequest.count({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      // Completed this month
      const completedThisMonth = await prisma.maintenanceRequest.count({
        where: {
          status: RequestStatus.REPAIRED,
          completedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      // Overdue requests
      const overdueRequests = await prisma.maintenanceRequest.count({
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          scheduledDate: {
            lt: now,
          },
          ...(teamId && { teamId: teamId as string }),
        },
      });

      // New requests (unassigned)
      const newRequests = await prisma.maintenanceRequest.count({
        where: {
          status: RequestStatus.NEW,
          technicalId: null,
          ...(teamId && { teamId: teamId as string }),
        },
      });

      // Requests by priority
      const requestsByPriority = await prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        where: {
          status: {
            in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS],
          },
          ...(teamId && { teamId: teamId as string }),
        },
        _count: true,
      });

      const priorityBreakdown = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      };

      requestsByPriority.forEach((item) => {
        priorityBreakdown[item.priority] = item._count;
      });

      // Active technicians
      const activeTechnicians = await prisma.user.count({
        where: {
          role: 'TECHNICIAN',
          isActive: true,
          ...(teamId && { teamId: teamId as string }),
        },
      });

      res.json({
        equipment: {
          total: totalEquipment,
          active: activeEquipment,
          scrapped: totalEquipment - activeEquipment,
        },
        requests: {
          active: activeRequests,
          completedThisMonth,
          overdue: overdueRequests,
          new: newRequests,
          byPriority: priorityBreakdown,
        },
        technicians: {
          active: activeTechnicians,
        },
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      });
    } catch (error) {
      next(error);
    }
  };
}
