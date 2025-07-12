import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { userQueries, sessionQueries } from './edgedb-queries';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface User {
  id: string; // Changed from number to string for EdgeDB UUID
  email: string;
  username: string;
  is_admin: boolean;
  role: string; // 'admin', 'writer', 'reader'
  pen_name?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Hash password
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// Generate session token
export function generateSessionId(): string {
  return jwt.sign({ random: Math.random() }, JWT_SECRET);
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  try {
    await sessionQueries.create(sessionId, userId, expiresAt);
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  
  return sessionId;
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (!sessionId) {
      return null;
    }
    
    const session = await sessionQueries.findById(sessionId) as any;
    
    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      is_admin: session.user.is_admin,
      role: session.user.role,
      pen_name: session.user.pen_name,
      created_at: session.user.created_at,
      last_login: session.user.last_login,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await userQueries.findByEmail(email) as any;
    
    if (!user || !verifyPassword(password, user.password_hash)) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    await userQueries.update(user.id, { last_login: new Date() });

    const sessionId = await createSession(user.id);
    
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
        role: user.role,
        pen_name: user.pen_name,
        created_at: user.created_at,
        last_login: user.last_login,
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Register new user
export async function registerUser(email: string, password: string, username: string): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await userQueries.findByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    const passwordHash = hashPassword(password);
    const newUser = await userQueries.create({
      email,
      password_hash: passwordHash,
      username
    }) as any;

    if (!newUser) {
      return { success: false, error: 'Failed to create user' };
    }

    const sessionId = await createSession(newUser.id);
    
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        is_admin: newUser.is_admin,
        role: newUser.role,
        pen_name: newUser.pen_name,
        created_at: newUser.created_at,
        last_login: newUser.last_login,
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;
    
    if (sessionId) {
      await sessionQueries.delete(sessionId);
    }
    
    cookieStore.delete('session');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Verify session (for API routes)
export async function verifySession(sessionId: string): Promise<User | null> {
  try {
    const session = await sessionQueries.findById(sessionId) as any;
    return session?.user || null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await sessionQueries.cleanExpired();
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}
