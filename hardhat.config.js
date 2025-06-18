require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/${INFURA_API_KEY}",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    }
  },
  paths: {
    sources: "./src/blockchain/contracts",
    tests: "./src/blockchain/test",
    cache: "./src/blockchain/cache",
    artifacts: "./src/blockchain/artifacts"
  }
};
