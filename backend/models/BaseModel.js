const logger = require('../middleware/logger');
const supabase = require('../config/database');
const { cacheManager } = require('../middleware/cache');

class BaseModel {
  static async query(queryFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await queryFn();
      } catch (error) {
        logger.warn(`Query attempt ${i + 1} failed`, { error: error.message });
        
        if (i === retries - 1) {
          logger.error('Query failed after all retries', { error });
          throw error;
        }
        
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  static async getUserId(userId) {
    const cacheKey = `user:${userId}`;
    let usuarioId = cacheManager.get('USER_DATA', cacheKey);
    
    if (!usuarioId) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      usuarioId = data.id;
      cacheManager.set('USER_DATA', cacheKey, usuarioId, 60);
    }
    
    return usuarioId;
  }
}

module.exports = BaseModel;
