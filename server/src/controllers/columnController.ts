import { Response } from 'express';
import Column from '../models/Column';
import Task from '../models/Task';
import { AuthRequest } from '../types';

export const getColumns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const columns = await Column.find({ userId: req.user?.id }).sort({ position: 1 });
    
    res.status(200).json({
      success: true,
      data: columns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching columns',
      error: error.message
    });
  }
};

export const createColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, color, position } = req.body;

    const column = await Column.create({
      name,
      color: color || '#3b82f6',
      position: position || 0,
      userId: req.user?.id
    });

    res.status(201).json({
      success: true,
      data: column
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating column',
      error: error.message
    });
  }
};

export const updateColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, color, position } = req.body;

    const column = await Column.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { name, color, position },
      { new: true, runValidators: true }
    );

    if (!column) {
      res.status(404).json({
        success: false,
        message: 'Column not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: column
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating column',
      error: error.message
    });
  }
};

export const deleteColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if column has tasks
    const taskCount = await Task.countDocuments({ columnId: id, userId: req.user?.id });
    
    if (taskCount > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete column with existing tasks. Please move or delete tasks first.'
      });
      return;
    }

    const column = await Column.findOneAndDelete({ _id: id, userId: req.user?.id });

    if (!column) {
      res.status(404).json({
        success: false,
        message: 'Column not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Column deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting column',
      error: error.message
    });
  }
};

export const reorderColumns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { columnOrders } = req.body; // Array of { id, position }

    const updatePromises = columnOrders.map((item: { id: string; position: number }) =>
      Column.findOneAndUpdate(
        { _id: item.id, userId: req.user?.id },
        { position: item.position },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    const columns = await Column.find({ userId: req.user?.id }).sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: columns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error reordering columns',
      error: error.message
    });
  }
};
