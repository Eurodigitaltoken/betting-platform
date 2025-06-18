const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const Web3 = require('web3');
const redis = require('../config/redis');

// Initialize Web3 with Ethereum provider
const web3 = new Web3(process.env.ETHEREUM_PROVIDER);

// USDT contract ABI (simplified for this example)
const usdtAbi = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// Betting contract ABI (simplified for this example)
const bettingAbi = require('../blockchain/contracts/USDTBetting.json').abi;

// Contract addresses
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const BETTING_CONTRACT_ADDRESS = process.env.BETTING_CONTRACT_ADDRESS;

// Initialize contracts
const usdtContract = new web3.eth.Contract(usdtAbi, USDT_CONTRACT_ADDRESS);
const bettingContract = new web3.eth.Contract(bettingAbi, BETTING_CONTRACT_ADDRESS);

// Place a bet
router.post('/bets', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    const { eventId, selection, amount, odds } = req.body;
    
    // Validate input
    if (!eventId || !selection || !amount || !odds) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate amount
    if (amount <= 0 || amount > 9999) {
      return res.status(400).json({ error: 'Amount must be between 1 and 9999 USDT' });
    }
    
    // Get user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Get event
    const eventResult = await query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Calculate potential win
    const potentialWin = amount * odds;
    
    // Calculate fee (2%)
    const fee = amount * 0.02;
    
    // Create bet in database
    const betResult = await query(
      'INSERT INTO bets (user_id, event_id, selection, amount, odds, potential_win, fee, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [userId, eventId, selection, amount, odds, potentialWin, fee, 'pending']
    );
    
    const bet = betResult.rows[0];
    
    // Update user balance
    await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userId]);
    
    // In a real implementation, this would interact with the blockchain
    // For now, we'll just simulate it
    
    res.status(201).json({
      success: true,
      bet: {
        id: bet.id,
        eventId: bet.event_id,
        selection,
        amount,
        odds,
        potentialWin,
        fee,
        status: bet.status,
        createdAt: bet.created_at
      }
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

// Get user bets
router.get('/bets', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    
    const result = await query(
      `SELECT b.*, e.home_team, e.away_team, e.league 
       FROM bets b 
       JOIN events e ON b.event_id = e.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    
    const bets = result.rows.map(bet => ({
      id: bet.id,
      eventId: bet.event_id,
      event: `${bet.home_team} vs ${bet.away_team}`,
      league: bet.league,
      selection: bet.selection,
      amount: bet.amount,
      odds: bet.odds,
      potentialWin: bet.potential_win,
      fee: bet.fee,
      status: bet.status,
      result: bet.result,
      payout: bet.payout,
      createdAt: bet.created_at,
      settledAt: bet.settled_at
    }));
    
    res.json({
      success: true,
      bets
    });
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
});

// Deposit USDT
router.post('/wallet/deposit', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    const { amount, txHash } = req.body;
    
    // Validate input
    if (!amount || !txHash) {
      return res.status(400).json({ error: 'Amount and transaction hash are required' });
    }
    
    // Validate amount
    if (amount <= 0 || amount > 9999) {
      return res.status(400).json({ error: 'Amount must be between 1 and 9999 USDT' });
    }
    
    // Get user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // In a real implementation, we would verify the transaction on the blockchain
    // For now, we'll just simulate it
    
    // Create transaction record
    const transactionResult = await query(
      'INSERT INTO transactions (user_id, type, amount, tx_hash, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, 'deposit', amount, txHash, 'completed']
    );
    
    const transaction = transactionResult.rows[0];
    
    // Update user balance
    await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
    
    res.status(201).json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        txHash: transaction.tx_hash,
        status: transaction.status,
        createdAt: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Withdraw USDT
router.post('/wallet/withdraw', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    const { amount, address } = req.body;
    
    // Validate input
    if (!amount || !address) {
      return res.status(400).json({ error: 'Amount and Ethereum address are required' });
    }
    
    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    // Get user
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // In a real implementation, this would interact with the blockchain
    // For now, we'll just simulate it
    const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Create transaction record
    const transactionResult = await query(
      'INSERT INTO transactions (user_id, type, amount, tx_hash, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, 'withdraw', amount, txHash, 'pending']
    );
    
    const transaction = transactionResult.rows[0];
    
    // Update user balance
    await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userId]);
    
    // In a real implementation, we would process the withdrawal asynchronously
    // For now, we'll just simulate it
    setTimeout(async () => {
      try {
        await query('UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2', ['completed', transaction.id]);
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    }, 5000);
    
    res.status(201).json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        txHash: transaction.tx_hash,
        status: transaction.status,
        createdAt: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get user transactions
router.get('/wallet/transactions', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    
    const result = await query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const transactions = result.rows.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      txHash: tx.tx_hash,
      status: tx.status,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at
    }));
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
