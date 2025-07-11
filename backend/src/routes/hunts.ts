import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const denominationSchema = z.object({
  denomination: z.enum(['Dimes', 'Quarters', 'Halves']),
  numberOfRolls: z.number().int().min(0),
  coinsPerRoll: z.number().int().min(1),
  silverCoinsFound: z.number().int().min(0).default(0),
  isProcessed: z.boolean().default(false),
  processingNotes: z.string().optional(),
});

const createHuntSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().optional(),
  branchAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  huntDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  denominations: z.array(denominationSchema).min(1, 'At least one denomination is required'),
  processingNotes: z.string().optional(),
});

const updateHuntSchema = createHuntSchema.partial();

// GET /api/hunts - Get all hunts for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
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
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
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
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = createHuntSchema.parse(req.body);
    const { denominations, ...huntData } = validatedData;

    // Calculate totals from denominations
    const totalRolls = denominations.reduce((sum, d) => sum + d.numberOfRolls, 0);
    const totalCoinsChecked = denominations.reduce((sum, d) => sum + (d.numberOfRolls * d.coinsPerRoll), 0);
    const totalSilverFound = denominations.reduce((sum, d) => sum + d.silverCoinsFound, 0);

    const hunt = await prisma.hunt.create({
      data: {
        ...huntData,
        huntDate: new Date(huntData.huntDate),
        userId: req.user!.id,
        totalRolls,
        totalCoinsChecked,
        totalSilverFound,
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

export default router;
