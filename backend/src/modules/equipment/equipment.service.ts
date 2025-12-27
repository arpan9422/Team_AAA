import { EquipmentRepository } from './equipment.repository';
import { TeamRepository } from '../team/team.repository';
import { AuthRepository } from '../auth/auth.repository';
import {
  CreateEquipmentInput,
  UpdateEquipmentInput,
  ChangeTeamInput,
  ChangeStatusInput,
  AssignEquipmentInput,
  ReturnEquipmentInput,
} from './equipment.validation';
import { EquipmentStatus, EquipmentEvent } from '@prisma/client';

export class EquipmentService {
  private equipmentRepository: EquipmentRepository;
  private teamRepository: TeamRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.equipmentRepository = new EquipmentRepository();
    this.teamRepository = new TeamRepository();
    this.authRepository = new AuthRepository();
  }

  async getAllEquipment(filters?: {
    status?: EquipmentStatus;
    teamId?: string;
    location?: string;
    department?: string;
  }) {
    return this.equipmentRepository.findAll(filters);
  }

  async getEquipmentById(id: string) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const isUnderWarranty = await this.equipmentRepository.checkWarrantyStatus(id);

    return {
      ...equipment,
      isUnderWarranty,
    };
  }

  async createEquipment(data: CreateEquipmentInput & { primaryTeamId: string }) {
    const team = await this.teamRepository.findById(data.primaryTeamId);
    if (!team) {
      throw new Error('Primary team not found');
    }

    if (!team.isActive) {
      throw new Error('Cannot assign equipment to an inactive team');
    }

    const existingEquipment = await this.equipmentRepository.findBySerialNumber(
      data.serialNumber
    );
    if (existingEquipment) {
      throw new Error('Equipment with this serial number already exists');
    }

    const equipment = await this.equipmentRepository.create(data);

    await this.equipmentRepository.addHistory(
      equipment.id,
      EquipmentEvent.CREATED,
      `Equipment created and assigned to team: ${team.name}`
    );

    return equipment;
  }

  async updateEquipment(id: string, data: UpdateEquipmentInput) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      throw new Error('Cannot update scrapped equipment');
    }

    return this.equipmentRepository.update(id, data);
  }

  async changePrimaryTeam(id: string, data: ChangeTeamInput) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      throw new Error('Cannot change team for scrapped equipment');
    }

    const newTeam = await this.teamRepository.findById(data.primaryTeamId);
    if (!newTeam) {
      throw new Error('New team not found');
    }

    if (!newTeam.isActive) {
      throw new Error('Cannot assign equipment to an inactive team');
    }

    if (equipment.primaryTeamId === data.primaryTeamId) {
      throw new Error('Equipment is already assigned to this team');
    }

    await this.equipmentRepository.changeTeam(id, data.primaryTeamId);

    await this.equipmentRepository.addHistory(
      id,
      EquipmentEvent.TEAM_CHANGED,
      data.reason ||
        `Team changed from ${equipment.primaryTeam?.name || 'N/A'} to ${newTeam.name}. Future requests will be assigned to the new team.`
    );

    return { message: 'Team changed successfully. Future requests will use the new team.' };
  }

  async changeStatus(id: string, data: ChangeStatusInput) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.status === data.status) {
      throw new Error(`Equipment is already marked as ${data.status}`);
    }

    await this.equipmentRepository.changeStatus(id, data.status);

    const eventType =
      data.status === EquipmentStatus.SCRAPPED
        ? EquipmentEvent.SCRAPPED
        : EquipmentEvent.REPAIRED;

    const eventNote =
      data.status === EquipmentStatus.SCRAPPED
        ? data.reason || 'Equipment marked as scrapped. No new maintenance requests can be created.'
        : data.reason || 'Equipment reactivated and available for use.';

    await this.equipmentRepository.addHistory(id, eventType, eventNote);

    return {
      message:
        data.status === EquipmentStatus.SCRAPPED
          ? 'Equipment marked as scrapped. New maintenance requests are blocked.'
          : 'Equipment reactivated successfully.',
    };
  }

  async getEquipmentHistory(id: string) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    return this.equipmentRepository.getHistory(id);
  }

  async getEquipmentHealth(id: string) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const health = await this.equipmentRepository.getHealth(id);
    return health || null;
  }

  async getLocations() {
    return this.equipmentRepository.getUniqueLocations();
  }

  async getDepartments() {
    return this.equipmentRepository.getUniqueDepartments();
  }

  async checkWarrantyStatus(id: string) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const isUnderWarranty = await this.equipmentRepository.checkWarrantyStatus(id);

    return {
      isUnderWarranty,
      warrantyEnd: equipment.warrantyEnd,
      daysRemaining: equipment.warrantyEnd
        ? Math.ceil(
            (equipment.warrantyEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
    };
  }

  async assignEquipmentToUser(equipmentId: string, data: AssignEquipmentInput) {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.status === EquipmentStatus.SCRAPPED) {
      throw new Error('Cannot assign scrapped equipment');
    }

    const user = await this.authRepository.findUserById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Cannot assign equipment to an inactive user');
    }

    const assignment = await this.equipmentRepository.assignToUser(
      equipmentId,
      data.userId,
      data.notes
    );

    await this.equipmentRepository.addHistory(
      equipmentId,
      EquipmentEvent.TEAM_CHANGED,
      `Equipment assigned to user: ${user.name} (${user.email})`
    );

    return assignment;
  }

  async returnEquipmentFromUser(equipmentId: string, data: ReturnEquipmentInput) {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const activeAssignment = await this.equipmentRepository.getActiveAssignment(equipmentId);
    if (!activeAssignment) {
      throw new Error('No active assignment found for this equipment');
    }

    const returned = await this.equipmentRepository.returnEquipment(
      activeAssignment.id,
      data.notes
    );

    await this.equipmentRepository.addHistory(
      equipmentId,
      EquipmentEvent.TEAM_CHANGED,
      `Equipment returned by user: ${activeAssignment.user.name}`
    );

    return returned;
  }

  async getEquipmentAssignments(equipmentId: string) {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    return this.equipmentRepository.getEquipmentAssignments(equipmentId);
  }

  async getUserAssignments(userId: string, activeOnly: boolean = false) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.equipmentRepository.getUserAssignments(userId, activeOnly);
  }

  async getActiveAssignment(equipmentId: string) {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    return this.equipmentRepository.getActiveAssignment(equipmentId);
  }
}
