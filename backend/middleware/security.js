const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('./logger');

const cspDirectives = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https:'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    code: 'AUTH_RATE_LIMIT',
    message: 'Muitas tentativas. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { ip: req.ip, email: req.body?.email });
    res.status(429).json({
      code: 'AUTH_RATE_LIMIT',
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.'
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    code: 'API_RATE_LIMIT',
    message: 'Limite de requisições excedido'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    code: 'SENSITIVE_OPERATION_LIMIT',
    message: 'Operação temporariamente bloqueada por segurança'
  },
  handler: (req, res) => {
    logger.warn('Sensitive operation rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      code: 'SENSITIVE_OPERATION_LIMIT',
      message: 'Operação temporariamente bloqueada por segurança'
    });
  }
});

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? cspDirectives : false,
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }),
  apiLimiter
];

module.exports = {
  securityMiddleware,
  authLimiter,
  sensitiveLimiter,
  apiLimiter
};
