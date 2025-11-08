import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({ 
      $or: [{ username: username || email }, { email: email || username }] 
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate token
    const token = generateToken({
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

export const addCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.body;

    if (!category || typeof category !== 'string' || category.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if category already exists (case-insensitive)
    const categoryExists = user.categories.some(
      cat => cat.toLowerCase() === category.trim().toLowerCase()
    );

    if (categoryExists) {
      res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
      return;
    }

    user.categories.push(category.trim());
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        categories: user.categories
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding category',
      error: error.message
    });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const initialLength = user.categories.length;
    user.categories = user.categories.filter(cat => cat !== category);

    if (user.categories.length === initialLength) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        categories: user.categories
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        categories: user.categories
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};
