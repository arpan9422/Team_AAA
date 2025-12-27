import { Router } from 'express';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { KanbanController } from './kanban.controller';

const router = Router();
const kanbanController = new KanbanController();

// Apply authentication and authorization middleware to all routes
// Only managers can access the kanban board
router.use(authenticate, authorize('MANAGER'));

/**
 * @swagger
 * /api/kanban:
 *   get:
 *     summary: Get all maintenance requests for Kanban board
 *     tags: [Kanban]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all maintenance requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager only
 */
router.get('/', kanbanController.getBoard);

/**
 * @swagger
 * /api/kanban/{id}/status:
 *   patch:
 *     summary: Update maintenance request status
 *     tags: [Kanban]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, SCHEDULED, IN_PROGRESS, REPAIRED, SCRAP]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *       400:
 *         description: Invalid status or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager only
 *       404:
 *         description: Request not found
 */
router.patch('/:id/status', kanbanController.updateStatus);

export default router;
