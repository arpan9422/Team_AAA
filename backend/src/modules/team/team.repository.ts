import prisma from '../../config/database';
import { CreateTeamInput, UpdateTeamInput } from './team.validation';

export class TeamRepository {
  async findAll(includeInactive: boolean = false) {
    return prisma.maintenanceTeam.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            teamMembers: true,
            equipment: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.maintenanceTeam.findUnique({
      where: { id },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            equipment: true,
            maintenanceRequests: true,
          },
        },
      },
    });
  }

  async create(data: CreateTeamInput) {
    return prisma.maintenanceTeam.create({
      data,
      include: {
        _count: {
          select: {
            teamMembers: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTeamInput) {
    return prisma.maintenanceTeam.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.maintenanceTeam.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async countEquipmentByTeam(teamId: string) {
    return prisma.equipment.count({
      where: { primaryTeamId: teamId },
    });
  }

  async addMember(teamId: string, userId: string) {
    return prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
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
    });
  }

  async removeMember(teamId: string, userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!member) {
      return null;
    }

    return prisma.teamMember.delete({
      where: { id: member.id },
    });
  }

  async isMemberOfTeam(teamId: string, userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });
    return !!member;
  }

  async getTeamMembers(teamId: string) {
    return prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }
}
