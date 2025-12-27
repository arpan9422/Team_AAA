import { Request, Response } from 'express';
import { RequestStatus } from '@prisma/client';
import { KanbanService } from './kanban.service';

const kanbanService = new KanbanService();

export class KanbanController {
  async getBoard(req: Request, res: Response) {
    try {
      const requests = await kanbanService.getAllRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching kanban board:', error);
      res.status(500).json({ error: 'Failed to fetch kanban board' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Request ID is required' });
      }

      if (!status || !Object.values(RequestStatus).includes(status)) {
        return res.status(400).json({ 
          error: 'Valid status is required',
          validStatuses: Object.values(RequestStatus)
        });
      }

      const updatedRequest = await kanbanService.updateRequestStatus(id, status);
      res.json(updatedRequest);
    } catch (error: any) {
      console.error('Error updating request status:', error);
      if (error.message === 'Maintenance request not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update request status' });
    }
  }
}
