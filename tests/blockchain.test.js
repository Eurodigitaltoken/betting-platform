// Test script for blockchain integration
const { ethers } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

describe("USDTBettingPlatform Contract", function () {
  let USDTBettingPlatform;
  let bettingPlatform;
  let usdtToken;
  let owner;
  let user1;
  let user2;
  
  // Platform and Admin wallet addresses
  const PLATFORM_WALLET = "0x5ba1BeDbaa122eCCEece1F221d8501DaBfF74113";
  const ADMIN_FEE_WALLET = "0x071437DdE24411BC1E31dD102a7FBA39DF493E3B";
  
  // Test constants
  const USDT_DECIMALS = 6;
  const INITIAL_USDT_SUPPLY = ethers.utils.parseUnits("1000000", USDT_DECIMALS);
  const USER_INITIAL_BALANCE = ethers.utils.parseUnits("10000", USDT_DECIMALS);
  const BET_AMOUNT = ethers.utils.parseUnits("100", USDT_DECIMALS);
  const MAX_BET_AMOUNT = ethers.utils.parseUnits("9999", USDT_DECIMALS);
  const OVER_MAX_BET_AMOUNT = ethers.utils.parseUnits("10000", USDT_DECIMALS);
  const FEE_PERCENTAGE = 2;
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy mock USDT token
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    usdtToken = await MockUSDT.deploy(INITIAL_USDT_SUPPLY);
    await usdtToken.deployed();
    
    // Transfer USDT to users
    await usdtToken.transfer(user1.address, USER_INITIAL_BALANCE);
    await usdtToken.transfer(user2.address, USER_INITIAL_BALANCE);
    
    // Deploy betting platform contract
    USDTBettingPlatform = await ethers.getContractFactory("USDTBettingPlatform");
    bettingPlatform = await USDTBettingPlatform.deploy(usdtToken.address);
    await bettingPlatform.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bettingPlatform.owner()).to.equal(owner.address);
    });
    
    it("Should set the right USDT token", async function () {
      expect(await bettingPlatform.usdtToken()).to.equal(usdtToken.address);
    });
    
    it("Should set the right platform wallet", async function () {
      expect(await bettingPlatform.PLATFORM_WALLET()).to.equal(PLATFORM_WALLET);
    });
    
    it("Should set the right admin fee wallet", async function () {
      expect(await bettingPlatform.ADMIN_FEE_WALLET()).to.equal(ADMIN_FEE_WALLET);
    });
  });
  
  describe("Betting", function () {
    beforeEach(async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, BET_AMOUNT);
    });
    
    it("Should place a bet successfully", async function () {
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("250", USDT_DECIMALS); // 2.5x the bet amount
      
      // Place bet
      await expect(
        bettingPlatform.connect(user1).placeBet(BET_AMOUNT, eventId, outcomeId, potentialWin)
      )
        .to.emit(bettingPlatform, "BetPlaced")
        .withArgs(0, user1.address, BET_AMOUNT, eventId, outcomeId, potentialWin);
      
      // Check bet details
      const bet = await bettingPlatform.getBet(0);
      expect(bet.bettor).to.equal(user1.address);
      expect(bet.amount).to.equal(BET_AMOUNT);
      expect(bet.potentialWin).to.equal(potentialWin);
      expect(bet.eventId).to.equal(eventId);
      expect(bet.outcomeId).to.equal(outcomeId);
      expect(bet.status).to.equal(0); // Pending
      
      // Check fee calculation
      const fee = BET_AMOUNT.mul(FEE_PERCENTAGE).div(100);
      expect(bet.fee).to.equal(fee);
      
      // Check user's bets
      const userBets = await bettingPlatform.getUserBets(user1.address);
      expect(userBets.length).to.equal(1);
      expect(userBets[0]).to.equal(0);
      
      // Check contract balance
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      expect(contractBalance).to.equal(BET_AMOUNT);
      
      // Check total fees
      expect(await bettingPlatform.totalFees()).to.equal(fee);
    });
    
    it("Should not allow bets exceeding maximum amount", async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, OVER_MAX_BET_AMOUNT);
      
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("25000", USDT_DECIMALS);
      
      // Try to place bet with amount exceeding maximum
      await expect(
        bettingPlatform.connect(user1).placeBet(OVER_MAX_BET_AMOUNT, eventId, outcomeId, potentialWin)
      ).to.be.revertedWith("Bet amount exceeds maximum limit");
    });
  });
  
  describe("Settling Bets", function () {
    beforeEach(async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, BET_AMOUNT);
      
      // Place bet
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("250", USDT_DECIMALS);
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, eventId, outcomeId, potentialWin);
    });
    
    it("Should settle a winning bet correctly", async function () {
      const betId = 0;
      const won = true;
      
      // Get bet details
      const bet = await bettingPlatform.getBet(betId);
      
      // Settle bet as won
      await expect(
        bettingPlatform.connect(owner).settleBet(betId, won)
      )
        .to.emit(bettingPlatform, "BetSettled")
        .withArgs(betId, user1.address, won, bet.potentialWin);
      
      // Check bet status
      const settledBet = await bettingPlatform.getBet(betId);
      expect(settledBet.status).to.equal(1); // Settled
      expect(settledBet.won).to.equal(true);
      
      // Check user balance (should have received winnings)
      const userBalance = await usdtToken.balanceOf(user1.address);
      expect(userBalance).to.equal(USER_INITIAL_BALANCE.sub(BET_AMOUNT).add(bet.potentialWin));
    });
    
    it("Should settle a losing bet correctly", async function () {
      const betId = 0;
      const won = false;
      
      // Settle bet as lost
      await expect(
        bettingPlatform.connect(owner).settleBet(betId, won)
      )
        .to.emit(bettingPlatform, "BetSettled")
        .withArgs(betId, user1.address, won, 0);
      
      // Check bet status
      const settledBet = await bettingPlatform.getBet(betId);
      expect(settledBet.status).to.equal(1); // Settled
      expect(settledBet.won).to.equal(false);
      
      // Check user balance (should not have received anything)
      const userBalance = await usdtToken.balanceOf(user1.address);
      expect(userBalance).to.equal(USER_INITIAL_BALANCE.sub(BET_AMOUNT));
    });
    
    it("Should only allow owner to settle bets", async function () {
      const betId = 0;
      const won = true;
      
      // Try to settle bet as non-owner
      await expect(
        bettingPlatform.connect(user2).settleBet(betId, won)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Cancelling Bets", function () {
    beforeEach(async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, BET_AMOUNT);
      
      // Place bet
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("250", USDT_DECIMALS);
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, eventId, outcomeId, potentialWin);
    });
    
    it("Should cancel a bet correctly", async function () {
      const betId = 0;
      
      // Get bet details
      const bet = await bettingPlatform.getBet(betId);
      const refundAmount = bet.amount.add(bet.fee);
      
      // Cancel bet
      await expect(
        bettingPlatform.connect(owner).cancelBet(betId)
      )
        .to.emit(bettingPlatform, "BetCancelled")
        .withArgs(betId, user1.address, refundAmount);
      
      // Check bet status
      const cancelledBet = await bettingPlatform.getBet(betId);
      expect(cancelledBet.status).to.equal(2); // Cancelled
      
      // Check user balance (should have received refund including fee)
      const userBalance = await usdtToken.balanceOf(user1.address);
      expect(userBalance).to.equal(USER_INITIAL_BALANCE);
      
      // Check total fees (should be reduced)
      expect(await bettingPlatform.totalFees()).to.equal(0);
    });
    
    it("Should only allow owner to cancel bets", async function () {
      const betId = 0;
      
      // Try to cancel bet as non-owner
      await expect(
        bettingPlatform.connect(user2).cancelBet(betId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Fee Management", function () {
    beforeEach(async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, BET_AMOUNT.mul(5));
      
      // Place multiple bets to accumulate fees
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("250", USDT_DECIMALS);
      
      for (let i = 0; i < 5; i++) {
        await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, eventId, outcomeId, potentialWin);
      }
    });
    
    it("Should withdraw fees to admin fee wallet", async function () {
      // Calculate total fees
      const totalFees = await bettingPlatform.totalFees();
      expect(totalFees).to.be.gt(0);
      
      // Get initial admin wallet balance
      const initialAdminBalance = await usdtToken.balanceOf(ADMIN_FEE_WALLET);
      
      // Withdraw fees
      await expect(
        bettingPlatform.connect(owner).withdrawFees(totalFees)
      )
        .to.emit(bettingPlatform, "FeesWithdrawn")
        .withArgs(ADMIN_FEE_WALLET, totalFees);
      
      // Check admin wallet balance
      const finalAdminBalance = await usdtToken.balanceOf(ADMIN_FEE_WALLET);
      expect(finalAdminBalance).to.equal(initialAdminBalance.add(totalFees));
      
      // Check total fees (should be 0 after withdrawal)
      expect(await bettingPlatform.totalFees()).to.equal(0);
    });
    
    it("Should not allow withdrawing more than available fees", async function () {
      const totalFees = await bettingPlatform.totalFees();
      const excessAmount = totalFees.add(1);
      
      // Try to withdraw more than available
      await expect(
        bettingPlatform.connect(owner).withdrawFees(excessAmount)
      ).to.be.revertedWith("Amount exceeds available fees");
    });
    
    it("Should only allow owner to withdraw fees", async function () {
      const totalFees = await bettingPlatform.totalFees();
      
      // Try to withdraw fees as non-owner
      await expect(
        bettingPlatform.connect(user2).withdrawFees(totalFees)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Withdrawal", function () {
    beforeEach(async function () {
      // Approve betting platform to spend user's USDT
      await usdtToken.connect(user1).approve(bettingPlatform.address, BET_AMOUNT);
      
      // Place bet
      const eventId = "event_123";
      const outcomeId = "home_win";
      const potentialWin = ethers.utils.parseUnits("250", USDT_DECIMALS);
      await bettingPlatform.connect(user1).placeBet(BET_AMOUNT, eventId, outcomeId, potentialWin);
      
      // Settle bet as lost to keep funds in contract
      await bettingPlatform.connect(owner).settleBet(0, false);
    });
    
    it("Should withdraw funds to platform wallet", async function () {
      // Calculate available balance (excluding fees)
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      const totalFees = await bettingPlatform.totalFees();
      const availableBalance = contractBalance.sub(totalFees);
      
      // Get initial platform wallet balance
      const initialPlatformBalance = await usdtToken.balanceOf(PLATFORM_WALLET);
      
      // Withdraw funds
      await expect(
        bettingPlatform.connect(owner).withdraw(PLATFORM_WALLET, availableBalance)
      )
        .to.emit(bettingPlatform, "Withdrawal")
        .withArgs(PLATFORM_WALLET, availableBalance);
      
      // Check platform wallet balance
      const finalPlatformBalance = await usdtToken.balanceOf(PLATFORM_WALLET);
      expect(finalPlatformBalance).to.equal(initialPlatformBalance.add(availableBalance));
      
      // Check contract balance (should only have fees left)
      const finalContractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      expect(finalContractBalance).to.equal(totalFees);
    });
    
    it("Should not allow withdrawing to addresses other than platform wallet", async function () {
      const availableBalance = BET_AMOUNT.div(2);
      
      // Try to withdraw to a different address
      await expect(
        bettingPlatform.connect(owner).withdraw(user2.address, availableBalance)
      ).to.be.revertedWith("Can only withdraw to platform wallet");
    });
    
    it("Should not allow withdrawing more than available balance", async function () {
      const contractBalance = await usdtToken.balanceOf(bettingPlatform.address);
      const totalFees = await bettingPlatform.totalFees();
      const availableBalance = contractBalance.sub(totalFees);
      const excessAmount = availableBalance.add(1);
      
      // Try to withdraw more than available
      await expect(
        bettingPlatform.connect(owner).withdraw(PLATFORM_WALLET, excessAmount)
      ).to.be.revertedWith("Amount exceeds available balance");
    });
    
    it("Should only allow owner to withdraw funds", async function () {
      const availableBalance = BET_AMOUNT.div(2);
      
      // Try to withdraw as non-owner
      await expect(
        bettingPlatform.connect(user2).withdraw(PLATFORM_WALLET, availableBalance)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
