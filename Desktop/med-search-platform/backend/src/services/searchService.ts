/**
 * Search Service
 * Handles search operations for doctors and specialties
 */

import mysql from 'mysql2/promise';
import { database } from '../config/database';

export interface SearchFilters {
  specialty?: string | string[];
  location?: string;
  rating?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends SearchFilters {
  q?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  doctors: any[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class SearchService {
  /**
   * Search doctors with filters and pagination
   */
  async searchDoctors(params: SearchParams): Promise<SearchResult> {
    const {
      q = '',
      specialty,
      location,
      rating = 0,
      priceMin = 0,
      priceMax = 10000,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = params;

    const offset = (page - 1) * limit;
    
    let baseQuery = `
      SELECT DISTINCT
        d.id,
        d.first_name,
        d.last_name,
        d.phone_number,
        d.address,
        d.city,
        d.state,
        d.zip_code,
        d.bio,
        d.consultation_fee,
        d.years_experience,
        d.rating_avg,
        d.rating_count,
        d.is_verified,
        d.is_accepting_patients,
        d.created_at,
        d.updated_at,
        s.name as specialty_name,
        s.id as specialty_id
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.is_verified = TRUE AND d.is_accepting_patients = TRUE
    `;

    const queryParams: any[] = [];

    // Search query filter
    if (q && q.trim()) {
      baseQuery += ` AND (
        d.first_name LIKE ? OR 
        d.last_name LIKE ? OR 
        s.name LIKE ? OR
        CONCAT(d.first_name, ' ', d.last_name) LIKE ?
      )`;
      const searchTerm = `%${q.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Specialty filter
    if (specialty) {
      if (Array.isArray(specialty)) {
        const placeholders = specialty.map(() => '?').join(',');
        baseQuery += ` AND (s.id IN (${placeholders}) OR s.name IN (${placeholders}))`;
        queryParams.push(...specialty, ...specialty);
      } else {
        baseQuery += ` AND (s.id = ? OR s.name = ?)`;
        queryParams.push(specialty, specialty);
      }
    }

    // Location filter
    if (location) {
      baseQuery += ` AND (d.city LIKE ? OR d.state LIKE ?)`;
      const locationTerm = `%${location}%`;
      queryParams.push(locationTerm, locationTerm);
    }

    // Rating filter
    if (rating > 0) {
      baseQuery += ` AND d.rating_avg >= ?`;
      queryParams.push(rating);
    }

    // Price filter
    if (priceMin > 0 || priceMax < 10000) {
      baseQuery += ` AND d.consultation_fee BETWEEN ? AND ?`;
      queryParams.push(priceMin, priceMax);
    }

    // Sorting
    const sortColumns = {
      rating: 'd.rating_avg',
      price: 'd.consultation_fee',
      experience: 'd.years_experience',
      availability: 'd.created_at'
    };

    const sortColumn = sortColumns[sortBy] || 'd.rating_avg';
    baseQuery += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

    // Pagination
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    try {
      const connection = await database.getConnection();
      
      // Get total count for pagination
      let countQuery = baseQuery.replace(
        /SELECT DISTINCT[\s\S]*?FROM/,
        'SELECT COUNT(DISTINCT d.id) as total FROM'
      ).replace(/ORDER BY[\s\S]*/, '');
      
      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const [countResult] = await connection.execute(countQuery, countParams);
      const total = (countResult as any[])[0].total;

      // Execute main query
      const [rows] = await connection.execute(baseQuery, queryParams);
      
      connection.release();

      const doctors = (rows as any[]).map(doctor => ({
        id: doctor.id,
        name: `${doctor.first_name} ${doctor.last_name}`,
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        specialty: doctor.specialty_name,
        specialtyId: doctor.specialty_id,
        rating: parseFloat((doctor.rating_avg || 0).toFixed(1)),
        reviewCount: doctor.rating_count || 0,
        consultationFee: doctor.consultation_fee,
        experience: `${doctor.years_experience} años`,
        phone: doctor.phone_number,
        address: doctor.address,
        city: doctor.city,
        state: doctor.state,
        zipCode: doctor.zip_code,
        bio: doctor.bio,
        photo: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}-profile?w=400&h=400&fit=crop`,
        isVerified: doctor.is_verified,
        isAcceptingPatients: doctor.is_accepting_patients,
        availability: this.generateAvailability(doctor.id)
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        doctors,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Error searching doctors');
    }
  }

  /**
   * Get featured doctors
   */
  async getFeaturedDoctors(limit: number = 6): Promise<any[]> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT 
          d.id,
          d.first_name,
          d.last_name,
          d.phone_number,
          d.bio,
          d.consultation_fee,
          d.years_experience,
          d.rating_avg,
          d.rating_count,
          s.name as specialty_name,
          s.id as specialty_id
        FROM doctors d
        LEFT JOIN specialties s ON d.specialty_id = s.id
        WHERE d.is_verified = TRUE AND d.is_accepting_patients = TRUE
        ORDER BY d.rating_avg DESC, d.rating_count DESC
        LIMIT ?
      `;

      const [rows] = await connection.execute(query, [limit]);
      connection.release();

      return (rows as any[]).map(doctor => ({
        id: doctor.id,
        name: `${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty_name,
        specialtyId: doctor.specialty_id,
        rating: parseFloat((doctor.rating_avg || 0).toFixed(1)),
        reviewCount: doctor.rating_count || 0,
        consultationFee: doctor.consultation_fee,
        experience: `${doctor.years_experience} años`,
        phone: doctor.phone_number,
        bio: doctor.bio,
        photo: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}-medical?w=400&h=400&fit=crop`,
        isVerified: true,
        nextAvailable: this.getNextAvailableSlot()
      }));

    } catch (error) {
      console.error('Featured doctors error:', error);
      throw new Error('Error fetching featured doctors');
    }
  }

  /**
   * Log search query for analytics
   */
  async logSearch(query: string, userId?: number, resultsCount: number = 0): Promise<void> {
    try {
      const connection = await database.getConnection();
      
      const logQuery = `
        INSERT INTO search_logs (user_id, query, search_date, results_count)
        VALUES (?, ?, NOW(), ?)
      `;

      await connection.execute(logQuery, [userId || null, query, resultsCount]);
      connection.release();

    } catch (error) {
      console.error('Search logging error:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT query, COUNT(*) as search_count
        FROM search_logs
        WHERE search_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND query IS NOT NULL
        AND query != ''
        GROUP BY query
        ORDER BY search_count DESC
        LIMIT ?
      `;

      const [rows] = await connection.execute(query, [limit]);
      connection.release();

      return (rows as any[]).map(row => row.query);

    } catch (error) {
      console.error('Popular searches error:', error);
      return [
        'Cardiolog�a',
        'Pediatr�a', 
        'Dermatolog�a',
        'Ginecolog�a',
        'Neurolog�a'
      ];
    }
  }

  /**
   * Search suggestions for autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      const connection = await database.getConnection();
      
      const suggestionQuery = `
        (SELECT DISTINCT s.name as suggestion, 'specialty' as type
         FROM specialties s 
         WHERE s.name LIKE ?
         LIMIT 3)
        UNION
        (SELECT DISTINCT CONCAT(d.first_name, ' ', d.last_name) as suggestion, 'doctor' as type
         FROM doctors d 
         WHERE (d.first_name LIKE ? OR d.last_name LIKE ?)
         LIMIT 2)
        ORDER BY type DESC
        LIMIT ?
      `;

      const searchTerm = `%${query}%`;
      const [rows] = await connection.execute(suggestionQuery, [
        searchTerm, 
        searchTerm, 
        searchTerm, 
        limit
      ]);
      
      connection.release();

      return (rows as any[]).map(row => row.suggestion);

    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Generate mock availability data
   */
  private generateAvailability(doctorId: number): string[] {
    const slots = [
      '09:00 AM', '10:00 AM', '11:00 AM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];
    
    // Return random available slots
    return slots.filter(() => Math.random() > 0.3);
  }

  /**
   * Get next available appointment slot
   */
  private getNextAvailableSlot(): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const slots = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    
    return `${tomorrow.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })}, ${randomSlot}`;
  }
}

export const searchService = new SearchService();