import { Router } from 'express';
import { MaintenanceRequestController } from './maintenance-request.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const requestController = new MaintenanceRequestController();

/**
 * @swagger
 * components:
 *   schemas:
 *     MaintenanceRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requestType:
 *           type: string
 *           enum: [CORRECTIVE, PREVENTIVE]
 *         equipmentId:
 *           type: string
 *           format: uuid
 *         teamId:
 *           type: string
 *           format: uuid
 *         technicalId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [NEW, IN_PROGRESS, REPAIRED, SCRAP]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all maintenance requests with filters
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, IN_PROGRESS, REPAIRED, SCRAP]
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: equipmentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: List of maintenance requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MaintenanceRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, requestController.getAllRequests);

/**
 * @swagger
 * /api/requests/statistics:
 *   get:
 *     summary: Get request statistics by status
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter statistics by team
 *     responses:
 *       200:
 *         description: Request statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 NEW:
 *                   type: integer
 *                 IN_PROGRESS:
 *                   type: integer
 *                 REPAIRED:
 *                   type: integer
 *                 SCRAP:
 *                   type: integer
 *                 TOTAL:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/statistics', authenticate, requestController.getStatistics);

// TECHNICIAN-SPECIFIC ROUTES (must be before /:id)

/**
 * @swagger
 * /api/requests/my-requests:
 *   get:
 *     summary: Get all requests for my team (Technician only)
 *     tags: [Technician]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, IN_PROGRESS, REPAIRED, SCRAP, ESCALATED]
 *     responses:
 *       200:
 *         description: List of requests for technician's team
 *       401:
 *         description: Unauthorized
 */
router.get('/my-requests', authenticate, requestController.getMyRequests);

/**
 * @swagger
 * /api/requests/my-history:
 *   get:
 *     summary: Get my work history (Technician only)
 *     tags: [Technician]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed requests
 *       401:
 *         description: Unauthorized
 */
router.get('/my-history', authenticate, requestController.getMyWorkHistory);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get maintenance request by ID
 *     tags: [Maintenance Requests]
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
 *         description: Request details with full relations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, requestController.getRequestById);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new maintenance request
 *     tags: [Maintenance Requests]
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
 *               - equipmentId
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 150
 *               description:
 *                 type: string
 *               requestType:
 *                 type: string
 *                 enum: [CORRECTIVE, PREVENTIVE]
 *               equipmentId:
 *                 type: string
 *                 format: uuid
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: MEDIUM
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       400:
 *         description: Validation error or equipment is scrapped
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, requestController.createRequest);

/**
 * @swagger
 * /api/requests/{id}/reassign:
 *   post:
 *     summary: Manager reassigns request to another technician
 *     tags: [Maintenance Requests]
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
 *               - technicianId
 *               - reason
 *             properties:
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the technician to reassign to
 *               reason:
 *                 type: string
 *                 description: Reason for reassignment
 *     responses:
 *       200:
 *         description: Request reassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid technician
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/reassign', authenticate, requestController.reassignRequest);

/**
 * @swagger
 * /api/requests/{id}/accept:
 *   post:
 *     summary: Technician accepts a maintenance request
 *     description: Technician accepts an available NEW request and it gets assigned to them
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes about accepting the request
 *     responses:
 *       200:
 *         description: Request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Request is not NEW or already assigned
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/accept', authenticate, requestController.acceptRequest);

/**
 * @swagger
 * /api/requests/{id}/reject:
 *   post:
 *     summary: Manager rejects technician's assignment and optionally reassigns
 *     description: Reject a technician's acceptance of a request and either reassign to another technician or make it available again
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejecting the assignment
 *               reassignTo:
 *                 type: string
 *                 format: uuid
 *                 description: Optional - ID of technician to reassign to. If not provided, request becomes available again
 *     responses:
 *       200:
 *         description: Assignment rejected and optionally reassigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request:
 *                   $ref: '#/components/schemas/MaintenanceRequest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or no technician assigned
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/reject', authenticate, requestController.rejectAndReassign);

/**
 * @swagger
 * /api/requests/{id}/priority:
 *   patch:
 *     summary: Update request priority
 *     tags: [Maintenance Requests]
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
 *               - priority
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Priority updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/priority', authenticate, requestController.updatePriority);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update request status
 *     tags: [Maintenance Requests]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, IN_PROGRESS, REPAIRED, SCRAP]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', authenticate, requestController.updateStatus);

/**
 * @swagger
 * /api/requests/{id}/history:
 *   get:
 *     summary: Get assignment history for a request
 *     tags: [Maintenance Requests]
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
 *         description: Assignment history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   requestId:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                   assignedBy:
 *                     type: string
 *                   assignedAt:
 *                     type: string
 *                     format: date-time
 *                   assignedUser:
 *                     type: object
 *                   assignerUser:
 *                     type: object
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/history', authenticate, requestController.getAssignmentHistory);

/**
 * @swagger
 * /api/requests/team/{teamId}:
 *   get:
 *     summary: Get all requests for a specific team
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, IN_PROGRESS, REPAIRED, SCRAP]
 *     responses:
 *       200:
 *         description: Team requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MaintenanceRequest'
 *       404:
 *         description: Team not found
 *       401:
 *         description: Unauthorized
 */
