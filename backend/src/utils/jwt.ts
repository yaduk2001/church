import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    id: string;
    username?: string;
    email?: string;
    phone?: string;
    role: string;
}

/**
 * Generate JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload as any, JWT_SECRET as any, {
        expiresIn: JWT_EXPIRES_IN,
    } as any) as string;
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): JWTPayload | null => {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (error) {
        return null;
    }
};
