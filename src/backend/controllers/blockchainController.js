const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const web3Service = require('../../blockchain/utils/web3Service');
require('dotenv').config();

// Admin Ethereum address and private key
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const contractBalance = await web3Service.getContractBalance();
    
    res.json({
      success: true,
      status: {
        contractAddress: process.env.BETTING_CONTRACT_ADDRESS,
        contractBalance: contractBalance,
        network: process.env.ETHEREUM_NETWORK || 'testnet'
      }
    });
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    res.status(500).json({ error: 'Failed to get blockchain status' });
  }
});

// Settle a bet (admin only)
router.post('/bets/:betId/settle', verifyAdmin, async (req, res) => {
  try {
    const { betId } = req.params;
    const { won } = req.body;
    
    if (typeof won !== 'boolean') {
      return res.status(400).json({ error: 'Won parameter must be a boolean' });
    }
    
    // Get bet from database
    const betResult = await query('SELECT * FROM bets WHERE id = $1', [betId]);
    if (betResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    const bet = betResult.rows[0];
    
    // Check if bet is already settled
    if (bet.status !== 'pending') {
      return res.status(400).json({ error: 'Bet is already settled or cancelled' });
    }
    
    // Settle bet on blockchain
    const receipt = await web3Service.settleBet(
      bet.blockchain_bet_id,
      won,
      ADMIN_ADDRESS,
      ADMIN_PRIVATE_KEY
    );
    
    // Update bet in database
    await query(
      'UPDATE bets SET status = $1, result = $2, payout = $3, settled_at = NOW(), tx_hash = $4 WHERE id = $5',
      [
        'settled',
        won ? 'won' : 'lost',
        won ? bet.potential_win : 0,
        receipt.transactionHash,
        betId
      ]
    );
    
    // If bet is won, update user balance
    if (won) {
      await query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [bet.potential_win, bet.user_id]
      );
    }
    
    res.json({
      success: true,
      message: `Bet ${betId} settled successfully`,
      won,
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error settling bet:', error);
    res.status(500).json({ error: 'Failed to settle bet' });
  }
});

// Cancel a bet (admin only)
router.post('/bets/:betId/cancel', verifyAdmin, async (req, res) => {
  try {
    const { betId } = req.params;
    
    // Get bet from database
    const betResult = await query('SELECT * FROM bets WHERE id = $1', [betId]);
    if (betResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    const bet = betResult.rows[0];
    
    // Check if bet is already settled or cancelled
    if (bet.status !== 'pending') {
      return res.status(400).json({ error: 'Bet is already settled or cancelled' });
    }
    
    // Cancel bet on blockchain
    const receipt = await web3Service.cancelBet(
      bet.blockchain_bet_id,
      ADMIN_ADDRESS,
      ADMIN_PRIVATE_KEY
    );
    
    // Update bet in database
    await query(
      'UPDATE bets SET status = $1, cancelled_at = NOW(), tx_hash = $2 WHERE id = $3',
      ['cancelled', receipt.transactionHash, betId]
    );
    
    // Refund user
    await query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [bet.amount, bet.user_id]
    );
    
    res.json({
      success: true,
      message: `Bet ${betId} cancelled successfully`,
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error cancelling bet:', error);
    res.status(500).json({ error: 'Failed to cancel bet' });
  }
});

// Withdraw fees (admin only)
router.post('/fees/withdraw', verifyAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    // Withdraw fees on blockchain
    const receipt = await web3Service.withdrawFees(
      amount,
      ADMIN_ADDRESS,
      ADMIN_PRIVATE_KEY
    );
    
    // Record transaction in database
    await query(
      'INSERT INTO admin_transactions (type, amount, tx_hash, created_at) VALUES ($1, $2, $3, NOW())',
      ['fee_withdrawal', amount, receipt.transactionHash]
    );
    
    res.json({
      success: true,
      message: `Fees withdrawn successfully: ${amount} USDT`,
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    console.error('Error withdrawing fees:', error);
    res.status(500).json({ error: 'Failed to withdraw fees' });
  }
});

// Create Ethereum account
router.post('/accounts', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    
    // Check if user already has an Ethereum address
    const userResult = await query('SELECT ethereum_address FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userResult.rows[0].ethereum_address) {
      return res.status(400).json({ error: 'User already has an Ethereum address' });
    }
    
    // Create new Ethereum account
    const account = web3Service.createAccount();
    
    // Update user with new Ethereum address
    await query(
      'UPDATE users SET ethereum_address = $1, ethereum_private_key = $2 WHERE id = $3',
      [account.address, account.privateKey, userId]
    );
    
    res.json({
      success: true,
      address: account.address
    });
  } catch (error) {
    console.error('Error creating Ethereum account:', error);
    res.status(500).json({ error: 'Failed to create Ethereum account' });
  }
});

module.exports = router;
