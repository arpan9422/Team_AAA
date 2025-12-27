import { Router } from 'express';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { createRequest, getMyRequests } from './employee.controller';

const router = Router();

// Apply authentication and authorization middleware to all routes
router.use(authenticate, authorize('EMPLOYEE'));

/**
 * @swagger
 * /api/employee:
 *   post:
 *     summary: Create a new maintenance request
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - requestType
 *             properties:
 *               title:
 *                 type: string
 *                 example: Broken AC in Server Room
 *               description:
 *                 type: string
 *                 example: The AC unit is making a loud noise and not cooling.
 *               requestType:
 *                 type: string
 *                 enum: [CORRECTIVE, PREVENTIVE]
 *                 example: CORRECTIVE
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 example: HIGH
 *               equipmentId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               teamId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/', createRequest);

/**
 * @swagger
 * /api/employee:
 *   get:
 *     summary: Get maintenance requests created by the current user
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getMyRequests);

export default router;
