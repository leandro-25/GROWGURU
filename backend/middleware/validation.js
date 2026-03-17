const Joi = require('joi');
const { ApiError } = require('./errorHandler');
const logger = require('./logger');

const sanitize = (value) => {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/[<>]/g, '')
      .normalize('NFC');
  }
  return value;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitize(value);
  }
  return sanitized;
};

const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-mail inválido',
      'any.required': 'E-mail é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),
  
  signup: Joi.object({
    nome: Joi.string().min(3).max(50).required().messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 50 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'E-mail inválido',
      'any.required': 'E-mail é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'E-mail inválido',
      'any.required': 'E-mail é obrigatório'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  transactionQuery: Joi.object({
    page: Joi.number().integer().min(0).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    tipo: Joi.string().valid('compra', 'venda').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }),

  buyAsset: Joi.object({
    codigo_ativo: Joi.string().min(1).max(10).required(),
    quantidade: Joi.number().positive().required(),
    valor_compra: Joi.number().positive().required(),
    estrategia_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  }),

  sellAsset: Joi.object({
    codigo_ativo: Joi.string().min(1).max(10).required(),
    quantidade: Joi.number().positive().required(),
    estrategia_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    preco_venda: Joi.number().positive().optional()
  })
};

const validate = (schema) => (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeObject(req.body);
  }
  
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    logger.warn('Validation failed', { errors, path: req.path });

    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      errors
    });
  }
  
  req.validatedBody = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    req.query = sanitizeObject(req.query);
  }
  
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Parâmetros inválidos',
      errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  schemas,
  validate,
  validateQuery,
  sanitize,
  sanitizeObject
};
