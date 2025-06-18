const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Web3 with Ethereum provider
const web3 = new Web3(process.env.ETHEREUM_PROVIDER || 'http://localhost:8545');

// Load contract ABI and bytecode
const contractPath = path.resolve(__dirname, '../contracts/USDTBettingPlatform.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');

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
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// Load betting contract ABI
const bettingAbi = require('./USDTBettingPlatform.json').abi;

// Contract addresses
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const BETTING_CONTRACT_ADDRESS = process.env.BETTING_CONTRACT_ADDRESS;

// Initialize contracts
const usdtContract = new web3.eth.Contract(usdtAbi, USDT_CONTRACT_ADDRESS);
const bettingContract = new web3.eth.Contract(bettingAbi, BETTING_CONTRACT_ADDRESS);

// Get account balance
const getBalance = async (address) => {
  try {
    const balance = await usdtContract.methods.balanceOf(address).call();
    return balance;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

// Approve USDT spending
const approveUSDT = async (spenderAddress, amount, fromAddress, privateKey) => {
  try {
    const data = usdtContract.methods.approve(spenderAddress, amount).encodeABI();
    
    const tx = {
      from: fromAddress,
      to: USDT_CONTRACT_ADDRESS,
      gas: 200000,
      data
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error approving USDT:', error);
    throw error;
  }
};

// Place a bet
const placeBet = async (amount, eventId, outcomeId, potentialWin, fromAddress, privateKey) => {
  try {
    const data = bettingContract.methods.placeBet(amount, eventId, outcomeId, potentialWin).encodeABI();
    
    const tx = {
      from: fromAddress,
      to: BETTING_CONTRACT_ADDRESS,
      gas: 300000,
      data
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

// Settle a bet (admin only)
const settleBet = async (betId, won, adminAddress, privateKey) => {
  try {
    const data = bettingContract.methods.settleBet(betId, won).encodeABI();
    
    const tx = {
      from: adminAddress,
      to: BETTING_CONTRACT_ADDRESS,
      gas: 300000,
      data
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error settling bet:', error);
    throw error;
  }
};

// Cancel a bet (admin only)
const cancelBet = async (betId, adminAddress, privateKey) => {
  try {
    const data = bettingContract.methods.cancelBet(betId).encodeABI();
    
    const tx = {
      from: adminAddress,
      to: BETTING_CONTRACT_ADDRESS,
      gas: 300000,
      data
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error cancelling bet:', error);
    throw error;
  }
};

// Get user bets
const getUserBets = async (userAddress) => {
  try {
    const betIds = await bettingContract.methods.getUserBets(userAddress).call();
    
    const bets = [];
    for (const betId of betIds) {
      const bet = await bettingContract.methods.getBet(betId).call();
      bets.push({
        id: bet.id,
        bettor: bet.bettor,
        amount: bet.amount,
        potentialWin: bet.potentialWin,
        fee: bet.fee,
        eventId: bet.eventId,
        outcomeId: bet.outcomeId,
        status: bet.status,
        won: bet.won,
        createdAt: new Date(bet.createdAt * 1000).toISOString(),
        settledAt: bet.settledAt > 0 ? new Date(bet.settledAt * 1000).toISOString() : null
      });
    }
    
    return bets;
  } catch (error) {
    console.error('Error getting user bets:', error);
    throw error;
  }
};

// Withdraw fees (admin only)
const withdrawFees = async (amount, adminAddress, privateKey) => {
  try {
    const data = bettingContract.methods.withdrawFees(amount).encodeABI();
    
    const tx = {
      from: adminAddress,
      to: BETTING_CONTRACT_ADDRESS,
      gas: 300000,
      data
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error withdrawing fees:', error);
    throw error;
  }
};

// Create a new Ethereum account
const createAccount = () => {
  try {
    const account = web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

// Get contract balance
const getContractBalance = async () => {
  try {
    const balance = await bettingContract.methods.getContractBalance().call();
    return balance;
  } catch (error) {
    console.error('Error getting contract balance:', error);
    throw error;
  }
};

module.exports = {
  web3,
  usdtContract,
  bettingContract,
  getBalance,
  approveUSDT,
  placeBet,
  settleBet,
  cancelBet,
  getUserBets,
  withdrawFees,
  createAccount,
  getContractBalance
};
