import { Router } from 'express';
import { EquipmentController } from './equipment.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const equipmentController = new EquipmentController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         serialNumber:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer:
 *           type: string
 *         model:
 *           type: string
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         department:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, SCRAPPED]
 *         primaryTeamId:
 *           type: string
 *           format: uuid
 *         primaryTeam:
 *           $ref: '#/components/schemas/MaintenanceTeam'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateEquipmentRequest:
 *       type: object
 *       required:
 *         - name
 *         - serialNumber
 *         - type
 *         - primaryTeamId
 *       properties:
 *         name:
 *           type: string
 *         serialNumber:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer:
 *           type: string
 *         model:
 *           type: string
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         department:
 *           type: string
 *         primaryTeamId:
 *           type: string
 *           format: uuid
 *     UpdateEquipmentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer:
 *           type: string
 *         model:
 *           type: string
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         department:
 *           type: string
 *     ChangeTeamRequest:
 *       type: object
 *       required:
 *         - primaryTeamId
 *       properties:
 *         primaryTeamId:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *     ChangeStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [ACTIVE, SCRAPPED]
 *         reason:
 *           type: string
 *     EquipmentHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         equipmentId:
 *           type: string
 *           format: uuid
 *         eventType:
 *           type: string
 *           enum: [CREATED, TEAM_CHANGED, REPAIRED, SCRAPPED, MAINTENANCE_SCHEDULED, MAINTENANCE_COMPLETED]
 *         eventDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *     EquipmentHealth:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         equipmentId:
 *           type: string
 *           format: uuid
 *         lastMaintenanceDate:
 *           type: string
 *           format: date-time
 *         nextMaintenanceDate:
 *           type: string
 *           format: date-time
 *         healthScore:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         notes:
 *           type: string
 *     WarrantyStatus:
 *       type: object
 *       properties:
 *         isUnderWarranty:
 *           type: boolean
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *         daysRemaining:
 *           type: integer
 */

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment with filters
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SCRAPPED]
 *         description: Filter by equipment status
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by primary team ID
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: List of equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, equipmentController.getAllEquipment);

/**
 * @swagger
 * /api/equipment/locations:
 *   get:
 *     summary: Get all unique equipment locations
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/locations', authenticate, equipmentController.getLocations);

/**
 * @swagger
 * /api/equipment/departments:
 *   get:
 *     summary: Get all unique equipment departments
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/departments', authenticate, equipmentController.getDepartments);

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     summary: Get equipment by ID
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment details with warranty status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Equipment'
 *                 - type: object
 *                   properties:
 *                     isUnderWarranty:
 *                       type: boolean
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, equipmentController.getEquipmentById);

/**
 * @swagger
 * /api/equipment:
 *   post:
 *     summary: Create new equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEquipmentRequest'
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Validation error or team not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, equipmentController.createEquipment);

/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     summary: Update equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEquipmentRequest'
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Validation error or cannot update scrapped equipment
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, equipmentController.updateEquipment);

/**
 * @swagger
 * /api/equipment/{id}/team:
 *   patch:
 *     summary: Change equipment's primary team
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeTeamRequest'
 *     responses:
 *       200:
 *         description: Team changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or team not active
 *       404:
 *         description: Equipment or team not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/team', authenticate, equipmentController.changePrimaryTeam);

/**
 * @swagger
 * /api/equipment/{id}/status:
 *   patch:
 *     summary: Change equipment status (ACTIVE/SCRAPPED)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeStatusRequest'
 *     responses:
 *       200:
 *         description: Status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', authenticate, equipmentController.changeStatus);

/**
 * @swagger
 * /api/equipment/{id}/history:
 *   get:
 *     summary: Get equipment history
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EquipmentHistory'
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/history', authenticate, equipmentController.getEquipmentHistory);

/**
 * @swagger
 * /api/equipment/{id}/health:
 *   get:
 *     summary: Get equipment health status
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentHealth'
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/health', authenticate, equipmentController.getEquipmentHealth);

/**
 * @swagger
 * /api/equipment/{id}/warranty:
 *   get:
 *     summary: Check equipment warranty status
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Warranty status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarrantyStatus'
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/warranty', authenticate, equipmentController.checkWarrantyStatus);

/**
 * @swagger
 * /api/equipment/{id}/assign:
 *   post:
 *     summary: Assign equipment to a user/employee
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to assign equipment to
 *               notes:
 *                 type: string
 *                 description: Optional notes about the assignment
 *     responses:
 *       201:
 *         description: Equipment assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 equipmentId:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 assignedAt:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 notes:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 equipment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     serialNumber:
 *                       type: string
 *       400:
 *         description: Validation error or equipment cannot be assigned
 *       404:
 *         description: Equipment or user not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/assign', authenticate, equipmentController.assignEquipment);

/**
 * @swagger
 * /api/equipment/{id}/return:
 *   post:
 *     summary: Return equipment from user
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes about the return
 *     responses:
 *       200:
 *         description: Equipment returned successfully
 *       404:
 *         description: Equipment not found or no active assignment
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/return', authenticate, equipmentController.returnEquipment);

/**
 * @swagger
 * /api/equipment/{id}/assignments:
 *   get:
 *     summary: Get all assignments for an equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: List of equipment assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   equipmentId:
 *                     type: string
 *                     format: uuid
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                   assignedAt:
 *                     type: string
 *                     format: date-time
 *                   returnedAt:
 *                     type: string
 *                     format: date-time
 *                   isActive:
 *                     type: boolean
 *                   notes:
 *                     type: string
 *                   user:
 *                     type: object
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/assignments', authenticate, equipmentController.getEquipmentAssignments);

/**
 * @swagger
 * /api/equipment/{id}/active-assignment:
 *   get:
 *     summary: Get active assignment for an equipment
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Active assignment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 equipmentId:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 assignedAt:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 notes:
 *                   type: string
 *                 user:
 *                   type: object
 *       404:
 *         description: Equipment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/active-assignment', authenticate, equipmentController.getActiveAssignment);

/**
 * @swagger
 * /api/equipment/user/{userId}/assignments:
 *   get:
 *     summary: Get all equipment assignments for a user
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter to show only active assignments
 *     responses:
 *       200:
 *         description: List of user equipment assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   equipmentId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   assignedAt:
 *                     type: string
 *                     format: date-time
 *                   returnedAt:
 *                     type: string
 *                     format: date-time
 *                   isActive:
 *                     type: boolean
 *                   equipment:
 *                     type: object
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:userId/assignments', authenticate, equipmentController.getUserAssignments);

export default router;
