// Configuration for deployment to testnet
module.exports = {
  // Network configuration
  network: {
    name: "sepolia",
    chainId: 11155111,
    url: "https://sepolia.infura.io/v3/${INFURA_API_KEY}"
  },
  
  // Gas configuration
  gas: {
    limit: 5000000,
    price: 20000000000 // 20 gwei
  },
  
  // Contract addresses
  contracts: {
    usdt: "${USDT_CONTRACT_ADDRESS}",
    oldBetting: "${OLD_BETTING_CONTRACT_ADDRESS}"
  },
  
  // Wallet addresses
  wallets: {
    platform: "0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3",
    adminFee: "0xE4A87598050D7877a79E2BEff12A25Be636c557e"
  },
  
  // Verification
  verification: {
    apiKey: "${ETHERSCAN_API_KEY}",
    waitConfirmations: 6
  },
  
  // Migration settings
  migration: {
    // Whether to migrate data from old contract
    enabled: true,
    // Maximum number of bets to migrate in one batch
    batchSize: 100
  }
};
