import { Router } from 'express';
import { TechnicianController } from './technician.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const technicianController = new TechnicianController();

/**
 * @swagger
 * /api/technician/dashboard:
 *   get:
 *     summary: Get technician dashboard with stats and recent work
 *     tags: [Technician]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technician dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 technician:
 *                   type: object
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeJobs:
 *                       type: integer
 *                     pendingJobs:
 *                       type: integer
 *                     completedThisMonth:
 *                       type: integer
 *                     overdueJobs:
 *                       type: integer
 *                 recentCompletedJobs:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authenticate, technicianController.getDashboard);

/**
 * @swagger
 * /api/technician/equipment/{equipmentId}/history:
 *   get:
 *     summary: Get equipment maintenance history and metrics
 *     tags: [Technician]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Equipment history and metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipment:
 *                   type: object
 *                 metrics:
 *                   type: object
 *                 maintenanceHistory:
 *                   type: array
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/equipment/:equipmentId/history', authenticate, technicianController.getEquipmentHistory);

export default router;
