import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or account deactivated'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true
      }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};
