import { MaintenanceRequestRepository } from './maintenance-request.repository';
import { EquipmentRepository } from '../equipment/equipment.repository';
import { TeamRepository } from '../team/team.repository';
import {
  CreateMaintenanceRequestInput,
  ReassignRequestInput,
  RejectAssignmentInput,
  UpdateRequestPriorityInput,
  UpdateRequestStatusInput,
  AcceptRequestInput,
} from './maintenance-request.validation';
import { RequestStatus, PriorityLevel, EquipmentStatus } from '@prisma/client';

export class MaintenanceRequestService {
  private requestRepository: MaintenanceRequestRepository;
  private equipmentRepository: EquipmentRepository;
  private teamRepository: TeamRepository;

  constructor() {
    this.requestRepository = new MaintenanceRequestRepository();
    this.equipmentRepository = new EquipmentRepository();
    this.teamRepository = new TeamRepository();
  }

  async getAllRequests(filters?: {
    status?: RequestStatus;
    teamId?: string;
    technicianId?: string;
    equipmentId?: string;
    priority?: PriorityLevel;
  }) {
    return this.requestRepository.findAll(filters);
  }

  async getRequestById(id: string) {
    const request = await this.requestRepository.findById(id);
    if (!request) {
      throw new Error('Maintenance request not found');
    }
    return request;
  }

  async createRequest(data: CreateMaintenanceRequestInput, createdBy: string) {
    // Check if equipment exists and is not scrapped
    const equipment = await this.equipmentRepository.findById(data.equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      throw new Error('Cannot create maintenance request for scrapped equipment');
    }

    // Get equipment's primary team
    if (!equipment.primaryTeamId) {
      throw new Error('Equipment must have a primary team assigned');
    }

    const team = await this.teamRepository.findById(equipment.primaryTeamId);
    if (!team || !team.isActive) {
      throw new Error('Equipment team is not active');
    }

    // Create request
    return this.requestRepository.create({
      ...data,
      teamId: equipment.primaryTeamId,
      createdBy,
    });
  }

