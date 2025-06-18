// Test script for backend API endpoints
const request = require('supertest');
const app = require('../src/backend/app');
const { query } = require('../src/backend/config/database');
const jwt = require('jsonwebtoken');

// Mock user for authentication tests
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user'
};

// Generate JWT token for testing
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Test sports API endpoints
describe('Sports API', () => {
  test('GET /api/sports should return list of sports', async () => {
    const response = await request(app).get('/api/sports');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });
  
  test('GET /api/sports/:sportId/events should return events for a sport', async () => {
    const response = await request(app).get('/api/sports/football/events');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('homeTeam');
    expect(response.body[0]).toHaveProperty('awayTeam');
    expect(response.body[0]).toHaveProperty('odds');
  });
  
  test('GET /api/events/:eventId should return event details', async () => {
    // First get an event ID from the sports/events endpoint
    const eventsResponse = await request(app).get('/api/sports/football/events');
    const eventId = eventsResponse.body[0].id;
    
    const response = await request(app).get(`/api/events/${eventId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', eventId);
    expect(response.body).toHaveProperty('homeTeam');
    expect(response.body).toHaveProperty('awayTeam');
    expect(response.body).toHaveProperty('odds');
  });
  
  test('GET /api/events/live should return live events', async () => {
    const response = await request(app).get('/api/events/live');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Note: This might be empty if no live events, so we don't assert on length
  });
});

// Test authentication API endpoints
describe('Authentication API', () => {
  test('POST /api/auth/register should register a new user', async () => {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', userData.username);
    expect(response.body.user).toHaveProperty('email', userData.email);
  });
  
  test('POST /api/auth/login should login a user', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', loginData.email);
  });
  
  test('GET /api/auth/me should return current user', async () => {
    const token = generateToken(mockUser);
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', mockUser.id);
    expect(response.body.user).toHaveProperty('username', mockUser.username);
    expect(response.body.user).toHaveProperty('email', mockUser.email);
  });
});

// Test betting API endpoints
describe('Betting API', () => {
  test('POST /api/bets should place a bet', async () => {
    const token = generateToken(mockUser);
    
    // First get an event ID from the sports/events endpoint
    const eventsResponse = await request(app).get('/api/sports/football/events');
    const eventId = eventsResponse.body[0].id;
    
    const betData = {
      eventId,
      selection: 'homeWin',
      amount: 100,
      odds: 2.1
    };
    
    const response = await request(app)
      .post('/api/bets')
      .set('Authorization', `Bearer ${token}`)
      .send(betData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('bet');
    expect(response.body.bet).toHaveProperty('eventId', eventId);
    expect(response.body.bet).toHaveProperty('selection', betData.selection);
    expect(response.body.bet).toHaveProperty('amount', betData.amount);
    expect(response.body.bet).toHaveProperty('odds', betData.odds);
    expect(response.body.bet).toHaveProperty('potentialWin');
    expect(response.body.bet).toHaveProperty('fee');
    expect(response.body.bet.fee).toBe(betData.amount * 0.02); // 2% fee
  });
  
  test('GET /api/bets should return user bets', async () => {
    const token = generateToken(mockUser);
    
    const response = await request(app)
      .get('/api/bets')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('bets');
    expect(Array.isArray(response.body.bets)).toBe(true);
  });
});

// Test wallet API endpoints
describe('Wallet API', () => {
  test('POST /api/wallet/deposit should process a deposit', async () => {
    const token = generateToken(mockUser);
    
    const depositData = {
      amount: 500,
      txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    
    const response = await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send(depositData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('transaction');
    expect(response.body.transaction).toHaveProperty('type', 'deposit');
    expect(response.body.transaction).toHaveProperty('amount', depositData.amount);
    expect(response.body.transaction).toHaveProperty('txHash', depositData.txHash);
  });
  
  test('POST /api/wallet/withdraw should process a withdrawal', async () => {
    const token = generateToken(mockUser);
    
    const withdrawData = {
      amount: 200,
      address: '0x1234567890abcdef1234567890abcdef12345678'
    };
    
    const response = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send(withdrawData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('transaction');
    expect(response.body.transaction).toHaveProperty('type', 'withdraw');
    expect(response.body.transaction).toHaveProperty('amount', withdrawData.amount);
    expect(response.body.transaction).toHaveProperty('txHash');
  });
  
  test('GET /api/wallet/transactions should return user transactions', async () => {
    const token = generateToken(mockUser);
    
    const response = await request(app)
      .get('/api/wallet/transactions')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('transactions');
    expect(Array.isArray(response.body.transactions)).toBe(true);
  });
});

// Test blockchain API endpoints
describe('Blockchain API', () => {
  test('GET /api/blockchain/status should return blockchain status', async () => {
    const response = await request(app).get('/api/blockchain/status');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toHaveProperty('contractAddress');
    expect(response.body.status).toHaveProperty('contractBalance');
    expect(response.body.status).toHaveProperty('network');
  });
});
