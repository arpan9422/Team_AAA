import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import teamRoutes from './modules/team/team.routes';
import equipmentRoutes from './modules/equipment/equipment.routes';
import requestRoutes from './modules/maintenance-request/maintenance-request.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import technicianRoutes from './modules/technician/technician.routes';
import employeeRoutes from './modules/employee/employee.routes';
import kanbanRoutes from './modules/kanban/kanban.routes';
import { errorHandler } from './shared/middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GearGuard API is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GearGuard API Documentation',
}));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/kanban', kanbanRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`API Documentation available at http://localhost:${config.port}/api-docs`);
});

export default app;
