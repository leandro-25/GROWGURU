const supabase = require('../config/database');
const BaseModel = require('./BaseModel');
const logger = require('../middleware/logger');

class UserModel extends BaseModel {
  static async getUserById(userId) {
    return await this.query(async () => {
      logger.info('Getting user by ID', { userId });
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, saldo')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      logger.info('User retrieved successfully', { userId });
      return data;
    });
  }

  static async updateUser(userId, updates) {
    return await this.query(async () => {
      logger.info('Updating user', { userId, updates });
      
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('user_id', userId)
        .select();
        
      if (error) throw error;
      
      logger.info('User updated successfully', { userId });
      return data;
    });
  }

  static async createUser(userData) {
    return await this.query(async () => {
      logger.info('Creating user', { email: userData.email });
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select();
        
      if (error) throw error;
      
      logger.info('User created successfully', { userId: data[0].id });
      return data;
    });
  }
}

module.exports = UserModel;