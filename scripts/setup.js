// scripts/setup.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const deployedPath = path.join(__dirname, "..", "deployed.json");
    if (!fs.existsSync(deployedPath)) {
        console.error("deployed.json not found. Run deploy first.");
        process.exit(1);
    }
    const deployed = JSON.parse(fs.readFileSync(deployedPath));

    const [deployer] = await ethers.getSigners();
    console.log("Setting up with:", deployer.address);

    const cropFactory = await ethers.getContractAt("CropTokenFactory", deployed.CropTokenFactory);
    const marketplace = await ethers.getContractAt("CropMarketplace", deployed.CropMarketplace);
    const financing = await ethers.getContractAt("CropFinancing", deployed.CropFinancing);

    // Example: set platform fees and feeRecipient if needed
    try {
        console.log("Setting marketplace fee recipient to deployer...");
        await (await marketplace.setFeeRecipient(deployer.address)).wait();
        console.log("Done.");
    } catch (e) {
        console.warn("Could not set fee recipient (maybe not needed):", e.message);
    }

    // Example: set oracle address on factory to deployer (for testing)
    try {
        console.log("Setting oracle address on factory to deployer...");
        await (await cropFactory.setOracleAddress(deployer.address)).wait();
        console.log("Done.");
    } catch (e) {
        console.warn("Could not set oracle address:", e.message);
    }

    console.log("Setup complete.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