router.get('/team/:teamId', authenticate, requestController.getTeamRequests);

/**
 * @swagger
 * /api/requests/team/{teamId}/technicians:
 *   get:
 *     summary: Get all available technicians in a team
 *     tags: [Maintenance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of team technicians with their current load
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   technicianProfile:
 *                     type: object
 *                     properties:
 *                       currentLoad:
 *                         type: integer
 *                       skillTags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       experienceYears:
 *                         type: integer
 *       404:
 *         description: Team not found
 *       401:
 *         description: Unauthorized
 */
router.get('/team/:teamId/technicians', authenticate, requestController.getTeamTechnicians);

// Additional technician routes with dynamic parameters

/**
 * @swagger
 * /api/requests/{id}/start:
 *   patch:
 *     summary: Start working on a request (Technician only)
 *     tags: [Technician]
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
 *         description: Request started successfully
 *       400:
 *         description: Request cannot be started
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/start', authenticate, requestController.startRequest);

/**
 * @swagger
 * /api/requests/{id}/update-progress:
 *   patch:
 *     summary: Update work progress on a request (Technician only)
 *     tags: [Technician]
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
 *               workNotes:
 *                 type: string
 *               pauseWork:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/update-progress', authenticate, requestController.updateProgress);

/**
 * @swagger
 * /api/requests/{id}/complete:
 *   patch:
 *     summary: Complete a maintenance request (Technician only)
 *     tags: [Technician]
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
 *               - hoursSpent
 *               - rootCause
 *             properties:
 *               hoursSpent:
 *                 type: number
 *                 example: 2.5
 *               rootCause:
 *                 type: string
 *                 enum: [WEAR_AND_TEAR, ELECTRICAL_FAULT, MECHANICAL_FAILURE, OPERATOR_ERROR, EXTERNAL_DAMAGE, SOFTWARE_ISSUE, OTHER]
 *               isTemporaryFix:
 *                 type: boolean
 *                 default: false
 *               workNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request completed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/complete', authenticate, requestController.completeRequest);

/**
 * @swagger
 * /api/requests/{id}/mark-unrepairable:
 *   patch:
 *     summary: Mark equipment as unrepairable (Technician only)
 *     tags: [Technician]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipment marked as unrepairable
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/mark-unrepairable', authenticate, requestController.markUnrepairable);

/**
 * @swagger
 * /api/requests/{id}/escalate:
 *   patch:
 *     summary: Escalate request to manager (Technician only)
 *     tags: [Technician]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request escalated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/escalate', authenticate, requestController.escalateRequest);

export default router;
