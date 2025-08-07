/**
 * Search Routes
 * Handles search-related API endpoints
 */

import { Router } from 'express';
import { searchController, searchValidation } from '../controllers/searchController';
import { auth } from '../config/middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/search/doctors
 * @desc    Search doctors with filters
 * @access  Public
 */
router.get(
  '/doctors',
  searchValidation.searchDoctors,
  searchController.searchDoctors
);

/**
 * @route   GET /api/v1/search/featured
 * @desc    Get featured doctors
 * @access  Public
 */
router.get(
  '/featured',
  searchController.getFeaturedDoctors
);

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get search suggestions for autocomplete
 * @access  Public
 */
router.get(
  '/suggestions',
  searchValidation.suggestions,
  searchController.getSearchSuggestions
);

/**
 * @route   GET /api/v1/search/popular
 * @desc    Get popular search terms
 * @access  Public
 */
router.get(
  '/popular',
  searchValidation.popular,
  searchController.getPopularSearches
);

/**
 * @route   GET /api/v1/search
 * @desc    Global search (doctors, specialties, etc.)
 * @access  Public
 */
router.get(
  '/',
  searchController.searchAll
);

export default router;