// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🌾 Deploying CropToken contracts...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy CropTokenFactory
    console.log("\n📝 Deploying CropTokenFactory...");
    const CropTokenFactory = await ethers.getContractFactory("CropTokenFactory");
    const oracleAddress = deployer.address; // for testing
    const cropFactory = await CropTokenFactory.deploy(oracleAddress);
    await cropFactory.deployed();
    console.log("✅ CropTokenFactory deployed to:", cropFactory.address);

    // Deploy CropMarketplace
    console.log("\n🏪 Deploying CropMarketplace...");
    const CropMarketplace = await ethers.getContractFactory("CropMarketplace");
    const feeRecipient = deployer.address;
    const cropMarketplace = await CropMarketplace.deploy(cropFactory.address, feeRecipient);
    await cropMarketplace.deployed();
    console.log("✅ CropMarketplace deployed to:", cropMarketplace.address);

    // Deploy CropFinancing
    console.log("\n💰 Deploying CropFinancing...");
    const CropFinancing = await ethers.getContractFactory("CropFinancing");
    const cropFinancing = await CropFinancing.deploy(cropFactory.address);
    await cropFinancing.deployed();
    console.log("✅ CropFinancing deployed to:", cropFinancing.address);

    // Deploy PriceOracle
    console.log("\n🔎 Deploying PriceOracle...");
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();
    await priceOracle.deployed();
    console.log("✅ PriceOracle deployed to:", priceOracle.address);

    const deployed = {
        CropTokenFactory: cropFactory.address,
        CropMarketplace: cropMarketplace.address,
        CropFinancing: cropFinancing.address,
        PriceOracle: priceOracle.address
    };

    fs.writeFileSync(path.join(__dirname, "..", "deployed.json"), JSON.stringify(deployed, null, 2));
    console.log("\n📄 Addresses written to deployed.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
