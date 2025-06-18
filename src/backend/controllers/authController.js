const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await query(
      'INSERT INTO users (username, email, password, balance, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, balance',
      [username, email, hashedPassword, 0]
    );
    
    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    // which will add user to req object
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, username, email, balance, ethereum_address, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const userId = req.user.id;
    const { username, email, ethereum_address } = req.body;
    
    // Validate input
    if (!username && !email && !ethereum_address) {
      return res.status(400).json({ error: 'At least one field is required' });
    }
    
    // Check if username or email already exists
    if (username || email) {
      const existingUser = await query(
        'SELECT * FROM users WHERE (email = $1 OR username = $2) AND id != $3',
        [email || '', username || '', userId]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username or email already in use' });
      }
    }
    
    // Update user
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let valueIndex = 1;
    
    if (username) {
      updateQuery += `username = $${valueIndex}, `;
      updateValues.push(username);
      valueIndex++;
    }
    
    if (email) {
      updateQuery += `email = $${valueIndex}, `;
      updateValues.push(email);
      valueIndex++;
    }
    
    if (ethereum_address) {
      updateQuery += `ethereum_address = $${valueIndex}, `;
      updateValues.push(ethereum_address);
      valueIndex++;
    }
    
    updateQuery += `updated_at = NOW() WHERE id = $${valueIndex} RETURNING id, username, email, balance, ethereum_address`;
    updateValues.push(userId);
    
    const result = await query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
