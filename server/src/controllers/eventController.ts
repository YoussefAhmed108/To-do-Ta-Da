import { Response } from 'express';
import Event from '../models/Event';
import { AuthRequest } from '../types';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = { userId: req.user?.id };
    
    if (startDate && endDate) {
      query.$or = [
        // One-time events in range
        {
          frequency: 'once',
          startTime: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string)
          }
        },
        // Recurring events
        {
          frequency: { $ne: 'once' },
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date(startDate as string) } }
          ]
        }
      ];
    }

    const events = await Event.find(query).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const event = await Event.findOne({ _id: id, userId: req.user?.id });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventData = {
      ...req.body,
      userId: req.user?.id
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndDelete({ _id: id, userId: req.user?.id });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};
