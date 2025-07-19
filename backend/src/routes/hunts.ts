import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { createHuntSchema, updateHuntSchema, paginationSchema } from '../services/validation';
import prisma from '../services/database';

const router = express.Router();

// GET /api/hunts - Get all hunts for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const { page = '1', limit = '50', sortBy = 'huntDate', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const hunts = await prisma.hunt.findMany({
      where: {
        userId: req.user!.id
      },
      include: {
        denominations: true
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      skip,
      take: limitNum,
    });

    const totalHunts = await prisma.hunt.count({
      where: {
        userId: req.user!.id
      }
    });

    res.json({
      hunts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalHunts,
        pages: Math.ceil(totalHunts / limitNum)
      }
    });
  } catch (error) {
    console.error('Get hunts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve hunts'
    });
  }
});

// GET /api/hunts/:id - Get specific hunt
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;

    const hunt = await prisma.hunt.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        denominations: true
      }
    });

    if (!hunt) {
      return res.status(404).json({
        error: 'Hunt not found'
      });
    }

    res.json({ hunt });
  } catch (error) {
    console.error('Get hunt error:', error);
    res.status(500).json({
      error: 'Failed to retrieve hunt'
    });
  }
});

// POST /api/hunts - Create new hunt
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const validatedData = createHuntSchema.parse(req.body);
    const { denominations, ...huntData } = validatedData;

    // Calculate totals from denominations
    const totalRolls = denominations.reduce((sum, d) => sum + d.numberOfRolls, 0);
    const totalCoinsChecked = denominations.reduce((sum, d) => sum + (d.numberOfRolls * d.coinsPerRoll), 0);
    const totalSilverFound = denominations.reduce((sum, d) => sum + d.silverCoinsFound, 0);

    // Calculate if hunt is fully processed (all denominations are processed)
    const isProcessed = denominations.every(d => d.isProcessed);

    const hunt = await prisma.hunt.create({
      data: {
        ...huntData,
        huntDate: new Date(huntData.huntDate),
        userId: req.user!.id,
        totalRolls,
        totalCoinsChecked,
        totalSilverFound,
        isProcessed,
        denominations: {
          create: denominations.map(d => ({
            ...d,
            totalCoinsChecked: d.numberOfRolls * d.coinsPerRoll
          }))
        }
      },
      include: {
        denominations: true
      }
    });

    res.status(201).json({
      message: 'Hunt created successfully',
      hunt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Create hunt error:', error);
    res.status(500).json({
      error: 'Failed to create hunt'
    });
  }
});

// PUT /api/hunts/:id - Update hunt
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;
    const validatedData = updateHuntSchema.parse(req.body);

    // Check if hunt exists and belongs to user
    const existingHunt = await prisma.hunt.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        denominations: true
      }
    });

    if (!existingHunt) {
      return res.status(404).json({
        error: 'Hunt not found'
      });
    }

    const { denominations, ...huntData } = validatedData;

    // If denominations are being updated, recalculate totals
    let updateData: any = { ...huntData };

    if (huntData.huntDate) {
      updateData.huntDate = new Date(huntData.huntDate);
    }

    if (denominations) {
      // Calculate new totals
      const totalRolls = denominations.reduce((sum, d) => sum + d.numberOfRolls, 0);
      const totalCoinsChecked = denominations.reduce((sum, d) => sum + (d.numberOfRolls * d.coinsPerRoll), 0);
      const totalSilverFound = denominations.reduce((sum, d) => sum + d.silverCoinsFound, 0);

      // Calculate if hunt is fully processed (all denominations are processed)
      const isProcessed = denominations.every(d => d.isProcessed);

      updateData = {
        ...updateData,
        totalRolls,
        totalCoinsChecked,
        totalSilverFound,
        isProcessed,
      };

      // Delete existing denominations and create new ones
      await prisma.huntDenomination.deleteMany({
        where: { huntId: id }
      });
    }

    const updatedHunt = await prisma.hunt.update({
      where: { id },
      data: {
        ...updateData,
        ...(denominations && {
          denominations: {
            create: denominations.map(d => ({
              ...d,
              totalCoinsChecked: d.numberOfRolls * d.coinsPerRoll
            }))
          }
        })
      },
      include: {
        denominations: true
      }
    });

    res.json({
      message: 'Hunt updated successfully',
      hunt: updatedHunt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Update hunt error:', error);
    res.status(500).json({
      error: 'Failed to update hunt'
    });
  }
});

// DELETE /api/hunts/:id - Delete hunt
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;

    // Check if hunt exists and belongs to user
    const existingHunt = await prisma.hunt.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingHunt) {
      return res.status(404).json({
        error: 'Hunt not found'
      });
    }

    // Delete hunt (cascades to denominations)
    await prisma.hunt.delete({
      where: { id }
    });

    res.json({
      message: 'Hunt deleted successfully'
    });
  } catch (error) {
    console.error('Delete hunt error:', error);
    res.status(500).json({
      error: 'Failed to delete hunt'
    });
  }
});

export default router;
