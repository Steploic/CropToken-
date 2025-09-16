const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🌾 Deploying CropToken contracts to Hedera...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Deploy CropTokenFactory
    console.log("\n📝 Deploying CropTokenFactory...");
    const CropTokenFactory = await ethers.getContractFactory("CropTokenFactory");
    const oracleAddress = deployer.address; // For testing, use deployer as oracle
    const cropFactory = await CropTokenFactory.deploy(oracleAddress);
    await cropFactory.deployed();
    
    console.log("✅ CropTokenFactory deployed to:", cropFactory.address);
    
    // Deploy CropMarketplace
    console.log("\n🏪 Deploying CropMarketplace...");
