// Deploy script for USDTBettingPlatform contract
const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Deploying USDTBettingPlatform contract...");

  // Get the USDT contract address from environment variables
  const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
  
  if (!USDT_CONTRACT_ADDRESS) {
    throw new Error("USDT_CONTRACT_ADDRESS not set in environment variables");
  }
  
  console.log(`Using USDT contract address: ${USDT_CONTRACT_ADDRESS}`);
  
  // Get the contract factory
  const USDTBettingPlatform = await ethers.getContractFactory("USDTBettingPlatform");
  
  // Deploy the contract with the USDT contract address as constructor parameter
  const bettingPlatform = await USDTBettingPlatform.deploy(USDT_CONTRACT_ADDRESS);
  
  // Wait for deployment to complete
  await bettingPlatform.deployed();
  
  console.log(`USDTBettingPlatform deployed to: ${bettingPlatform.address}`);
  console.log(`Platform wallet address: 0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3`);
  console.log(`Admin fee wallet address: 0xE4A87598050D7877a79E2BEff12A25Be636c557e`);
  
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
