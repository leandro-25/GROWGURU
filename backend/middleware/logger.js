const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'growguru-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
}

logger.auth = (message, metadata = {}) => {
  logger.info(`[AUTH] ${message}`, metadata);
};

logger.api = (message, metadata = {}) => {
  logger.info(`[API] ${message}`, { method: metadata.method, url: metadata.url, ...metadata });
};

logger.db = (message, metadata = {}) => {
  logger.debug(`[DB] ${message}`, metadata);
};

logger.security = (message, metadata = {}) => {
  logger.warn(`[SECURITY] ${message}`, metadata);
};

module.exports = logger;
