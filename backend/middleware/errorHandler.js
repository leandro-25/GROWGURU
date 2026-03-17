const logger = require('./logger');

class ApiError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const Errors = {
  VALIDATION: (details) => new ApiError('VALIDATION_ERROR', 'Dados inválidos', 400, details),
  AUTH_FAILED: new ApiError('AUTH_FAILED', 'Credenciais inválidas', 401),
  UNAUTHORIZED: new ApiError('UNAUTHORIZED', 'Não autorizado', 401),
  FORBIDDEN: new ApiError('FORBIDDEN', 'Acesso negado', 403),
  NOT_FOUND: (resource) => new ApiError('NOT_FOUND', `${resource} não encontrado`, 404),
  CONFLICT: (message) => new ApiError('CONFLICT', message, 409),
  RATE_LIMIT: new ApiError('RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido', 429),
  INTERNAL: new ApiError('INTERNAL_ERROR', 'Erro interno do servidor', 500),
  DB_ERROR: (message) => new ApiError('DB_ERROR', message, 500)
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    logger.warn('ApiError', { 
      code: err.code, 
      message: err.message, 
      path: req.path,
      ip: req.ip 
    });
    
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  if (err.code && err.message) {
    logger.error('Supabase error', { code: err.code, message: err.message });
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'DB_ERROR',
        message: 'Erro ao processar dados'
      }
    });
  }

  logger.error('Unknown error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path 
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro inesperado'
    }
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  Errors,
  errorHandler,
  asyncHandler
};
