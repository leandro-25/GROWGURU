const corsConfig = {
  development: {
    origin: [
      'http://localhost:8100',
      'http://localhost:8101',
      'capacitor://localhost',
      'http://localhost',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'ionic://localhost',
      'http://localhost:4200',
      'chrome-extension://*',
      'devtools://devtools',
      'ws://localhost:*',
      'http://localhost:*'
    ],
    credentials: true
  },
  
  production: {
    origin: [
      'https://gg-backend-vercel2.vercel.app',
      'https://gg-railway-production.up.railway.app',
      'https://*.vercel.app',
      'https://*.up.railway.app',
      'http://localhost:8100',
      'http://localhost:8101',
      'capacitor://*',
      'ionic://*'
    ],
    credentials: true
  },

  test: {
    origin: '*',
    credentials: true
  }
};

const corsOptions = {
  origin: function (origin, callback) {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'test' || !origin) {
      return callback(null, true);
    }
    
    const config = corsConfig[env];
    
    if (!config || !config.origin) {
      return callback(null, true);
    }

    const isAllowed = config.origin.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin.endsWith('*')) {
        const domain = allowedOrigin.replace(/\/\*$/, '');
        return origin.startsWith(domain);
      }
      return origin === allowedOrigin;
    });

    if (isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Cache-Control', 
    'Pragma', 
    'Expires', 
    'DevTools-Request-Id',
    'Access-Control-Allow-Origin'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
};

module.exports = corsOptions;
