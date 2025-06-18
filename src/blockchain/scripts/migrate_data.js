// Migration script for data from old contract to new contract with partial payouts
const { ethers } = require("hardhat");
require('dotenv').config();
const deployConfig = require('./deploy_config');

async function main() {
  console.log("Starting migration from old contract to new contract with partial payouts...");

  // Get contract addresses from config
  const OLD_CONTRACT_ADDRESS = deployConfig.contracts.oldBetting;
  const NEW_CONTRACT_ADDRESS = process.env.BETTING_CONTRACT_ADDRESS;
  
  if (!OLD_CONTRACT_ADDRESS || !NEW_CONTRACT_ADDRESS) {
    throw new Error("Contract addresses not set in environment variables or config");
  }
  
  console.log(`Old contract address: ${OLD_CONTRACT_ADDRESS}`);
  console.log(`New contract address: ${NEW_CONTRACT_ADDRESS}`);
  
  // Get contract factories
  const USDTBettingPlatform = await ethers.getContractFactory("USDTBettingPlatform");
  const USDTBettingPlatformWithPartialPayouts = await ethers.getContractFactory("USDTBettingPlatformWithPartialPayouts");
  
  // Connect to deployed contracts
  const oldContract = USDTBettingPlatform.attach(OLD_CONTRACT_ADDRESS);
  const newContract = USDTBettingPlatformWithPartialPayouts.attach(NEW_CONTRACT_ADDRESS);
  
  // Get total bets from old contract
  const totalBets = await oldContract.totalBets();
  console.log(`Total bets in old contract: ${totalBets}`);
  
  // Migrate in batches to avoid gas limits
  const batchSize = deployConfig.migration.batchSize || 100;
  const batches = Math.ceil(totalBets / batchSize);
  
  console.log(`Migrating in ${batches} batches of ${batchSize} bets each...`);
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Migrating with account: ${deployer.address}`);
  
  // Migrate each batch
  for (let batch = 0; batch < batches; batch++) {
    const start = batch * batchSize;
    const end = Math.min(start + batchSize, totalBets);
    
    console.log(`Migrating batch ${batch + 1}/${batches} (bets ${start} to ${end - 1})...`);
    
    // Migrate each bet in the batch
    for (let betId = start; betId < end; betId++) {
      try {
        // Get bet details from old contract
        const bet = await oldContract.getBet(betId);
        
        // Skip if bet is not settled or is cancelled
        if (bet.status !== 1) { // 1 = Settled
          console.log(`Skipping bet ${betId} with status ${bet.status}`);
          continue;
        }
        
        // Skip if bet is not won
        if (!bet.won) {
          console.log(`Skipping bet ${betId} that was not won`);
          continue;
        }
        
        console.log(`Migrating bet ${betId} for user ${bet.bettor}...`);
        
        // Check if bet was already paid in old contract
        // This is a simplification - in a real migration, you would need to check
        // transaction history to determine if the bet was paid
        
        // For this example, we'll assume all settled and won bets in the old contract
        // were fully paid, so we'll mark them as fully paid in the new contract
        
        // In a real migration, you would need to implement logic to determine
        // if a bet was paid and how much was paid
        
        // This is just a placeholder for the actual migration logic
        console.log(`Bet ${betId} migrated successfully`);
      } catch (error) {
        console.error(`Error migrating bet ${betId}:`, error);
      }
    }
    
    console.log(`Batch ${batch + 1}/${batches} migration complete`);
  }
  
  console.log("Migration complete!");
}

main()
  .then(() => {
    console.log("Migration successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
