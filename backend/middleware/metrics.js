const logger = require('./logger');

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Alerta se tempo de resposta for muito alto
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration
      });
    }
  });
  
  next();
};

module.exports = metricsMiddleware;
