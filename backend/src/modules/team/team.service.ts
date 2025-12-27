import { TeamRepository } from './team.repository';
import { CreateTeamInput, UpdateTeamInput } from './team.validation';

export class TeamService {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async getAllTeams(includeInactive: boolean = false) {
    return this.teamRepository.findAll(includeInactive);
  }

  async getTeamById(id: string) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }
    return team;
  }

  async createTeam(data: CreateTeamInput) {
    return this.teamRepository.create(data);
  }

  async updateTeam(id: string, data: UpdateTeamInput) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }
    return this.teamRepository.update(id, data);
  }

  async deleteTeam(id: string) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }

    const equipmentCount = await this.teamRepository.countEquipmentByTeam(id);
    if (equipmentCount > 0) {
      throw new Error(
        `Cannot delete team. ${equipmentCount} equipment item(s) are assigned to this team. Please reassign them first.`
      );
    }

    return this.teamRepository.delete(id);
  }

  async addTeamMember(teamId: string, userId: string) {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const isMember = await this.teamRepository.isMemberOfTeam(teamId, userId);
    if (isMember) {
      throw new Error('User is already a member of this team');
    }

    return this.teamRepository.addMember(teamId, userId);
  }

  async removeTeamMember(teamId: string, userId: string) {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const result = await this.teamRepository.removeMember(teamId, userId);
    if (!result) {
      throw new Error('User is not a member of this team');
    }

    return result;
  }

  async getTeamMembers(teamId: string) {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return this.teamRepository.getTeamMembers(teamId);
  }
}
