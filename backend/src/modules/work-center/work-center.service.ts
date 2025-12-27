import { WorkCenterRepository } from './work-center.repository';
import { MaintenanceRequestRepository } from '../maintenance-request/maintenance-request.repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkCenterService {
  private workCenterRepo: WorkCenterRepository;
  private requestRepo: MaintenanceRequestRepository;

  constructor() {
    this.workCenterRepo = new WorkCenterRepository();
    this.requestRepo = new MaintenanceRequestRepository();
  }

  async createWorkCenter(data: {
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
    // Check if code already exists
    const codeExists = await this.workCenterRepo.checkCodeExists(data.code);
    if (codeExists) {
      throw new Error('Work center code already exists');
    }

    // Validate assigned workers are technicians
    if (data.assignedWorkerIds && data.assignedWorkerIds.length > 0) {
      const users = await prisma.user.findMany({
        where: {
          id: { in: data.assignedWorkerIds },
          role: 'TECHNICIAN',
        },
      });

      if (users.length !== data.assignedWorkerIds.length) {
        throw new Error('All assigned workers must be technicians');
      }
    }

    return await this.workCenterRepo.create(data);
  }

  async getAllWorkCenters(includeInactive: boolean = false) {
    return await this.workCenterRepo.findAll(includeInactive);
  }

  async getWorkCenterById(id: string) {
    const workCenter = await this.workCenterRepo.findById(id);
    if (!workCenter) {
      throw new Error('Work center not found');
    }
    return workCenter;
  }

  async updateWorkCenter(
    id: string,
    data: {
      name?: string;
      code?: string;
      type?: string;
      tag?: string;
      location?: string;
      costPerHour?: number;
      capacity?: number;
      timeEfficiency?: number;
      oeeTarget?: number;
      isActive?: boolean;
    }
  ) {
    const workCenter = await this.workCenterRepo.findById(id);
    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Check if code is being changed and if it already exists
    if (data.code && data.code !== workCenter.code) {
      const codeExists = await this.workCenterRepo.checkCodeExists(data.code, id);
      if (codeExists) {
        throw new Error('Work center code already exists');
      }
    }

    return await this.workCenterRepo.update(id, data);
  }

  async deleteWorkCenter(id: string) {
    const workCenter = await this.workCenterRepo.findById(id);
    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Check if there are active maintenance requests
    const activeRequests = await prisma.maintenanceRequest.count({
      where: {
        workCenterId: id,
        status: {
          in: ['IN_PROGRESS', 'PENDING_APPROVAL'],
        },
      },
    });

    if (activeRequests > 0) {
      throw new Error(
        'Cannot delete work center with active maintenance requests. Please complete or reassign them first.'
      );
    }

    return await this.workCenterRepo.delete(id);
  }

  async assignWorkers(workCenterId: string, workerIds: string[]) {
    const workCenter = await this.workCenterRepo.findById(workCenterId);
    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Validate all workers are technicians
    const users = await prisma.user.findMany({
      where: {
        id: { in: workerIds },
        role: 'TECHNICIAN',
      },
    });

    if (users.length !== workerIds.length) {
      throw new Error('All assigned workers must be technicians');
    }

    return await this.workCenterRepo.assignWorkers(workCenterId, workerIds);
  }

  async assignTask(
    workCenterId: string,
    managerId: string,
    data: {
      title: string;
      description?: string;
      technicianId: string;
      equipmentId?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requestType: 'CORRECTIVE' | 'PREVENTIVE';
      scheduledDate?: string;
    }
  ) {
    // Verify work center exists
    const workCenter = await this.workCenterRepo.findById(workCenterId);
    if (!workCenter) {
      throw new Error('Work center not found');
    }

    // Verify technician exists and is assigned to this work center
    const isAssigned = workCenter.assignedWorkers.some(
      (worker) => worker.userId === data.technicianId
    );

    if (!isAssigned) {
      throw new Error('Technician is not assigned to this work center');
    }

    // Verify technician role
    const technician = await prisma.user.findUnique({
      where: { id: data.technicianId },
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      throw new Error('Invalid technician');
    }

    // Create maintenance request with IN_PROGRESS status (manager directly assigns)
    const request = await prisma.maintenanceRequest.create({
      data: {
        title: data.title,
        description: data.description,
        requestType: data.requestType,
        equipmentId: data.equipmentId,
        workCenterId: workCenterId,
        assignedTechnicianId: data.technicianId,
        status: 'IN_PROGRESS', // Directly start work since manager assigns
        priority: data.priority || 'MEDIUM',
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        startTime: new Date(), // Set start time immediately
        createdBy: managerId,
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
        workCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Create assignment history
    await prisma.assignmentHistory.create({
      data: {
        requestId: request.id,
        assignedTo: data.technicianId,
        assignedBy: managerId,
      },
    });

    return request;
  }

  async getWorkCenterStatistics(workCenterId: string) {
    const workCenter = await this.workCenterRepo.findById(workCenterId);
    if (!workCenter) {
      throw new Error('Work center not found');
    }

    const [totalTasks, activeTasks, completedTasks, avgCompletionTime] = await Promise.all([
      prisma.maintenanceRequest.count({
        where: { workCenterId },
      }),
      prisma.maintenanceRequest.count({
        where: {
          workCenterId,
          status: { in: ['IN_PROGRESS', 'PENDING_APPROVAL'] },
        },
      }),
      prisma.maintenanceRequest.count({
        where: {
          workCenterId,
          status: 'REPAIRED',
        },
      }),
      prisma.maintenanceRequest.aggregate({
        where: {
          workCenterId,
          status: 'REPAIRED',
          hoursSpent: { not: null },
        },
        _avg: {
          hoursSpent: true,
        },
      }),
    ]);

    return {
      workCenter,
      statistics: {
        totalTasks,
        activeTasks,
        completedTasks,
        avgCompletionTime: avgCompletionTime._avg.hoursSpent || 0,
      },
    };
  }
}
