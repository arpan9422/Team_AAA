import { Router } from 'express';
import { TeamController } from './team.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { createTeamSchema, updateTeamSchema, addTeamMemberSchema } from './team.validation';

const router = Router();
const teamController = new TeamController();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all maintenance teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive teams
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, teamController.getAllTeams);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team details retrieved successfully
 *       404:
 *         description: Team not found
 */
router.get('/:id', authenticate, teamController.getTeamById);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new maintenance team
 *     tags: [Teams]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mechanics Team
 *               description:
 *                 type: string
 *                 example: Handles mechanical equipment maintenance
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Manager only
 */
router.post('/', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    createTeamSchema.parse(req.body);
    await teamController.createTeam(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update team details
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       404:
 *         description: Team not found
 */
router.put('/:id', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    updateTeamSchema.parse(req.body);
    await teamController.updateTeam(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Deactivate a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deactivated successfully
 *       400:
 *         description: Cannot delete team with assigned equipment
 *       404:
 *         description: Team not found
 */
router.delete('/:id', authenticate, authorize('MANAGER'), teamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add a member to team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
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
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User already a member
 *       404:
 *         description: Team not found
 */
router.post('/:id/members', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    addTeamMemberSchema.parse(req.body);
    await teamController.addTeamMember(req, res);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Validation failed' });
  }
});

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Team or member not found
 */
router.delete('/:id/members/:userId', authenticate, authorize('MANAGER'), teamController.removeTeamMember);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   get:
 *     summary: Get all team members
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 *       404:
 *         description: Team not found
 */
router.get('/:id/members', authenticate, teamController.getTeamMembers);

export default router;
