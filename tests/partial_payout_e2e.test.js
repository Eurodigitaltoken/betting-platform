// Test script for end-to-end testing of partial payout functionality
const { expect } = require('chai');
const { ethers } = require('hardhat');
const Web3 = require('web3');

describe('Partial Payout System End-to-End Tests', function() {
  let owner, user1, user2, user3;
  let usdtToken, bettingPlatform;
  let web3;
  
  // Test constants
  const INITIAL_SUPPLY = ethers.utils.parseUnits('1000000', 6); // 1,000,000 USDT
  const BET_AMOUNT = ethers.utils.parseUnits('1000', 6); // 1,000 USDT
  const POTENTIAL_WIN = ethers.utils.parseUnits('2000', 6); // 2,000 USDT
  const EVENT_ID = 'event123';
  const OUTCOME_ID = 'outcome456';
  
  before(async function() {
    // Initialize accounts
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy mock USDT token
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    usdtToken = await MockUSDT.deploy(INITIAL_SUPPLY);
    await usdtToken.deployed();
    
    // Deploy betting platform with partial payouts
    const USDTBettingPlatformWithPartialPayouts = await ethers.getContractFactory('USDTBettingPlatformWithPartialPayouts');
    bettingPlatform = await USDTBettingPlatformWithPartialPayouts.deploy(usdtToken.address);
    await bettingPlatform.deployed();
    
    // Initialize web3 instance
    web3 = new Web3(ethers.provider);
    
    // Transfer USDT to users
    await usdtToken.transfer(user1.address, ethers.utils.parseUnits('10000', 6));
    await usdtToken.transfer(user2.address, ethers.utils.parseUnits('10000', 6));
    await usdtToken.transfer(user3.address, ethers.utils.parseUnits('10000', 6));
    
    // Approve betting platform to spend USDT
    await usdtToken.connect(user1).approve(bettingPlatform.address, ethers.utils.parseUnits('10000', 6));
    await usdtToken.connect(user2).approve(bettingPlatform.address, ethers.utils.parseUnits('10000', 6));
    await usdtToken.connect(user3).approve(bettingPlatform.address, ethers.utils.parseUnits('10000', 6));
  });
  
  describe('Basic Functionality Tests', function() {
    it('Should place bets correctly', async function() {
      // User1 places a bet
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, EVENT_ID, OUTCOME_ID, POTENTIAL_WIN);
      
      // User2 places a bet
      await bettingPlatform.connect(user2).placeBet(BET_AMOUNT, EVENT_ID, OUTCOME_ID, POTENTIAL_WIN);
      
      // Check total bets
      expect(await bettingPlatform.totalBets()).to.equal(2);
      
      // Check user bets
      const user1Bets = await bettingPlatform.getUserBets(user1.address);
      expect(user1Bets.length).to.equal(1);
      expect(user1Bets[0]).to.equal(0);
      
      const user2Bets = await bettingPlatform.getUserBets(user2.address);
      expect(user2Bets.length).to.equal(1);
      expect(user2Bets[0]).to.equal(1);
    });
    
    it('Should settle bets with full payment when funds are available', async function() {
      // Deposit funds to contract
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('5000', 6));
      
      // Settle User1's bet as won
      await bettingPlatform.connect(owner).settleBet(0, true);
      
      // Check bet status
      const bet = await bettingPlatform.getBet(0);
      expect(bet.status).to.equal(3); // FullyPaid
      expect(bet.won).to.be.true;
      expect(bet.paidAmount).to.equal(POTENTIAL_WIN);
      expect(bet.remainingAmount).to.equal(0);
      expect(bet.paymentPercentage).to.equal(100);
      
      // Check user1's USDT balance
      const user1Balance = await usdtToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(ethers.utils.parseUnits('11000', 6)); // 10000 - 1000 + 2000
    });
  });
  
  describe('Partial Payment Tests', function() {
    it('Should handle partial payments when funds are insufficient', async function() {
      // Withdraw most funds from contract to simulate insufficient funds
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      const withdrawAmount = contractBalance.sub(ethers.utils.parseUnits('500', 6)); // Leave only 500 USDT
      await bettingPlatform.connect(owner).withdraw(await bettingPlatform.PLATFORM_WALLET(), withdrawAmount);
      
      // Settle User2's bet as won
      await bettingPlatform.connect(owner).settleBet(1, true);
      
      // Check bet status
      const bet = await bettingPlatform.getBet(1);
      expect(bet.status).to.equal(2); // PartiallyPaid
      expect(bet.won).to.be.true;
      expect(bet.paidAmount).to.equal(ethers.utils.parseUnits('500', 6)); // Only 500 USDT available
      expect(bet.remainingAmount).to.equal(ethers.utils.parseUnits('1500', 6)); // 2000 - 500
      expect(bet.paymentPercentage).to.equal(25); // 500/2000 = 25%
      
      // Check payment queue
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(1);
      expect(await bettingPlatform.getPaymentQueuePosition(1)).to.equal(0);
    });
    
    it('Should process payment queue when new funds are available', async function() {
      // Deposit more funds to contract
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('1000', 6));
      
      // Process payment queue
      await bettingPlatform.connect(owner).processPaymentQueue();
      
      // Check bet status
      const bet = await bettingPlatform.getBet(1);
      expect(bet.paidAmount).to.equal(ethers.utils.parseUnits('1500', 6)); // 500 + 1000
      expect(bet.remainingAmount).to.equal(ethers.utils.parseUnits('500', 6)); // 2000 - 1500
      expect(bet.paymentPercentage).to.equal(75); // 1500/2000 = 75%
      expect(bet.status).to.equal(2); // Still PartiallyPaid
      
      // Check payment queue
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(1); // Still in queue
    });
    
    it('Should complete payment when sufficient funds are available', async function() {
      // Deposit remaining funds to contract
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('500', 6));
      
      // Process payment queue
      await bettingPlatform.connect(owner).processPaymentQueue();
      
      // Check bet status
      const bet = await bettingPlatform.getBet(1);
      expect(bet.status).to.equal(3); // FullyPaid
      expect(bet.paidAmount).to.equal(POTENTIAL_WIN); // 2000 USDT
      expect(bet.remainingAmount).to.equal(0);
      expect(bet.paymentPercentage).to.equal(100);
      
      // Check payment queue
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(0); // Queue should be empty
      
      // Check user2's USDT balance
      const user2Balance = await usdtToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(ethers.utils.parseUnits('11000', 6)); // 10000 - 1000 + 2000
    });
  });
  
  describe('Multiple Bets and Queue Priority Tests', function() {
    it('Should handle multiple bets in payment queue with correct priority', async function() {
      // User3 places a bet
      await bettingPlatform.connect(user3).placeBet(BET_AMOUNT, EVENT_ID, OUTCOME_ID, POTENTIAL_WIN);
      
      // User1 places another bet
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, EVENT_ID, OUTCOME_ID, POTENTIAL_WIN);
      
      // Withdraw all funds from contract
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      const withdrawAmount = contractBalance.sub(ethers.utils.parseUnits('100', 6)); // Leave only 100 USDT
      await bettingPlatform.connect(owner).withdraw(await bettingPlatform.PLATFORM_WALLET(), withdrawAmount);
      
      // Settle both bets as won
      await bettingPlatform.connect(owner).settleBet(2, true); // User3's bet
      await bettingPlatform.connect(owner).settleBet(3, true); // User1's bet
      
      // Check payment queue
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(2);
      expect(await bettingPlatform.getPaymentQueuePosition(2)).to.equal(0); // User3's bet should be first
      expect(await bettingPlatform.getPaymentQueuePosition(3)).to.equal(1); // User1's bet should be second
      
      // Deposit more funds and process queue
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('1000', 6));
      await bettingPlatform.connect(owner).processPaymentQueue();
      
      // Check bet statuses
      const bet2 = await bettingPlatform.getBet(2);
      expect(bet2.status).to.equal(2); // PartiallyPaid
      expect(bet2.paidAmount).to.equal(ethers.utils.parseUnits('1000', 6)); // 100 + 900
      expect(bet2.paymentPercentage).to.equal(50); // 1000/2000 = 50%
      
      const bet3 = await bettingPlatform.getBet(3);
      expect(bet3.status).to.equal(2); // PartiallyPaid
      expect(bet3.paidAmount).to.equal(ethers.utils.parseUnits('100', 6)); // Only 100 USDT left
      expect(bet3.paymentPercentage).to.equal(5); // 100/2000 = 5%
      
      // Deposit more funds and complete payments
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('2900', 6));
      await bettingPlatform.connect(owner).processPaymentQueue();
      
      // Check final bet statuses
      const finalBet2 = await bettingPlatform.getBet(2);
      expect(finalBet2.status).to.equal(3); // FullyPaid
      expect(finalBet2.paymentPercentage).to.equal(100);
      
      const finalBet3 = await bettingPlatform.getBet(3);
      expect(finalBet3.status).to.equal(3); // FullyPaid
      expect(finalBet3.paymentPercentage).to.equal(100);
      
      // Check payment queue is empty
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(0);
    });
  });
  
  describe('Edge Cases and Security Tests', function() {
    it('Should handle zero balance correctly', async function() {
      // User1 places another bet
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, EVENT_ID, OUTCOME_ID, POTENTIAL_WIN);
      
      // Withdraw all funds from contract
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      await bettingPlatform.connect(owner).withdraw(await bettingPlatform.PLATFORM_WALLET(), contractBalance);
      
      // Settle bet as won with zero balance
      await bettingPlatform.connect(owner).settleBet(4, true);
      
      // Check bet status
      const bet = await bettingPlatform.getBet(4);
      expect(bet.status).to.equal(2); // PartiallyPaid
      expect(bet.paidAmount).to.equal(0);
      expect(bet.remainingAmount).to.equal(POTENTIAL_WIN);
      expect(bet.paymentPercentage).to.equal(0);
      
      // Check payment queue
      expect(await bettingPlatform.getPaymentQueueLength()).to.equal(1);
    });
    
    it('Should prevent unauthorized access to admin functions', async function() {
      // Try to process payment queue as non-owner
      await expect(
        bettingPlatform.connect(user1).processPaymentQueue()
      ).to.be.revertedWith('Ownable: caller is not the owner');
      
      // Try to withdraw fees as non-owner
      await expect(
        bettingPlatform.connect(user1).withdrawFees(ethers.utils.parseUnits('100', 6))
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
    
    it('Should handle contract balance protection correctly', async function() {
      // Deposit some funds
      await usdtToken.transfer(bettingPlatform.address, ethers.utils.parseUnits('1000', 6));
      
      // Try to withdraw more than available balance
      await expect(
        bettingPlatform.connect(owner).withdraw(
          await bettingPlatform.PLATFORM_WALLET(),
          ethers.utils.parseUnits('2000', 6)
        )
      ).to.be.revertedWith('Amount exceeds available balance after pending payments');
    });
  });
});
