// Integration script for main app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Web3 = require('web3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import configuration
const config = require('./config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sportsRoutes = require('./routes/sportsRoutes');
const bettingRoutes = require('./routes/bettingRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // New payment routes

// Import WebSocket services
const websocketService = require('./websocket/websocketService');
const paymentNotificationService = require('./websocket/paymentNotificationService'); // New payment notification service

// Import blockchain contracts
const USDTBettingPlatformWithPartialPayouts = require('./blockchain/utils/USDTBettingPlatformWithPartialPayouts.json');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Web3 and contract
const web3 = new Web3(config.web3Provider);
const bettingContract = new web3.eth.Contract(
  USDTBettingPlatformWithPartialPayouts.abi,
  config.contractAddress
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/payments', paymentRoutes); // New payment routes

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// WebSocket setup
websocketService.setupWebsocket(io);
paymentNotificationService.setupPaymentNotifications(io, bettingContract); // Setup payment notifications

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Contract address: ${config.contractAddress}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});

module.exports = { app, server };
