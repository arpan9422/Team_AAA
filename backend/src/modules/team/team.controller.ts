import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { TeamService } from './team.service';
import { CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from './team.validation';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  getAllTeams = async (req: AuthRequest, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const teams = await this.teamService.getAllTeams(includeInactive);
      return res.status(200).json({ teams });
    } catch (error: any) {
      console.error('Get all teams error:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
  };

  getTeamById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const team = await this.teamService.getTeamById(id);
      return res.status(200).json({ team });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Get team error:', error);
      return res.status(500).json({ error: 'Failed to fetch team' });
    }
  };

  createTeam = async (req: AuthRequest, res: Response) => {
    try {
      const data: CreateTeamInput = req.body;
      const team = await this.teamService.createTeam(data);
      return res.status(201).json({ message: 'Team created successfully', team });
    } catch (error: any) {
      console.error('Create team error:', error);
      return res.status(500).json({ error: 'Failed to create team' });
    }
  };

  updateTeam = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const data: UpdateTeamInput = req.body;
      const team = await this.teamService.updateTeam(id, data);
      return res.status(200).json({ message: 'Team updated successfully', team });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Update team error:', error);
      return res.status(500).json({ error: 'Failed to update team' });
    }
  };

  deleteTeam = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.teamService.deleteTeam(id);
      return res.status(200).json({ message: 'Team deactivated successfully' });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot delete team')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Delete team error:', error);
      return res.status(500).json({ error: 'Failed to delete team' });
    }
  };

  addTeamMember = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { userId }: AddTeamMemberInput = req.body;
      const member = await this.teamService.addTeamMember(id, userId);
      return res.status(201).json({ message: 'Member added successfully', member });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'User is already a member of this team') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Add team member error:', error);
      return res.status(500).json({ error: 'Failed to add team member' });
    }
  };

  removeTeamMember = async (req: AuthRequest, res: Response) => {
    try {
      const { id, userId } = req.params;
      await this.teamService.removeTeamMember(id, userId);
      return res.status(200).json({ message: 'Member removed successfully' });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'User is not a member of this team') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Remove team member error:', error);
      return res.status(500).json({ error: 'Failed to remove team member' });
    }
  };

  getTeamMembers = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const members = await this.teamService.getTeamMembers(id);
      return res.status(200).json({ members });
    } catch (error: any) {
      if (error.message === 'Team not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Get team members error:', error);
      return res.status(500).json({ error: 'Failed to fetch team members' });
    }
  };
}
