// Backend configuration for Render deployment
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/betting_platform',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Blockchain configuration
  web3Provider: process.env.WEB3_PROVIDER_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS || '0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3',
  adminFeeAddress: process.env.ADMIN_FEE_ADDRESS || '0xE4A87598050D7877a79E2BEff12A25Be636c557e',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Redis configuration (for WebSocket sessions)
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // API keys
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  
  // File upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  
  // Email configuration (if needed)
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

