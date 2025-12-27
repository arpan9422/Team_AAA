import { Router } from 'express';
import { workCenterController } from './work-center.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Work Center
 *   description: Work center management endpoints (Manager only)
 */

/**
 * @swagger
 * /api/work-center:
 *   post:
 *     summary: Create a new work center (Manager only)
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Assembly Line 1"
 *               code:
 *                 type: string
 *                 example: "WC-01"
 *               type:
 *                 type: string
 *                 example: "Manufacturing"
 *               tag:
 *                 type: string
 *                 example: "Critical"
 *               location:
 *                 type: string
 *                 example: "Building A, Floor 2"
 *               costPerHour:
 *                 type: number
 *                 example: 50.00
 *               capacity:
 *                 type: integer
 *                 example: 1
 *               timeEfficiency:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 100
 *               oeeTarget:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85
 *               assignedWorkerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Work center created successfully
 *       400:
 *         description: Validation error or code already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Manager only
 */
router.post(
  '/',
  authenticate,
  (req, res, next) => {
    if ((req as any).user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Manager only.' });
    }
    next();
  },
  workCenterController.createWorkCenter
);

/**
 * @swagger
 * /api/work-center:
 *   get:
 *     summary: Get all work centers
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive work centers
 *     responses:
 *       200:
 *         description: List of work centers
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, workCenterController.getAllWorkCenters);

/**
 * @swagger
 * /api/work-center/{id}:
 *   get:
 *     summary: Get work center by ID
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Work center details
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  authenticate,
  workCenterController.getWorkCenterById
);

/**
 * @swagger
 * /api/work-center/{id}:
 *   patch:
 *     summary: Update work center (Manager only)
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *               tag:
 *                 type: string
 *               location:
 *                 type: string
 *               costPerHour:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               timeEfficiency:
 *                 type: integer
 *               oeeTarget:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Work center updated successfully
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Manager only
 */
router.patch(
  '/:id',
  authenticate,
  (req, res, next) => {
    if ((req as any).user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Manager only.' });
    }
    next();
  },
  workCenterController.updateWorkCenter
);

/**
 * @swagger
 * /api/work-center/{id}:
 *   delete:
 *     summary: Delete (deactivate) work center (Manager only)
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Work center deleted successfully
 *       400:
 *         description: Cannot delete work center with active requests
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Manager only
 */
router.delete(
  '/:id',
  authenticate,
  (req, res, next) => {
    if ((req as any).user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Manager only.' });
    }
    next();
  },
  workCenterController.deleteWorkCenter
);

/**
 * @swagger
 * /api/work-center/{id}/assign-workers:
 *   post:
 *     summary: Assign workers to work center (Manager only)
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerIds
 *             properties:
 *               workerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["d90be771-9a82-454f-a7a9-e49db066c3c9"]
 *     responses:
 *       200:
 *         description: Workers assigned successfully
 *       400:
 *         description: All workers must be technicians
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Manager only
 */
router.post(
  '/:id/assign-workers',
  authenticate,
  (req, res, next) => {
    if ((req as any).user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Manager only.' });
    }
    next();
  },
  workCenterController.assignWorkers
);

/**
 * @swagger
 * /api/work-center/{id}/assign-task:
 *   post:
 *     summary: Assign task directly to technician from work center (Manager only)
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - technicianId
 *               - requestType
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Repair hydraulic press"
 *               description:
 *                 type: string
 *                 example: "Hydraulic system leaking oil"
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *                 example: "d90be771-9a82-454f-a7a9-e49db066c3c9"
 *               equipmentId:
 *                 type: string
 *                 format: uuid
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: MEDIUM
 *               requestType:
 *                 type: string
 *                 enum: [CORRECTIVE, PREVENTIVE]
 *                 default: CORRECTIVE
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task assigned successfully, technician can start immediately
 *       400:
 *         description: Validation error or technician not assigned to work center
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Manager only
 */
router.post(
  '/:id/assign-task',
  authenticate,
  (req, res, next) => {
    if ((req as any).user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Manager only.' });
    }
    next();
  },
  workCenterController.assignTask
);

/**
 * @swagger
 * /api/work-center/{id}/statistics:
 *   get:
 *     summary: Get work center statistics
 *     tags: [Work Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Work center statistics
 *       404:
 *         description: Work center not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id/statistics',
  authenticate,
  workCenterController.getStatistics
);

export default router;
