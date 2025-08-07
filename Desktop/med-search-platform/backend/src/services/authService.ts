/**
 * Authentication Service
 * Handles user authentication and database operations
 */

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getDatabase } from '../config/database';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  token: string;
}

class AuthService {
  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const connection = await getDatabase().getConnection();
      
      const query = `
        SELECT id, username as firstName, email, password_hash as password, created_at as createdAt
        FROM users 
        WHERE email = ?
      `;

      const [rows] = await connection.execute(query, [email]);
      connection.release();

      if ((rows as any[]).length === 0) {
        return null;
      }

      const user = (rows as any[])[0];
      return {
        id: user.id,
        firstName: user.firstName || 'Usuario',
        lastName: '',
        email: user.email,
        phone: user.phone || '',
        password: user.password,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Error finding user');
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(id: number): Promise<User | null> {
    try {
      const connection = await getDatabase().getConnection();
      
      const query = `
        SELECT id, username as firstName, email, created_at as createdAt
        FROM users 
        WHERE id = ?
      `;

      const [rows] = await connection.execute(query, [id]);
      connection.release();

      if ((rows as any[]).length === 0) {
        return null;
      }

      const user = (rows as any[])[0];
      return {
        id: user.id,
        firstName: user.firstName || 'Usuario',
        lastName: '',
        email: user.email,
        phone: '',
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Error finding user');
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserData): Promise<AuthResult> {
    try {
      const connection = await getDatabase().getConnection();
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insert user into database
      const insertQuery = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `;

      const fullName = `${userData.firstName} ${userData.lastName}`.trim();
      const [result] = await connection.execute(insertQuery, [
        fullName,
        userData.email,
        hashedPassword
      ]);

      const userId = (result as any).insertId;
      connection.release();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: userId, 
          email: userData.email,
          role: 'patient'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      // Return user data (without password)
      const userResponse = {
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: 'patient'
      };

      return {
        user: userResponse,
        token
      };

    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string): Promise<AuthResult | null> {
    try {
      // Find user by email
      const user = await this.findUserByEmail(email);
      if (!user || !user.password) {
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: 'patient'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      // Return user data (without password)
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: 'patient'
      };

      return {
        user: userResponse,
        token
      };

    } catch (error) {
      console.error('Error logging in user:', error);
      throw new Error('Error logging in user');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: number): Promise<void> {
    try {
      const connection = await getDatabase().getConnection();
      
      const query = `
        UPDATE users 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      await connection.execute(query, [userId]);
      connection.release();

    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();