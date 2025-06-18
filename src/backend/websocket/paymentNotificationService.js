// WebSocket service for payment notifications
const setupPaymentNotifications = (io, bettingContract) => {
  console.log('Setting up payment notification listeners');
  
  // Listen for blockchain events
  bettingContract.events.BetPartiallyPaid({})
    .on('data', async (event) => {
      const { betId, bettor, paidAmount, remainingAmount, paymentPercentage } = event.returnValues;
      
      console.log(`Partial payment event: Bet ${betId}, User ${bettor}, Amount ${paidAmount}`);
      
      // Send notification to user
      io.to(bettor).emit('paymentUpdate', {
        type: 'partialPayment',
        betId: betId,
        paidAmount: web3.utils.fromWei(paidAmount, 'mwei'),
        remainingAmount: web3.utils.fromWei(remainingAmount, 'mwei'),
        paymentPercentage: paymentPercentage,
        timestamp: new Date().toISOString()
      });
      
      // Save notification to database
      try {
        const paymentController = require('../controllers/paymentController');
        await paymentController.saveNotification(bettor, 'partialPayment', {
          betId, paidAmount, remainingAmount, paymentPercentage
        });
      } catch (error) {
        console.error('Error saving partial payment notification:', error);
      }
    })
    .on('error', (error) => {
      console.error('Error in BetPartiallyPaid event listener:', error);
    });
  
  bettingContract.events.BetFullyPaid({})
    .on('data', async (event) => {
      const { betId, bettor, totalAmount } = event.returnValues;
      
      console.log(`Full payment event: Bet ${betId}, User ${bettor}, Amount ${totalAmount}`);
      
      // Send notification to user
      io.to(bettor).emit('paymentUpdate', {
        type: 'fullPayment',
        betId: betId,
        totalAmount: web3.utils.fromWei(totalAmount, 'mwei'),
        timestamp: new Date().toISOString()
      });
      
      // Save notification to database
      try {
        const paymentController = require('../controllers/paymentController');
        await paymentController.saveNotification(bettor, 'fullPayment', {
          betId, totalAmount
        });
      } catch (error) {
        console.error('Error saving full payment notification:', error);
      }
    })
    .on('error', (error) => {
      console.error('Error in BetFullyPaid event listener:', error);
    });
  
  bettingContract.events.BetAddedToPaymentQueue({})
    .on('data', async (event) => {
      const { betId, bettor, pendingAmount } = event.returnValues;
      
      console.log(`Added to queue event: Bet ${betId}, User ${bettor}, Amount ${pendingAmount}`);
      
      // Send notification to user
      io.to(bettor).emit('paymentUpdate', {
        type: 'addedToQueue',
        betId: betId,
        pendingAmount: web3.utils.fromWei(pendingAmount, 'mwei'),
        timestamp: new Date().toISOString()
      });
      
      // Save notification to database
      try {
        const paymentController = require('../controllers/paymentController');
        await paymentController.saveNotification(bettor, 'addedToQueue', {
          betId, pendingAmount
        });
      } catch (error) {
        console.error('Error saving queue notification:', error);
      }
    })
    .on('error', (error) => {
      console.error('Error in BetAddedToPaymentQueue event listener:', error);
    });
    
  // Setup automatic payment queue processing
  setupAutomaticQueueProcessing(bettingContract);
};

// Setup automatic payment queue processing
const setupAutomaticQueueProcessing = (bettingContract) => {
  const config = require('../config');
  const web3 = new Web3(config.web3Provider);
  
  // Process queue every 30 minutes
  const PROCESS_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  setInterval(async () => {
    try {
      // Check if queue has any items
      const queueLength = await bettingContract.methods.getPaymentQueueLength().call();
      
      if (parseInt(queueLength) > 0) {
        console.log(`Processing payment queue with ${queueLength} items`);
        
        // Check contract balance
        const availableBalance = await bettingContract.methods.getAvailableBalance().call();
        
        if (parseInt(availableBalance) > 0) {
          // Process payment queue
          await bettingContract.methods.processPaymentQueue().send({
            from: config.adminWallet,
            gas: 3000000
          });
          
          console.log('Payment queue processed successfully');
        } else {
          console.log('No funds available for processing payment queue');
        }
      } else {
        console.log('Payment queue is empty, nothing to process');
      }
    } catch (error) {
      console.error('Error processing payment queue automatically:', error);
    }
  }, PROCESS_INTERVAL);
};

module.exports = {
  setupPaymentNotifications
};
