const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

// Mock bets database
let bets = [
  {
    id: 1,
    userId: 1,
    eventId: 1,
    betType: 'home',
    amount: 100,
    odds: 2.5,
    potentialWin: 250,
    status: 'active',
    placedAt: new Date().toISOString(),
    paymentStatus: 'pending',
    paidAmount: 0,
    paymentPercentage: 0
  }
];

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

// Place a bet
router.post('/place', verifyToken, (req, res) => {
  try {
    const { eventId, betType, amount, odds } = req.body;
    
    // Validate input
    if (!eventId || !betType || !amount || !odds) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    // Create new bet
    const newBet = {
      id: bets.length + 1,
      userId: req.user.userId,
      eventId: parseInt(eventId),
      betType,
      amount: parseFloat(amount),
      odds: parseFloat(odds),
      potentialWin: parseFloat(amount) * parseFloat(odds),
      status: 'active',
      placedAt: new Date().toISOString(),
      paymentStatus: 'pending',
      paidAmount: 0,
      paymentPercentage: 0
    };
    
    bets.push(newBet);
    
    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet: newBet
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bets
router.get('/my-bets', verifyToken, (req, res) => {
  try {
    const userBets = bets.filter(bet => bet.userId === req.user.userId);
    
    res.json({
      success: true,
      bets: userBets
    });
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bet by ID
router.get('/:id', verifyToken, (req, res) => {
  try {
    const betId = parseInt(req.params.id);
    const bet = bets.find(bet => bet.id === betId);
    
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    // Check if user owns this bet or is admin
    if (bet.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      success: true,
      bet
    });
  } catch (error) {
    console.error('Error fetching bet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bet status (admin only)
router.put('/:id/status', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const betId = parseInt(req.params.id);
    const { status } = req.body;
    
    const bet = bets.find(bet => bet.id === betId);
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    bet.status = status;
    
    // If bet is won, simulate partial payout
    if (status === 'won') {
      bet.paymentStatus = 'partial';
      bet.paidAmount = bet.potentialWin * 0.3; // Pay 30% initially
      bet.paymentPercentage = 30;
    }
    
    res.json({
      success: true,
      message: 'Bet status updated',
      bet
    });
  } catch (error) {
    console.error('Error updating bet status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bets (admin only)
router.get('/', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({
      success: true,
      bets
    });
  } catch (error) {
    console.error('Error fetching all bets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

