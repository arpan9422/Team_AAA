import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';

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
}
