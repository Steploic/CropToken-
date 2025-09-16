require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "hedera-testnet": {
      url: "https://testnet.hashio.io/api",
      accounts: [HEDERA_PRIVATE_KEY],
      chainId: 296,
      gas: 3000000,
      gasPrice: 100000000000 // 100 gwei
    },
    "hedera-mainnet": {
      url: "https://mainnet.hashio.io/api", 
      accounts: [HEDERA_PRIVATE_KEY],
      chainId: 295,
      gas: 3000000,
      gasPrice: 100000000000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