  async reassignRequest(requestId: string, data: ReassignRequestInput, managerId: string) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.status === RequestStatus.REPAIRED || request.status === RequestStatus.SCRAP) {
      throw new Error('Cannot reassign completed or scrapped requests');
    }

    // Check if the new technician exists and is in the same team
    const technicians = await this.requestRepository.getTeamTechnicians(request.teamId!);
    const newTechnician = technicians.find((t) => t.id === data.technicianId);

    if (!newTechnician) {
      throw new Error('Technician not found or not in the request team');
    }

    // Decrease old technician's load if assigned
    if (request.technicalId) {
      await this.requestRepository.updateTechnicianLoad(request.technicalId, -1);
    }

    // Increase new technician's load
    await this.requestRepository.updateTechnicianLoad(data.technicianId, 1);

    // Reassign request
    const updatedRequest = await this.requestRepository.assignToTechnician(
      requestId,
      data.technicianId,
      managerId
    );

    // Log escalation with reason
    await this.requestRepository.addEscalationLog(requestId, data.reason);

    return {
      request: updatedRequest,
      message: 'Request reassigned successfully',
    };
  }

  async rejectAndReassign(
    requestId: string,
    data: RejectAssignmentInput,
    managerId: string
  ) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (!request.technicalId) {
      throw new Error('No technician assigned to reject');
    }

    if (request.status === RequestStatus.REPAIRED || request.status === RequestStatus.SCRAP) {
      throw new Error('Cannot reject assignment for completed or scrapped requests');
    }

    // Decrease current technician's load
    await this.requestRepository.updateTechnicianLoad(request.technicalId, -1);

    // Log the rejection as escalation
    await this.requestRepository.addEscalationLog(
      requestId,
      `Manager rejected assignment: ${data.reason}`
    );

    // If reassignTo is provided, assign to that technician
    if (data.reassignTo) {
      const technicians = await this.requestRepository.getTeamTechnicians(request.teamId!);
      const newTechnician = technicians.find((t) => t.id === data.reassignTo);

      if (!newTechnician) {
        throw new Error('New technician not found or not in the request team');
      }

      // Increase new technician's load
      await this.requestRepository.updateTechnicianLoad(data.reassignTo, 1);

      const updatedRequest = await this.requestRepository.assignToTechnician(
        requestId,
        data.reassignTo,
        managerId
      );

      return {
        request: updatedRequest,
        message: 'Assignment rejected and reassigned to another technician',
      };
    } else {
      // Just unassign - set status back to NEW
      const updatedRequest = await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: {
          technicalId: null,
          status: RequestStatus.NEW,
        },
        include: {
          equipment: true,
          team: true,
        },
      });

      return {
        request: updatedRequest,
        message: 'Assignment rejected. Request is now available for technicians to accept',
      };
    }
  }

  async updateRequestPriority(requestId: string, data: UpdateRequestPriorityInput) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.status === RequestStatus.REPAIRED || request.status === RequestStatus.SCRAP) {
      throw new Error('Cannot update priority for completed or scrapped requests');
    }

    await this.requestRepository.updatePriority(requestId, data.priority);

    if (data.reason) {
      await this.requestRepository.addEscalationLog(
        requestId,
        `Priority changed to ${data.priority}: ${data.reason}`
      );
    }

    return { message: 'Priority updated successfully' };
  }

  async updateRequestStatus(requestId: string, data: UpdateRequestStatusInput) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    const newStatus = data.status as RequestStatus;

    // Adjust technician load when completing
    if (
      newStatus === RequestStatus.REPAIRED &&
      request.technicalId &&
      request.status !== RequestStatus.REPAIRED
    ) {
      await this.requestRepository.updateTechnicianLoad(request.technicalId, -1);
    }

    await this.requestRepository.updateStatus(requestId, newStatus);

    if (data.reason) {
      await this.requestRepository.addEscalationLog(
        requestId,
        `Status changed to ${newStatus}: ${data.reason}`
      );
    }

    return { message: 'Status updated successfully' };
  }

  async getTeamRequests(teamId: string, status?: RequestStatus) {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return this.requestRepository.getTeamRequests(teamId, status);
  }

  async getTeamTechnicians(teamId: string) {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return this.requestRepository.getTeamTechnicians(teamId);
  }

  async getRequestStatistics(teamId?: string) {
    const stats = await this.requestRepository.countRequestsByStatus(teamId);

    const result: Record<string, number> = {
      NEW: 0,
      IN_PROGRESS: 0,
      REPAIRED: 0,
      SCRAP: 0,
      TOTAL: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = stat._count;
      result.TOTAL += stat._count;
    });

    return result;
  }

  async getAssignmentHistory(requestId: string) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    return this.requestRepository.getAssignmentHistory(requestId);
  }

  async acceptRequest(requestId: string, technicianId: string, data: AcceptRequestInput) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.status !== RequestStatus.NEW) {
      throw new Error('Only NEW requests can be accepted');
    }

    if (request.technicalId) {
      throw new Error('Request is already assigned to a technician');
    }

    // Check if technician is in the request's team
    const technicians = await this.requestRepository.getTeamTechnicians(request.teamId!);
    const technician = technicians.find((t) => t.id === technicianId);

    if (!technician) {
      throw new Error('Technician not found or not in the request team');
    }

    // Increase technician's load
    await this.requestRepository.updateTechnicianLoad(technicianId, 1);

    // Assign to technician and update status
    const updatedRequest = await this.requestRepository.assignToTechnician(
      requestId,
      technicianId,
      technicianId // self-assigned
    );

    return {
      request: updatedRequest,
      message: 'Request accepted successfully',
    };
  }

  // TECHNICIAN-SPECIFIC METHODS

  async getMyRequests(technicianId: string, filters?: { status?: RequestStatus }) {
    // Get technician's team
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
      include: { team: true },
    });

    if (!technician || !technician.teamId) {
      throw new Error('Technician not found or not assigned to a team');
    }

    return this.requestRepository.findAll({
      teamId: technician.teamId,
      ...filters,
    });
  }

  async startRequest(requestId: string, technicianId: string) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.status !== RequestStatus.NEW) {
      throw new Error('Only NEW requests can be started');
    }

    // Verify technician is in the request's team
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
      include: { team: true },
    });

    if (!technician || technician.teamId !== request.teamId) {
      throw new Error('You are not authorized to start this request');
    }

    // Check if equipment is unrepairable
    if (request.equipmentId) {
      const equipment = await this.equipmentRepository.findById(request.equipmentId);
      if (equipment?.isUnrepairable) {
        throw new Error('This equipment is marked as unrepairable and cannot be worked on');
      }
    }

    // Start the request
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.IN_PROGRESS,
        assignedTechnicianId: technicianId,
        startTime: new Date(),
      },
      include: {
        equipment: true,
        team: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Increase technician load
    await this.requestRepository.updateTechnicianLoad(technicianId, 1);

    return {
      request: updatedRequest,
      message: 'Request started successfully',
    };
  }

  async updateProgress(
    requestId: string,
    technicianId: string,
    data: { workNotes?: string; pauseWork?: boolean }
  ) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.assignedTechnicianId !== technicianId) {
      throw new Error('You are not assigned to this request');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new Error('Request is not in progress');
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        workNotes: data.workNotes || request.workNotes,
      },
      include: {
        equipment: true,
        team: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      request: updatedRequest,
      message: 'Progress updated successfully',
    };
  }

  async completeRequest(
    requestId: string,
    technicianId: string,
    data: {
      hoursSpent: number;
      rootCause: string;
      isTemporaryFix?: boolean;
      workNotes?: string;
    }
  ) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.assignedTechnicianId !== technicianId) {
      throw new Error('You are not assigned to this request');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new Error('Request is not in progress');
    }

    const endTime = new Date();

    // Update request
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REPAIRED,
        endTime,
        completedAt: endTime,
        hoursSpent: data.hoursSpent,
        rootCause: data.rootCause as any,
        isTemporaryFix: data.isTemporaryFix || false,
        workNotes: data.workNotes || request.workNotes,
      },
      include: {
        equipment: true,
        team: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Decrease technician load
    await this.requestRepository.updateTechnicianLoad(technicianId, -1);

    // Update equipment health score
    if (request.equipmentId) {
      await this.updateEquipmentHealthScore(request.equipmentId);
    }

    return {
      request: updatedRequest,
      message: 'Request completed successfully',
    };
  }

  async markUnrepairable(
    requestId: string,
    technicianId: string,
    data: { reason: string }
  ) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.assignedTechnicianId !== technicianId) {
      throw new Error('You are not assigned to this request');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new Error('Request is not in progress');
    }

    if (!request.equipmentId) {
      throw new Error('No equipment associated with this request');
    }

    // Mark equipment as unrepairable
    await prisma.equipment.update({
      where: { id: request.equipmentId },
      data: {
        isUnrepairable: true,
        scrapNotes: data.reason,
        healthScore: 'RED',
      },
    });

    // Update request status to SCRAP
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.SCRAP,
        endTime: new Date(),
        completedAt: new Date(),
        workNotes: `MARKED AS UNREPAIRABLE: ${data.reason}`,
      },
      include: {
        equipment: true,
        team: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Decrease technician load
    await this.requestRepository.updateTechnicianLoad(technicianId, -1);

    return {
      request: updatedRequest,
      message: 'Equipment marked as unrepairable. Manager will be notified for scrap decision.',
    };
  }

  async escalateRequest(
    requestId: string,
    technicianId: string,
    data: { reason: string }
  ) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    if (request.assignedTechnicianId !== technicianId) {
      throw new Error('You are not assigned to this request');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new Error('Request is not in progress');
    }

    // Update request status to ESCALATED
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.ESCALATED,
        workNotes: `ESCALATED: ${data.reason}\n\n${request.workNotes || ''}`,
      },
      include: {
        equipment: true,
        team: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create escalation log
    await prisma.escalationLog.create({
      data: {
        requestId,
        reason: data.reason,
        escalatedBy: technicianId,
      },
    });

    return {
      request: updatedRequest,
      message: 'Request escalated to manager successfully',
    };
  }

  async getMyWorkHistory(technicianId: string) {
    return prisma.maintenanceRequest.findMany({
      where: {
        assignedTechnicianId: technicianId,
        status: {
          in: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
        },
      },
      include: {
        equipment: true,
        team: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }

  private async updateEquipmentHealthScore(equipmentId: string) {
    // Get equipment maintenance history
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        equipmentId,
        status: {
          in: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10, // Last 10 requests
    });

    if (requests.length === 0) return;

    // Calculate metrics
    const totalRequests = requests.length;
    const temporaryFixes = requests.filter((r) => r.isTemporaryFix).length;
    const avgHoursSpent =
      requests.reduce((sum, r) => sum + (r.hoursSpent || 0), 0) / totalRequests;

    // Simple health score logic
    let healthScore: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';

    // RED: More than 5 requests in last 10, or more than 40% temporary fixes
    if (totalRequests > 5 || temporaryFixes / totalRequests > 0.4) {
      healthScore = 'RED';
    }
    // YELLOW: 3-5 requests or 20-40% temporary fixes
    else if (totalRequests >= 3 || temporaryFixes / totalRequests > 0.2) {
      healthScore = 'YELLOW';
    }

    // Update equipment health score
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { healthScore },
    });
  }
}

// Need to import prisma for the reject and reassign method
import prisma from '../../config/database';

