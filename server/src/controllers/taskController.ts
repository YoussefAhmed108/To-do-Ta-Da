import { Response } from 'express';
import Task from '../models/Task';
import Column from '../models/Column';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { columnId, parentTaskId, startDate, endDate } = req.query;
    
    const query: any = { userId: req.user?.id };
    
    if (columnId) {
      query.columnId = columnId;
    }
    
    if (parentTaskId !== undefined) {
      query.parentTaskId = parentTaskId === 'null' ? null : parentTaskId;
    }
    
    if (startDate || endDate) {
      query.$or = [
        { frequency: 'once', startDate: { $gte: startDate, $lte: endDate } },
        { frequency: { $ne: 'once' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('columnId')
      .populate('parentTaskId')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({ _id: id, userId: req.user?.id })
      .populate('columnId')
      .populate('parentTaskId');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user?.id
    };

    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('columnId')
      .populate('parentTaskId');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

export const createBulkSubtasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parentTaskId, prefix, start, end, columnId } = req.body;

    if (!prefix || start === undefined || end === undefined) {
      res.status(400).json({
        success: false,
        message: 'Prefix, start, and end are required'
      });
      return;
    }

    const parentTask = parentTaskId 
      ? await Task.findOne({ _id: parentTaskId, userId: req.user?.id })
      : null;

    const subtasks = [];
    for (let i = start; i <= end; i++) {
      subtasks.push({
        name: `${prefix} ${i}`,
        description: `${prefix} ${i}`,
        columnId: columnId,
        userId: req.user?.id,
        parentTaskId: parentTaskId || undefined,
        position: i - start
      });
    }

    const createdTasks = await Task.insertMany(subtasks);

    res.status(201).json({
      success: true,
      data: createdTasks,
      count: createdTasks.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating bulk subtasks',
      error: error.message
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('columnId').populate('parentTaskId');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Also delete all subtasks
    await Task.deleteMany({ parentTaskId: id, userId: req.user?.id });
    
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user?.id });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task and subtasks deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

export const markTaskComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, timeTaken } = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user?.id });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // For recurring tasks, add to completions array
    if (task.frequency !== 'once') {
      const completionDate = date ? new Date(date) : new Date();
      
      // Check if already marked complete for this date
      const existingCompletion = task.completions.find(
        c => c.date.toDateString() === completionDate.toDateString()
      );

      if (existingCompletion) {
        existingCompletion.completed = true;
        if (timeTaken) existingCompletion.timeTaken = timeTaken;
      } else {
        task.completions.push({
          date: completionDate,
          completed: true,
          timeTaken: timeTaken
        });
      }
    } else {
      // For one-time tasks
      task.isCompleted = true;
      task.completedAt = new Date();
      if (timeTaken) task.timeTaken = timeTaken;
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error marking task complete',
      error: error.message
    });
  }
};

export const startTimer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user?.id });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Check if there's already an active timer
    const activeTimer = task.timeEntries.find(entry => !entry.endTime);
    if (activeTimer) {
      res.status(400).json({
        success: false,
        message: 'Timer already running for this task'
      });
      return;
    }

    task.timeEntries.push({
      startTime: new Date()
    });

    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error starting timer',
      error: error.message
    });
  }
};

export const stopTimer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user?.id });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Find active timer
    const activeTimer = task.timeEntries.find(entry => !entry.endTime);
    if (!activeTimer) {
      res.status(400).json({
        success: false,
        message: 'No active timer for this task'
      });
      return;
    }

    activeTimer.endTime = new Date();
    activeTimer.duration = Math.floor(
      (activeTimer.endTime.getTime() - activeTimer.startTime.getTime()) / 60000
    );

    // Update total time taken
    const totalTime = task.timeEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );
    task.timeTaken = totalTime;

    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error stopping timer',
      error: error.message
    });
  }
};

export const getSubtasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subtasks = await Task.find({
      parentTaskId: id,
      userId: req.user?.id
    }).populate('columnId').sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: subtasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subtasks',
      error: error.message
    });
  }
};

export const moveTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { columnId, position } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { columnId, position },
      { new: true }
    ).populate('columnId').populate('parentTaskId');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error moving task',
      error: error.message
    });
  }
};
