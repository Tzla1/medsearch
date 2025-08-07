/**
 * Specialties Controller
 * Handles specialty-related operations
 */

import { Request, Response } from 'express';
import { specialtiesService } from '../services/specialtiesService';

export class SpecialtiesController {
  /**
   * Get all specialties
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        popular = false, 
        category,
        limit = 50 
      } = req.query;

      const filters = {
        popular: popular === 'true',
        category: category as string,
        limit: parseInt(limit as string)
      };

      const specialties = await specialtiesService.getAll(filters);

      res.json({
        success: true,
        data: specialties,
        total: specialties.length
      });

    } catch (error) {
      console.error('Error in getAll specialties:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching specialties',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get specialty by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          message: 'Invalid specialty ID'
        });
        return;
      }

      const specialty = await specialtiesService.getById(parseInt(id));

      if (!specialty) {
        res.status(404).json({
          success: false,
          message: 'Specialty not found'
        });
        return;
      }

      res.json({
        success: true,
        data: specialty
      });

    } catch (error) {
      console.error('Error in getById specialty:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching specialty',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get popular specialties
   */
  async getPopular(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 8 } = req.query;

      const specialties = await specialtiesService.getPopular(parseInt(limit as string));

      res.json({
        success: true,
        data: specialties,
        total: specialties.length
      });

    } catch (error) {
      console.error('Error in getPopular specialties:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching popular specialties',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get specialty categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await specialtiesService.getCategories();

      res.json({
        success: true,
        data: categories,
        total: categories.length
      });

    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching specialty categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export const specialtiesController = new SpecialtiesController();