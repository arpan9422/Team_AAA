import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './shared/middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GearGuard API is running' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
