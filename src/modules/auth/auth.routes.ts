import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/register', async (req, res) => {
  try {
    registerSchema.parse(req.body);
    await authController.register(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    loginSchema.parse(req.body);
    await authController.login(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    refreshTokenSchema.parse(req.body);
    await authController.refreshToken(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    refreshTokenSchema.parse(req.body);
    await authController.logout(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

router.get('/me', authenticate, authController.getMe);

export default router;
