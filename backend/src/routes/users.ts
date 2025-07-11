import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        lastLogin: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    // If email is being updated, check if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: req.user!.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already taken',
          message: 'Another user is already using this email address'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { timeframe = 'all' } = req.query;
    
    let dateFilter = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = {
        huntDate: {
          gte: weekAgo
        }
      };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = {
        huntDate: {
          gte: monthAgo
        }
      };
    }

    const hunts = await prisma.hunt.findMany({
      where: {
        userId: req.user!.id,
        ...dateFilter
      },
      include: {
        denominations: true
      }
    });

    // Calculate statistics
    const totalHunts = hunts.length;
    const totalRolls = hunts.reduce((sum, hunt) => sum + hunt.totalRolls, 0);
    const totalCoinsChecked = hunts.reduce((sum, hunt) => sum + hunt.totalCoinsChecked, 0);
    const totalSilverFound = hunts.reduce((sum, hunt) => sum + hunt.totalSilverFound, 0);
    const successRate = totalCoinsChecked > 0 ? ((totalSilverFound / totalCoinsChecked) * 100).toFixed(2) : '0.00';

    // Bank statistics
    const bankStats = hunts.reduce((acc, hunt) => {
      if (!acc[hunt.bankName]) {
        acc[hunt.bankName] = {
          hunts: 0,
          totalSilver: 0,
          totalCoins: 0
        };
      }
      acc[hunt.bankName].hunts++;
      acc[hunt.bankName].totalSilver += hunt.totalSilverFound;
      acc[hunt.bankName].totalCoins += hunt.totalCoinsChecked;
      return acc;
    }, {} as Record<string, any>);

    // Denomination statistics
    const denominationStats = hunts.reduce((acc, hunt) => {
      hunt.denominations.forEach(denom => {
        if (!acc[denom.denomination]) {
          acc[denom.denomination] = {
            rolls: 0,
            coinsChecked: 0,
            silverFound: 0
          };
        }
        acc[denom.denomination].rolls += denom.numberOfRolls;
        acc[denom.denomination].coinsChecked += denom.totalCoinsChecked;
        acc[denom.denomination].silverFound += denom.silverCoinsFound;
      });
      return acc;
    }, {} as Record<string, any>);

    res.json({
      timeframe,
      summary: {
        totalHunts,
        totalRolls,
        totalCoinsChecked,
        totalSilverFound,
        successRate: parseFloat(successRate)
      },
      bankStats,
      denominationStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics'
    });
  }
});

// DELETE /api/users/account - Delete user account
router.delete('/account', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Delete user (cascades to hunts and denominations)
    await prisma.user.delete({
      where: { id: req.user!.id }
    });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account'
    });
  }
});

export default router;
