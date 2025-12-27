import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get complete dashboard summary with all statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team (optional)
 *     responses:
 *       200:
 *         description: Dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 equipment:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     scrapped:
 *                       type: integer
 *                 requests:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: integer
 *                     completedThisMonth:
 *                       type: integer
 *                     overdue:
 *                       type: integer
 *                     new:
 *                       type: integer
 *                     byPriority:
 *                       type: object
 *                       properties:
 *                         LOW:
 *                           type: integer
 *                         MEDIUM:
 *                           type: integer
 *                         HIGH:
 *                           type: integer
 *                         CRITICAL:
 *                           type: integer
 *                 technicians:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: integer
 *                 month:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', authenticate, dashboardController.getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/equipment/total:
 *   get:
 *     summary: Get total equipment count
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SCRAPPED]
 *         description: Filter by equipment status
 *     responses:
 *       200:
 *         description: Total equipment count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/equipment/total', authenticate, dashboardController.getTotalEquipment);

/**
 * @swagger
 * /api/dashboard/requests/active:
 *   get:
 *     summary: Get active maintenance requests (NEW + IN_PROGRESS)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team
 *     responses:
 *       200:
 *         description: Active requests with details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/requests/active', authenticate, dashboardController.getActiveRequests);

/**
 * @swagger
 * /api/dashboard/requests/completed-this-month:
 *   get:
 *     summary: Get requests completed in current month
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team
 *     responses:
 *       200:
 *         description: Completed requests this month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 month:
 *                   type: string
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/requests/completed-this-month', authenticate, dashboardController.getCompletedThisMonth);

/**
 * @swagger
 * /api/dashboard/requests/overdue:
 *   get:
 *     summary: Get overdue maintenance requests
 *     description: Returns requests that have passed their scheduled date but are not yet completed
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team
 *     responses:
 *       200:
 *         description: Overdue requests with details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/requests/overdue', authenticate, dashboardController.getOverdueRequests);

export default router;
