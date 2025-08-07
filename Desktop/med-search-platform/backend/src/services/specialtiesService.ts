/**
 * Specialties Service
 * Handles specialty-related data operations
 */

import { database } from '../config/database';

export interface SpecialtyFilters {
  popular?: boolean;
  category?: string;
  limit?: number;
}

export interface Specialty {
  id: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  iconUrl?: string;
  displayOrder: number;
  colorCode?: string;
  searchKeywords?: string;
  isPopular: boolean;
  doctorCount: number;
  avgConsultationFee: number;
}

class SpecialtiesService {
  /**
   * Get all specialties with optional filters
   */
  async getAll(filters: SpecialtyFilters = {}): Promise<Specialty[]> {
    const {
      popular = false,
      category,
      limit = 50
    } = filters;

    try {
      const connection = await database.getConnection();
      
      let query = `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.category,
          s.is_active as isActive,
          s.icon_url as iconUrl,
          s.display_order as displayOrder,
          s.color_code as colorCode,
          s.search_keywords as searchKeywords,
          s.is_popular as isPopular,
          s.doctor_count as doctorCount,
          s.avg_consultation_fee as avgConsultationFee
        FROM specialties s
        WHERE s.is_active = TRUE
      `;

      const params: any[] = [];

      if (popular) {
        query += ` AND s.is_popular = TRUE`;
      }

      if (category) {
        query += ` AND s.category = ?`;
        params.push(category);
      }

      query += ` ORDER BY s.display_order ASC, s.name ASC`;
      
      if (limit > 0) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      const [rows] = await connection.execute(query, params);
      connection.release();

      return (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        isActive: Boolean(row.isActive),
        iconUrl: row.iconUrl,
        displayOrder: row.displayOrder,
        colorCode: row.colorCode,
        searchKeywords: row.searchKeywords,
        isPopular: Boolean(row.isPopular),
        doctorCount: row.doctorCount || 0,
        avgConsultationFee: parseFloat(row.avgConsultationFee || '0')
      }));

    } catch (error) {
      console.error('Error in getAll specialties:', error);
      throw new Error('Error fetching specialties');
    }
  }

  /**
   * Get specialty by ID
   */
  async getById(id: number): Promise<Specialty | null> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.category,
          s.is_active as isActive,
          s.icon_url as iconUrl,
          s.display_order as displayOrder,
          s.color_code as colorCode,
          s.search_keywords as searchKeywords,
          s.is_popular as isPopular,
          s.doctor_count as doctorCount,
          s.avg_consultation_fee as avgConsultationFee
        FROM specialties s
        WHERE s.id = ? AND s.is_active = TRUE
      `;

      const [rows] = await connection.execute(query, [id]);
      connection.release();

      if ((rows as any[]).length === 0) {
        return null;
      }

      const row = (rows as any[])[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        isActive: Boolean(row.isActive),
        iconUrl: row.iconUrl,
        displayOrder: row.displayOrder,
        colorCode: row.colorCode,
        searchKeywords: row.searchKeywords,
        isPopular: Boolean(row.isPopular),
        doctorCount: row.doctorCount || 0,
        avgConsultationFee: parseFloat(row.avgConsultationFee || '0')
      };

    } catch (error) {
      console.error('Error in getById specialty:', error);
      throw new Error('Error fetching specialty');
    }
  }

  /**
   * Get popular specialties
   */
  async getPopular(limit: number = 8): Promise<Specialty[]> {
    return this.getAll({ popular: true, limit });
  }

  /**
   * Get specialty categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT DISTINCT category
        FROM specialties
        WHERE is_active = TRUE
        ORDER BY category ASC
      `;

      const [rows] = await connection.execute(query);
      connection.release();

      return (rows as any[]).map(row => row.category);

    } catch (error) {
      console.error('Error in getCategories:', error);
      throw new Error('Error fetching specialty categories');
    }
  }

  /**
   * Search specialties by name or keywords
   */
  async search(query: string, limit: number = 10): Promise<Specialty[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const connection = await database.getConnection();
      
      const searchQuery = `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.category,
          s.is_active as isActive,
          s.icon_url as iconUrl,
          s.display_order as displayOrder,
          s.color_code as colorCode,
          s.search_keywords as searchKeywords,
          s.is_popular as isPopular,
          s.doctor_count as doctorCount,
          s.avg_consultation_fee as avgConsultationFee,
          CASE 
            WHEN s.name LIKE ? THEN 1
            WHEN s.search_keywords LIKE ? THEN 2
            WHEN s.description LIKE ? THEN 3
            ELSE 4
          END as relevance
        FROM specialties s
        WHERE s.is_active = TRUE
        AND (
          s.name LIKE ? OR 
          s.search_keywords LIKE ? OR 
          s.description LIKE ?
        )
        ORDER BY relevance ASC, s.display_order ASC
        LIMIT ?
      `;

      const searchTerm = `%${query}%`;
      const params = [
        searchTerm, searchTerm, searchTerm,  // for relevance calculation
        searchTerm, searchTerm, searchTerm,  // for WHERE clause
        limit
      ];

      const [rows] = await connection.execute(searchQuery, params);
      connection.release();

      return (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        isActive: Boolean(row.isActive),
        iconUrl: row.iconUrl,
        displayOrder: row.displayOrder,
        colorCode: row.colorCode,
        searchKeywords: row.searchKeywords,
        isPopular: Boolean(row.isPopular),
        doctorCount: row.doctorCount || 0,
        avgConsultationFee: parseFloat(row.avgConsultationFee || '0')
      }));

    } catch (error) {
      console.error('Error in search specialties:', error);
      throw new Error('Error searching specialties');
    }
  }
}

export const specialtiesService = new SpecialtiesService();