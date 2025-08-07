// backend/src/services/userService.ts
import { getDatabase } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class UserService {
  private db = getDatabase();

  public async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
        [id]
      );
      
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Error en UserService.findById:', error);
      throw new Error('Error interno en consulta de usuario');
    }
  }
}