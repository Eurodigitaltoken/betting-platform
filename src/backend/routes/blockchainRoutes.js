const express = require('express');
const router = express.Router();
const config = require('../config');

// Mock blockchain data
const blockchainInfo = {
  contractAddress: config.contractAddress,
  adminFeeAddress: config.adminFeeAddress,
  network: 'Sepolia Testnet',
  chainId: 11155111,
  blockNumber: 4500000,
  gasPrice: '20000000000', // 20 gwei
  balance: '1000000000000000000000' // 1000 USDT
};

// Get blockchain info
router.get('/info', (req, res) => {
  try {
    res.json({
      success: true,
      blockchain: blockchainInfo
    });
  } catch (error) {
    console.error('Error fetching blockchain info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contract balance
router.get('/balance', (req, res) => {
  try {
    res.json({
      success: true,
      balance: blockchainInfo.balance,
      formattedBalance: (parseInt(blockchainInfo.balance) / 1e18).toFixed(2) + ' USDT'
    });
  } catch (error) {
    console.error('Error fetching contract balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction status
router.get('/transaction/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    
    // Mock transaction data
    const transaction = {
      hash,
      status: 'confirmed',
      blockNumber: blockchainInfo.blockNumber,
      gasUsed: '21000',
      gasPrice: blockchainInfo.gasPrice,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Estimate gas for transaction
router.post('/estimate-gas', (req, res) => {
  try {
    const { method, params } = req.body;
    
    // Mock gas estimation based on method
    let gasEstimate;
    switch (method) {
      case 'placeBet':
        gasEstimate = '150000';
        break;
      case 'claimWinnings':
        gasEstimate = '100000';
        break;
      case 'deposit':
        gasEstimate = '80000';
        break;
      default:
        gasEstimate = '21000';
    }
    
    res.json({
      success: true,
      gasEstimate,
      gasPriceWei: blockchainInfo.gasPrice,
      estimatedCostWei: (parseInt(gasEstimate) * parseInt(blockchainInfo.gasPrice)).toString(),
      estimatedCostEth: ((parseInt(gasEstimate) * parseInt(blockchainInfo.gasPrice)) / 1e18).toFixed(6)
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

