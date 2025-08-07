/**
 * Search Controller
 * Handles search-related HTTP requests
 */

import { Request, Response } from 'express';
import { searchService, SearchParams } from '../services/searchService';
import { body, query, validationResult } from 'express-validator';

export class SearchController {
  /**
   * Search doctors with filters
   */
  async searchDoctors(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Invalid search parameters',
          errors: errors.array()
        });
        return;
      }

      const searchParams: SearchParams = {
        q: req.query.q as string,
        specialty: req.query.specialty as string | string[],
        location: req.query.location as string,
        rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        priceMin: req.query.priceMin ? parseInt(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseInt(req.query.priceMax as string) : undefined,
        sortBy: req.query.sortBy as 'rating' | 'price' | 'experience' | 'availability',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12
      };

      const results = await searchService.searchDoctors(searchParams);

      // Log search query
      if (searchParams.q) {
        const userId = (req as any).user?.id;
        await searchService.logSearch(searchParams.q, userId, results.total);
      }

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Search doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during search'
      });
    }
  }

  /**
   * Get featured doctors
   */
  async getFeaturedDoctors(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      
      if (limit > 20) {
        res.status(400).json({
          success: false,
          message: 'Limit cannot exceed 20'
        });
        return;
      }

      const doctors = await searchService.getFeaturedDoctors(limit);

      res.json({
        success: true,
        data: {
          doctors,
          total: doctors.length
        }
      });

    } catch (error) {
      console.error('Featured doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured doctors'
      });
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!query || query.length < 2) {
        res.json({
          success: true,
          data: {
            suggestions: []
          }
        });
        return;
      }

      const suggestions = await searchService.getSearchSuggestions(query, limit);

      res.json({
        success: true,
        data: {
          suggestions
        }
      });

    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching search suggestions'
      });
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const searches = await searchService.getPopularSearches(limit);

      res.json({
        success: true,
        data: {
          searches
        }
      });

    } catch (error) {
      console.error('Popular searches error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching popular searches'
      });
    }
  }

  /**
   * Search all content (doctors, specialties, etc.)
   */
  async searchAll(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
        return;
      }

      // Search doctors
      const doctorResults = await searchService.searchDoctors({
        q: query,
        limit: 6
      });

      // In a real implementation, you might also search specialties, articles, etc.
      
      res.json({
        success: true,
        data: {
          doctors: doctorResults.doctors,
          totalDoctors: doctorResults.total,
          // Add other search results here
          specialties: [], // Placeholder
          articles: [] // Placeholder
        }
      });

    } catch (error) {
      console.error('Search all error:', error);
      res.status(500).json({
        success: false,
        message: 'Error performing global search'
      });
    }
  }
}

// Validation middleware
export const searchValidation = {
  searchDoctors: [
    query('q').optional().isString().trim().isLength({ min: 1, max: 100 }),
    query('specialty').optional().isString().trim(),
    query('location').optional().isString().trim().isLength({ max: 100 }),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('priceMin').optional().isInt({ min: 0 }),
    query('priceMax').optional().isInt({ min: 0 }),
    query('sortBy').optional().isIn(['rating', 'price', 'experience', 'availability']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  
  suggestions: [
    query('q').notEmpty().isString().trim().isLength({ min: 2, max: 50 }),
    query('limit').optional().isInt({ min: 1, max: 10 })
  ],
  
  popular: [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ]
};

export const searchController = new SearchController();