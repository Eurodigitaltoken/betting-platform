// Routes for payment status and notifications
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const websocketService = require('../websocket/websocketService');

// Mock payment queue for partial payouts
let paymentQueue = [];
let paymentHistory = [];

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get payment status for a bet
router.get('/status/:betId', verifyToken, (req, res) => {
  try {
    const betId = parseInt(req.params.betId);
    
    // Mock payment status data
    const paymentStatus = {
      betId,
      totalAmount: 1000,
      paidAmount: 300,
      remainingAmount: 700,
      paymentPercentage: 30,
      status: 'partial',
      queuePosition: 2,
      estimatedPaymentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      paymentHistory: [
        {
          id: 1,
          amount: 300,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          transactionHash: '0x1234567890abcdef...'
        }
      ]
    };
    
    res.json({
      success: true,
      paymentStatus
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's payment history
router.get('/history', verifyToken, (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock payment history
    const userPaymentHistory = [
      {
        id: 1,
        betId: 1,
        amount: 300,
        type: 'partial_payout',
        status: 'completed',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        transactionHash: '0x1234567890abcdef...'
      },
      {
        id: 2,
        betId: 2,
        amount: 500,
        type: 'full_payout',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        transactionHash: '0xabcdef1234567890...'
      }
    ];
    
    res.json({
      success: true,
      payments: userPaymentHistory
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment queue status
router.get('/queue', verifyToken, (req, res) => {
  try {
    // Mock payment queue data
    const queueData = {
      totalInQueue: 5,
      totalAmount: 15000,
      estimatedProcessingTime: '2-4 hours',
      userPosition: req.user.userId === 1 ? 2 : null,
      queue: [
        {
          betId: 1,
          userId: 1,
          amount: 700,
          priority: 1,
          estimatedTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        {
          betId: 3,
          userId: 2,
          amount: 1200,
          priority: 2,
          estimatedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    res.json({
      success: true,
      queueData
    });
  } catch (error) {
    console.error('Error fetching payment queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process partial payment (admin only)
router.post('/process/:betId', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const betId = parseInt(req.params.betId);
    const { amount } = req.body;
    
    // Mock processing partial payment
    const payment = {
      id: paymentHistory.length + 1,
      betId,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString(),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
      status: 'completed'
    };
    
    paymentHistory.push(payment);
    
    // Send WebSocket notification to user
    websocketService.sendPaymentUpdate(1, {
      type: 'partial_payment_processed',
      payment,
      newPercentage: 60 // Mock new percentage
    });
    
    res.json({
      success: true,
      message: 'Partial payment processed',
      payment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform payment statistics (admin only)
router.get('/stats', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = {
      totalPendingPayments: 5,
      totalPendingAmount: 15000,
      totalPaidToday: 25000,
      totalPaidThisWeek: 150000,
      averagePaymentTime: '3.2 hours',
      platformBalance: 50000,
      queueLength: 5
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
