import { Request, Response, NextFunction } from 'express';
import { store, UserAccount } from '../dataStore';

export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
  isAdmin?: boolean;
}

const ADMIN_SECRET_KEY = process.env.ADMIN_KEY || 'beyond_admin_secret_2026';
const ADMIN_EMAILS = [
  'admin@beyond.world',
  'admin@beyond.app',
  'yuvakishore.vps@gmail.com',
];

/**
 * Extracts session or admin credentials from headers and populates req.user & req.isAdmin.
 */
export function extractAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  req.isAdmin = false;
  req.user = undefined;

  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'];
  const sessionToken = req.headers['x-session-token'] as string;
  const userId = req.headers['x-user-id'] as string;

  // 1. Direct Admin Key Check
  if (adminKey && adminKey === ADMIN_SECRET_KEY) {
    req.isAdmin = true;
  }

  // 2. Token or Header Resolution
  const token = authHeader?.replace(/^Bearer\s+/i, '') || sessionToken;
  if (token) {
    const foundUser = store.getUserByToken(token);
    if (foundUser) {
      req.user = foundUser;
      if (
        foundUser.role === 'admin' ||
        ADMIN_EMAILS.includes(foundUser.email.toLowerCase())
      ) {
        req.isAdmin = true;
      }
    }
  } else if (userId) {
    const users = store.getUsers();
    const foundUser = users.find((u) => u.id === userId);
    if (foundUser) {
      req.user = foundUser;
      if (
        foundUser.role === 'admin' ||
        ADMIN_EMAILS.includes(foundUser.email.toLowerCase())
      ) {
        req.isAdmin = true;
      }
    }
  }

  next();
}

/**
 * Middleware: Strictly requires that the user is authenticated (e.g. logged in with Google/Supabase).
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user && !req.isAdmin) {
    return res.status(401).json({
      error: 'Authentication Required: Please sign in with Google or your explorer account to upload discoveries.',
      code: 'AUTH_REQUIRED',
    });
  }
  next();
}

/**
 * Middleware: Strictly requires Admin privileges.
 * NON-ADMINS CANNOT DELETE VERIFIED PLACES/DISCOVERIES.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.isAdmin || (req.user && req.user.role === 'admin')) {
    return next();
  }

  return res.status(403).json({
    error: 'Access Denied: Only administrators have permission to delete verified discoveries from BEYOND.',
    code: 'ADMIN_DELETE_ONLY',
    requiredRole: 'admin',
    currentRole: req.user?.role || 'anonymous',
  });
}
