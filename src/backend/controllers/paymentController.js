// Backend controller for payment status and notifications
const Web3 = require('web3');
const USDTBettingPlatformWithPartialPayouts = require('../blockchain/utils/USDTBettingPlatformWithPartialPayouts.json');
const config = require('../config');
const db = require('../database');

// Initialize Web3 and contract
const web3 = new Web3(config.web3Provider);
const bettingContract = new web3.eth.Contract(
  USDTBettingPlatformWithPartialPayouts.abi,
  config.contractAddress
);

/**
 * Get payment status for a specific bet
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const betId = req.params.betId;
    
    // Get bet details from blockchain
    const bet = await bettingContract.methods.getBet(betId).call();
    
    // Check if bet is in payment status
    if (bet.status !== '2' && bet.status !== '3') { // PartiallyPaid or FullyPaid
      return res.status(400).json({ error: 'Bet is not in payment status' });
    }
    
    // Get queue position if partially paid
    let queuePosition = null;
    if (bet.status === '2') { // PartiallyPaid
      const position = await bettingContract.methods.getPaymentQueuePosition(betId).call();
      if (position !== '115792089237316195423570985008687907853269984665640564039457584007913129639935') { // max uint256
        queuePosition = position;
      }
    }
    
    // Format response
    res.json({
      betId: betId,
      status: bet.status === '2' ? 'PartiallyPaid' : 'FullyPaid',
      paidAmount: web3.utils.fromWei(bet.paidAmount, 'mwei'), // Convert from USDT decimals (6)
      remainingAmount: web3.utils.fromWei(bet.remainingAmount, 'mwei'),
      paymentPercentage: bet.paymentPercentage,
      lastPaymentTime: new Date(bet.lastPaymentTime * 1000).toISOString(),
      queuePosition: queuePosition
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
};

/**
 * Get all partial payments for a user
 */
exports.getPartialPayments = async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    
    // Get all bets for the user
    const betIds = await bettingContract.methods.getUserBets(userAddress).call();
    
    // Filter only those with partial payments
    const partialPayments = [];
    for (const betId of betIds) {
      const bet = await bettingContract.methods.getBet(betId).call();
      if (bet.status === '2' || bet.status === '3') { // PartiallyPaid or FullyPaid
        partialPayments.push({
          betId: betId,
          status: bet.status === '2' ? 'PartiallyPaid' : 'FullyPaid',
          paidAmount: web3.utils.fromWei(bet.paidAmount, 'mwei'),
          remainingAmount: web3.utils.fromWei(bet.remainingAmount, 'mwei'),
          paymentPercentage: bet.paymentPercentage,
          lastPaymentTime: new Date(bet.lastPaymentTime * 1000).toISOString()
        });
      }
    }
    
    res.json(partialPayments);
  } catch (error) {
    console.error('Error fetching partial payments:', error);
    res.status(500).json({ error: 'Failed to fetch partial payments' });
  }
};

/**
 * Get payment queue position for a bet
 */
exports.getPaymentQueuePosition = async (req, res) => {
  try {
    const betId = req.params.betId;
    
    // Get position from blockchain
    const position = await bettingContract.methods.getPaymentQueuePosition(betId).call();
    
    // Check if bet is in queue
    if (position === '115792089237316195423570985008687907853269984665640564039457584007913129639935') { // max uint256
      return res.status(404).json({ error: 'Bet is not in payment queue' });
    }
    
    // Get total queue length
    const queueLength = await bettingContract.methods.getPaymentQueueLength().call();
    
    res.json({
      betId: betId,
      position: parseInt(position),
      queueLength: parseInt(queueLength),
      estimatedTimeRemaining: calculateEstimatedTime(parseInt(position))
    });
  } catch (error) {
    console.error('Error fetching queue position:', error);
    res.status(500).json({ error: 'Failed to fetch queue position' });
  }
};

/**
 * Process payment queue (admin only)
 */
exports.processPaymentQueue = async (req, res) => {
  try {
    // Check admin authorization
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if queue is empty
    const queueLength = await bettingContract.methods.getPaymentQueueLength().call();
    if (parseInt(queueLength) === 0) {
      return res.status(400).json({ error: 'Payment queue is empty' });
    }
    
    // Process payment queue
    const tx = await bettingContract.methods.processPaymentQueue().send({
      from: config.adminWallet,
      gas: 3000000
    });
    
    res.json({
      success: true,
      transactionHash: tx.transactionHash,
      message: 'Payment queue processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment queue:', error);
    res.status(500).json({ error: 'Failed to process payment queue' });
  }
};

/**
 * Save notification to database
 */
exports.saveNotification = async (userAddress, type, data) => {
  try {
    await db.notifications.create({
      userAddress,
      type,
      data: JSON.stringify(data),
      createdAt: new Date(),
      isRead: false
    });
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

/**
 * Get all notifications for a user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    
    const notifications = await db.notifications.findAll({
      where: { userAddress },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(notifications.map(n => ({
      id: n.id,
      type: n.type,
      data: JSON.parse(n.data),
      createdAt: n.createdAt,
      isRead: n.isRead
    })));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    await db.notifications.update(
      { isRead: true },
      { where: { id: notificationId, userAddress: req.user.address } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Calculate estimated time for payout based on position
 * This is a simple estimation based on historical data
 */
function calculateEstimatedTime(position) {
  // Average time to process one position (in minutes)
  const avgTimePerPosition = 30;
  
  // Calculate estimated minutes
  const estimatedMinutes = position * avgTimePerPosition;
  
  // Convert to human-readable format
  if (estimatedMinutes < 60) {
    return `~${estimatedMinutes} minutes`;
  } else if (estimatedMinutes < 1440) {
    const hours = Math.floor(estimatedMinutes / 60);
    return `~${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(estimatedMinutes / 1440);
    return `~${days} day${days > 1 ? 's' : ''}`;
  }
}
