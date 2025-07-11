import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const nameSchema = z.string().min(1, 'Name cannot be empty').max(100, 'Name too long');
export const dateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format');

// Denomination validation
export const denominationTypeSchema = z.enum(['Dimes', 'Quarters', 'Halves']);

export const denominationSchema = z.object({
  denomination: denominationTypeSchema,
  numberOfRolls: z.number().int().min(0, 'Number of rolls must be non-negative'),
  coinsPerRoll: z.number().int().min(1, 'Coins per roll must be at least 1'),
  silverCoinsFound: z.number().int().min(0, 'Silver coins found must be non-negative').default(0),
  isProcessed: z.boolean().default(false),
  processingNotes: z.string().optional(),
});

// Auth validation schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Hunt validation schemas
export const createHuntSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(255, 'Bank name too long'),
  branchName: z.string().max(255, 'Branch name too long').optional(),
  branchAddress: z.string().max(500, 'Branch address too long').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  huntDate: dateSchema,
  denominations: z.array(denominationSchema).min(1, 'At least one denomination is required'),
  processingNotes: z.string().max(1000, 'Processing notes too long').optional(),
});

export const updateHuntSchema = createHuntSchema.partial();

// User validation schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
});

// Query parameter validation
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  sortBy: z.string().default('huntDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const statsQuerySchema = z.object({
  timeframe: z.enum(['all', 'week', 'month']).default('all'),
});

// Validation helper function
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};
