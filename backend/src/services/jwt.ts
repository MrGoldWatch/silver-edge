import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

export class JWTService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
  }

  /**
   * Generate a JWT token for a user
   */
  static generateToken(userId: string, email: string, expiresIn: string = '7d'): string {
    const payload: JWTPayload = { userId, email };
    return jwt.sign(payload, this.getSecret(), { expiresIn } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.getSecret()) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Generate a refresh token (longer expiration)
   */
  static generateRefreshToken(userId: string, email: string): string {
    return this.generateToken(userId, email, '30d');
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(userId: string, email: string): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateToken(userId, email, '7d'),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}
