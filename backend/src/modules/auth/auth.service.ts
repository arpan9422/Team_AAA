import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import emailService from '../../shared/services/email.service';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtExpiry } as any);
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry } as any);
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, config.jwtSecret);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, config.jwtRefreshSecret);
  }

  async register(data: RegisterInput) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.authRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  async login(data: LoginInput) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.verifyRefreshToken(refreshToken);
    const userId = decoded.userId;

    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found or inactive');
    }

    const newAccessToken = this.generateAccessToken(user.id, user.role);

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken: string) {
    const result = await this.authRepository.deleteRefreshToken(refreshToken);
    if (!result) {
      throw new Error('Refresh token not found or already invalidated');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, an OTP has been sent' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    await this.authRepository.createPasswordResetOTP(email, otp, expiresAt);

    // Send email with OTP
    await emailService.sendPasswordResetOTP(email, otp, user.name);

    return { message: 'If the email exists, an OTP has been sent' };
  }

  async verifyOTP(email: string, otp: string) {
    const otpRecord = await this.authRepository.findValidOTP(email, otp);
    
    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await this.authRepository.markOTPAsVerified(otpRecord.id);

    return { message: 'OTP verified successfully. You can now reset your password.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Find the OTP record
    const otpRecord = await this.authRepository.findVerifiedOTP(email, otp);
    
    if (!otpRecord) {
      throw new Error('Invalid or expired OTP. Please verify OTP first.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.authRepository.updatePassword(email, hashedPassword);

    // Delete the used OTP
    await this.authRepository.deleteOTP(otpRecord.id);

    // Send confirmation email
    const user = await this.authRepository.findUserByEmail(email);
    if (user) {
      await emailService.sendPasswordResetConfirmation(email, user.name);
    }

    return { message: 'Password reset successfully' };
  }
}
