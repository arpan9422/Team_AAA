import prisma from '../../config/database';
import { UserRole } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: { name: string; email: string; password: string; role: UserRole }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    try {
      return await prisma.refreshToken.delete({ where: { token } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async createPasswordResetOTP(email: string, otp: string, expiresAt: Date) {
    // Delete any existing OTPs for this email
    await prisma.passwordResetOTP.deleteMany({
      where: { email },
    });

    return prisma.passwordResetOTP.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });
  }

  async findValidOTP(email: string, otp: string) {
    return prisma.passwordResetOTP.findFirst({
      where: {
        email,
        otp,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  }

  async findVerifiedOTP(email: string, otp: string) {
    return prisma.passwordResetOTP.findFirst({
      where: {
        email,
        otp,
        verified: true,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  }

  async markOTPAsVerified(id: string) {
    return prisma.passwordResetOTP.update({
      where: { id },
      data: { verified: true },
    });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async deleteOTP(id: string) {
    return prisma.passwordResetOTP.delete({
      where: { id },
    });
  }

  async cleanupExpiredOTPs() {
    return prisma.passwordResetOTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
