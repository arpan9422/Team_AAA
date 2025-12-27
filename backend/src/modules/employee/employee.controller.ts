import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { EmployeeService } from './employee.service';

const employeeService = new EmployeeService();

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const requestData = req.body;

    // Basic validation
    if (!requestData.title || !requestData.requestType) {
      return res.status(400).json({ error: 'Title and Request Type are required' });
    }

    const newRequest = await employeeService.createMaintenanceRequest(userId, requestData);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const requests = await employeeService.getMyRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
};

export const getMyEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const equipment = await employeeService.getMyEquipment(userId);
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching employee equipment:', error);
    res.status(500).json({ error: 'Failed to fetch employee equipment' });
  }
};
