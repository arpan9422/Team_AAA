import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class KanbanService {
  async getAllRequests() {
    // Only show requests that are IN_PROGRESS or beyond (not NEW or PENDING_APPROVAL)
    return prisma.maintenanceRequest.findMany({
      where: {
        status: {
          notIn: [RequestStatus.NEW, RequestStatus.PENDING_APPROVAL],
        },
      },
      include: {
        equipment: true,
        team: true,
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateRequestStatus(id: string, status: RequestStatus) {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Maintenance request not found');
    }

    const updateData: any = { status };

    // Set timestamps based on status
    if (status === RequestStatus.IN_PROGRESS && !request.scheduledDate) {
      updateData.scheduledDate = new Date();
    } else if ((status === RequestStatus.REPAIRED || status === RequestStatus.SCRAP) && !request.completedAt) {
      updateData.completedAt = new Date();
    }

    return prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        equipment: true,
        technician: true,
      },
    });
  }
}
