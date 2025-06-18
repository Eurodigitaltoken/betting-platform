// Deploy script for USDTBettingPlatformWithPartialPayouts contract
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Deploying USDTBettingPlatformWithPartialPayouts contract...");

  // Get the USDT contract address from environment variables
  const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
  
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT_CONTRACT_ADDRESS not set in environment variables");
  }
  
  console.log(`Using USDT contract address: ${USDT_CONTRACT_ADDRESS}`);
  
  // Get the contract factory
  const USDTBettingPlatformWithPartialPayouts = await ethers.getContractFactory("USDTBettingPlatformWithPartialPayouts");
  
  // Deploy the contract with the USDT contract address as constructor parameter
  const bettingPlatform = await USDTBettingPlatformWithPartialPayouts.deploy(USDT_CONTRACT_ADDRESS);
  
  // Wait for deployment to complete
  await bettingPlatform.deployed();
  
  console.log(`USDTBettingPlatformWithPartialPayouts deployed to: ${bettingPlatform.address}`);
  console.log(`Platform wallet address: ${process.env.PLATFORM_WALLET}`);
  console.log(`Admin fee wallet address: ${process.env.ADMIN_FEE_WALLET}`);
  
  // Verify contract on Etherscan (if on a public network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await bettingPlatform.deployTransaction.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: bettingPlatform.address,
      constructorArguments: [USDT_CONTRACT_ADDRESS],
    });
    console.log("Contract verified on Etherscan");
  }
  
  // Update the contract address in the .env file
  const fs = require('fs');
  const envFile = './.env';
  let envContent = fs.readFileSync(envFile, 'utf8');
  
  // Replace or add the contract address
  if (envContent.includes('BETTING_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(
      /BETTING_CONTRACT_ADDRESS=.*/,
      `BETTING_CONTRACT_ADDRESS=${bettingPlatform.address}`
    );
  } else {
    envContent += `\nBETTING_CONTRACT_ADDRESS=${bettingPlatform.address}\n`;
  }
  
  fs.writeFileSync(envFile, envContent);
  console.log(`Updated .env file with new contract address: ${bettingPlatform.address}`);
  
  return bettingPlatform.address;
}

main()
  .then((address) => {
    console.log(`Deployment successful! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
