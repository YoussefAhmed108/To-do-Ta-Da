import { Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../types';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get all completed tasks
    const tasks = await Task.find({ userId }).populate('columnId');

    // Analytics by category
    const categoryStats: any = {};
    const columnStats: any = {};

    tasks.forEach(task => {
      // Category stats
      if (task.category) {
        if (!categoryStats[task.category]) {
          categoryStats[task.category] = {
            count: 0,
            totalTime: 0,
            completedCount: 0
          };
        }
        categoryStats[task.category].count++;
        categoryStats[task.category].totalTime += task.timeTaken || 0;
        
        if (task.frequency === 'once' && task.isCompleted) {
          categoryStats[task.category].completedCount++;
        } else if (task.frequency !== 'once') {
          categoryStats[task.category].completedCount += task.completions.filter(c => c.completed).length;
        }
      }

      // Column stats
      const columnId = (task.columnId as any)?._id?.toString();
      const columnName = (task.columnId as any)?.name;
      
      if (columnId && columnName) {
        if (!columnStats[columnId]) {
          columnStats[columnId] = {
            name: columnName,
            color: (task.columnId as any).color,
            count: 0,
            totalTime: 0,
            completedCount: 0
          };
        }
        columnStats[columnId].count++;
        columnStats[columnId].totalTime += task.timeTaken || 0;
        
        if (task.frequency === 'once' && task.isCompleted) {
          columnStats[columnId].completedCount++;
        } else if (task.frequency !== 'once') {
          columnStats[columnId].completedCount += task.completions.filter(c => c.completed).length;
        }
      }
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageTime = stats.completedCount > 0 
        ? Math.round(stats.totalTime / stats.completedCount) 
        : 0;
    });

    Object.keys(columnStats).forEach(columnId => {
      const stats = columnStats[columnId];
      stats.averageTime = stats.completedCount > 0 
        ? Math.round(stats.totalTime / stats.completedCount) 
        : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        byCategory: categoryStats,
        byColumn: columnStats,
        overview: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => 
            t.frequency === 'once' ? t.isCompleted : t.completions.length > 0
          ).length,
          totalTimeTracked: tasks.reduce((sum, t) => sum + (t.timeTaken || 0), 0)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

export const getWeeklyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Get start and end of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all tasks for this week (excluding recurring tasks that are already tracked)
    const tasks = await Task.find({
      userId,
      isCompleted: false,
      $or: [
        // One-time tasks in this week
        {
          frequency: 'once',
          startDate: { $gte: startOfWeek, $lte: endOfWeek }
        },
        // Recurring tasks (we'll filter them on frontend based on frequency)
        {
          frequency: { $ne: 'once' }
        }
      ]
    }).populate('columnId').populate('parentTaskId').sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        startOfWeek,
        endOfWeek,
        tasks
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly plan',
      error: error.message
    });
  }
};
