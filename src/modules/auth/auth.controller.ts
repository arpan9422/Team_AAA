import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.validation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: AuthRequest, res: Response) => {
    try {
      const data: RegisterInput = req.body;
      const user = await this.authService.register(data);
      return res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  };

  login = async (req: AuthRequest, res: Response) => {
    try {
      const data: LoginInput = req.body;
      const result = await this.authService.login(data);
      return res.status(200).json({ message: 'Login successful', ...result });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === 'Account is inactive') {
        return res.status(403).json({ error: error.message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Failed to login' });
    }
  };

  refreshToken = async (req: AuthRequest, res: Response) => {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);
      return res.status(200).json({ message: 'Token refreshed successfully', ...result });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  };

  logout = async (req: AuthRequest, res: Response) => {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      await this.authService.logout(refreshToken);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to logout' });
    }
  };

  getMe = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.authService.getCurrentUser(req.user.userId);
      return res.status(200).json({ user });
    } catch (error: any) {
      console.error('Get me error:', error);
      return res.status(404).json({ error: 'User not found' });
    }
  };
}
