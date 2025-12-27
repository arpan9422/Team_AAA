import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '1h',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
