import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkCenterRepository {
  async create(data: {
    name: string;
    code: string;
    type?: string;
    tag?: string;
    location?: string;
    costPerHour?: number;
    capacity?: number;
    timeEfficiency?: number;
    oeeTarget?: number;
    assignedWorkerIds?: string[];
  }) {
    const { assignedWorkerIds, ...workCenterData } = data;

    return await prisma.workCenter.create({
      data: {
        ...workCenterData,
        assignedWorkers: assignedWorkerIds
          ? {
              create: assignedWorkerIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignedWorkers: {
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
        },
      },
    });
  }

  async findAll(includeInactive: boolean = false) {
    return await prisma.workCenter.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        assignedWorkers: {
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
        },
        _count: {
          select: {
            maintenanceRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return await prisma.workCenter.findUnique({
      where: { id },
      include: {
        assignedWorkers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                technicianProfile: true,
              },
            },
          },
        },
        maintenanceRequests: {
          where: {
            status: {
              in: ['IN_PROGRESS', 'PENDING_APPROVAL'],
            },
          },
          include: {
            assignedTechnician: {
              select: {
                id: true,
                name: true,
                email: true,
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            maintenanceRequests: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.WorkCenterUpdateInput
  ) {
    return await prisma.workCenter.update({
      where: { id },
      data,
      include: {
        assignedWorkers: {
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
        },
      },
    });
  }

  async delete(id: string) {
    return await prisma.workCenter.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignWorkers(workCenterId: string, workerIds: string[]) {
    // First, remove existing workers
    await prisma.workCenterWorker.deleteMany({
      where: { workCenterId },
    });

    // Then, add new workers
    await prisma.workCenterWorker.createMany({
      data: workerIds.map((userId) => ({
        workCenterId,
        userId,
      })),
    });

    return await this.findById(workCenterId);
  }

  async checkCodeExists(code: string, excludeId?: string) {
    const where: Prisma.WorkCenterWhereInput = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const workCenter = await prisma.workCenter.findFirst({ where });
    return !!workCenter;
  }
}
