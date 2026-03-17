const supabase = require('../config/database');
const UserModel = require('../models/UserModel');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');
const ResponseFormatter = require('../utils/responseFormatter');

class AuthController {
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    logger.info('Login attempt', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      logger.warn('Login failed', { email, error: error.message });
      throw new ApiError(error.code || 'AUTH_ERROR', 'E-mail ou senha incorretos');
    }

    logger.info('Login successful', { email, userId: data.user.id });
    res.json({ user: data.user, session: data.session });
  });

  static signup = asyncHandler(async (req, res) => {
    const { nome, email, password } = req.body;
    
    logger.info('Signup attempt', { email });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: { data: { nome: nome.trim() } }
    });

    if (authError) {
      logger.warn('Signup failed', { email, error: authError.message });
      throw new ApiError(authError.code || 'SIGNUP_ERROR', authError.message);
    }

    const userData = await UserModel.createUser({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      user_id: authData.user.id
    });

    logger.info('Signup successful', { email, userId: authData.user.id });
    res.status(201).json({ user: { ...authData.user, profile: userData[0] } });
  });

  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    logger.info('Password reset request', { email });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'growguru://reset-password'
    });

    if (error) {
      logger.warn('Password reset failed', { email, error: error.message });
      throw new ApiError(error.code || 'PASSWORD_RESET_ERROR', 
        'Não foi possível enviar o e-mail de recuperação. Verifique se o e-mail está correto.');
    }

    logger.info('Password reset email sent', { email });
    res.json(ResponseFormatter.success({ message: 'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.' }));
  });

  static resetPassword = asyncHandler(async (req, res) => {
    const { token, password, confirmPassword } = req.body;
    
    logger.info('Password reset attempt', { hasToken: !!token });

    if (!token) {
      throw new ApiError('MISSING_TOKEN', 'Token de redefinição não fornecido.');
    }

    if (!password || !confirmPassword) {
      throw new ApiError('MISSING_FIELDS', 'Por favor, preencha todos os campos.');
    }

    if (password !== confirmPassword) {
      throw new ApiError('PASSWORDS_DONT_MATCH', 'As senhas não coincidem.');
    }

    if (password.length < 6) {
      throw new ApiError('PASSWORD_TOO_SHORT', 'A senha deve ter no mínimo 6 caracteres.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      logger.warn('Password reset failed', { error: error.message });
      throw new ApiError(error.code || 'PASSWORD_RESET_ERROR', 
        'Não foi possível redefinir a senha. O link pode ter expirado ou ser inválido.');
    }

    logger.info('Password reset successful');
    res.json(ResponseFormatter.success({ message: 'Senha redefinida com sucesso!' }));
  });
}

module.exports = AuthController;