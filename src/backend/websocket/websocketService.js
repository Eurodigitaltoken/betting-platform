const socketIo = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  setupWebsocket(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Handle user authentication
      socket.on('authenticate', (data) => {
        try {
          const { userId, token } = data;
          // In production, verify JWT token here
          this.connectedUsers.set(socket.id, { userId, socket });
          socket.join(`user_${userId}`);
          
          socket.emit('authenticated', { success: true });
          console.log(`User ${userId} authenticated with socket ${socket.id}`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authentication_error', { error: 'Invalid token' });
        }
      });
      
      // Handle bet updates
      socket.on('subscribe_bet_updates', (betId) => {
        socket.join(`bet_${betId}`);
        console.log(`Socket ${socket.id} subscribed to bet ${betId} updates`);
      });
      
      // Handle payment status updates
      socket.on('subscribe_payment_updates', (userId) => {
        socket.join(`payments_${userId}`);
        console.log(`Socket ${socket.id} subscribed to payment updates for user ${userId}`);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.connectedUsers.delete(socket.id);
      });
      
      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }
  
  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }
  
  // Send notification to all users subscribed to a bet
  sendToBet(betId, event, data) {
    if (this.io) {
      this.io.to(`bet_${betId}`).emit(event, data);
    }
  }
  
  // Send payment notification to user
  sendPaymentUpdate(userId, data) {
    if (this.io) {
      this.io.to(`payments_${userId}`).emit('payment_update', data);
    }
  }
  
  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
  
  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }
}

module.exports = new WebSocketService();

