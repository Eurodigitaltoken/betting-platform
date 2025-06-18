// Test script for testing the updated 5% fee in the betting platform

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('USDTBettingPlatform Fee Tests', function () {
  let bettingPlatform;
  let usdtToken;
  let owner;
  let user1;
  let user2;
  let adminFeeWallet;
  
  const USDT_DECIMALS = 6;
  const FEE_PERCENTAGE = 5; // Updated fee percentage
  const MAX_BET_AMOUNT = ethers.utils.parseUnits('9999', USDT_DECIMALS);
  
  beforeEach(async function () {
    // Deploy mock USDT token
    const USDTToken = await ethers.getContractFactory('MockUSDT');
    usdtToken = await USDTToken.deploy();
    await usdtToken.deployed();
    
    // Get signers
    [owner, user1, user2, adminFeeWallet] = await ethers.getSigners();
    
    // Deploy betting platform
    const BettingPlatform = await ethers.getContractFactory('USDTBettingPlatform');
    bettingPlatform = await BettingPlatform.deploy(usdtToken.address);
    await bettingPlatform.deployed();
    
    // Mint USDT to users for testing
    await usdtToken.mint(user1.address, ethers.utils.parseUnits('10000', USDT_DECIMALS));
    await usdtToken.mint(user2.address, ethers.utils.parseUnits('10000', USDT_DECIMALS));
    
    // Approve betting platform to spend USDT
    await usdtToken.connect(user1).approve(bettingPlatform.address, ethers.utils.parseUnits('10000', USDT_DECIMALS));
    await usdtToken.connect(user2).approve(bettingPlatform.address, ethers.utils.parseUnits('10000', USDT_DECIMALS));
  });
  
  it('Should correctly calculate and deduct 5% fee on bet placement', async function () {
    const betAmount = ethers.utils.parseUnits('100', USDT_DECIMALS);
    const expectedFee = betAmount.mul(FEE_PERCENTAGE).div(100);
    
    // Get initial balances
    const initialContractBalance = await usdtToken.balanceOf(bettingPlatform.address);
    const initialUserBalance = await usdtToken.balanceOf(user1.address);
    
    // Place bet
    await bettingPlatform.connect(user1).placeBet(
      betAmount,
      'event123',
      'outcome1',
      ethers.utils.parseUnits('200', USDT_DECIMALS) // potential win
    );
    
    // Check balances after bet
    const finalContractBalance = await usdtToken.balanceOf(bettingPlatform.address);
    const finalUserBalance = await usdtToken.balanceOf(user1.address);
    
    // Contract should receive bet amount
    expect(finalContractBalance.sub(initialContractBalance)).to.equal(betAmount);
    
    // User should lose bet amount
    expect(initialUserBalance.sub(finalUserBalance)).to.equal(betAmount);
    
    // Check fee accumulation
    const accumulatedFees = await bettingPlatform.accumulatedFees();
    expect(accumulatedFees).to.equal(expectedFee);
  });
  
  it('Should enforce maximum bet amount of 9999 USDT', async function () {
    const betAmount = ethers.utils.parseUnits('10000', USDT_DECIMALS); // Exceeds max
    
    // Attempt to place bet with amount exceeding maximum
    await expect(
      bettingPlatform.connect(user1).placeBet(
        betAmount,
        'event123',
        'outcome1',
        ethers.utils.parseUnits('20000', USDT_DECIMALS)
      )
    ).to.be.revertedWith('Bet amount exceeds maximum');
  });
  
  it('Should allow admin to withdraw accumulated fees', async function () {
    // Place a bet to accumulate fees
    const betAmount = ethers.utils.parseUnits('1000', USDT_DECIMALS);
    const expectedFee = betAmount.mul(FEE_PERCENTAGE).div(100);
    
    await bettingPlatform.connect(user1).placeBet(
      betAmount,
      'event123',
      'outcome1',
      ethers.utils.parseUnits('2000', USDT_DECIMALS)
    );
    
    // Get initial balances
    const initialAdminBalance = await usdtToken.balanceOf(adminFeeWallet.address);
    
    // Withdraw fees
    await bettingPlatform.connect(owner).withdrawFees(adminFeeWallet.address, expectedFee);
    
    // Check balances after withdrawal
    const finalAdminBalance = await usdtToken.balanceOf(adminFeeWallet.address);
    
    // Admin should receive fees
    expect(finalAdminBalance.sub(initialAdminBalance)).to.equal(expectedFee);
    
    // Accumulated fees should be reduced
    const remainingFees = await bettingPlatform.accumulatedFees();
    expect(remainingFees).to.equal(0);
  });
  
  it('Should correctly handle multiple bets and fee calculations', async function () {
    // Place multiple bets
    const betAmount1 = ethers.utils.parseUnits('100', USDT_DECIMALS);
    const betAmount2 = ethers.utils.parseUnits('200', USDT_DECIMALS);
    const betAmount3 = ethers.utils.parseUnits('300', USDT_DECIMALS);
    
    const expectedFee1 = betAmount1.mul(FEE_PERCENTAGE).div(100);
    const expectedFee2 = betAmount2.mul(FEE_PERCENTAGE).div(100);
    const expectedFee3 = betAmount3.mul(FEE_PERCENTAGE).div(100);
    const totalExpectedFee = expectedFee1.add(expectedFee2).add(expectedFee3);
    
    // Place bets
    await bettingPlatform.connect(user1).placeBet(
      betAmount1,
      'event1',
      'outcome1',
      ethers.utils.parseUnits('200', USDT_DECIMALS)
    );
    
    await bettingPlatform.connect(user1).placeBet(
      betAmount2,
      'event2',
      'outcome2',
      ethers.utils.parseUnits('400', USDT_DECIMALS)
    );
    
    await bettingPlatform.connect(user2).placeBet(
      betAmount3,
      'event3',
      'outcome3',
      ethers.utils.parseUnits('600', USDT_DECIMALS)
    );
    
    // Check accumulated fees
    const accumulatedFees = await bettingPlatform.accumulatedFees();
    expect(accumulatedFees).to.equal(totalExpectedFee);
  });
});
