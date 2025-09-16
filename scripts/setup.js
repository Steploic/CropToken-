const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

async function main() {
    console.log("⚙️ Setting up CropToken environment...");

    // Ensure contracts.js exists for frontend
    const frontendConfigFile = './frontend/src/contracts.js';
    if (!fs.existsSync(frontendConfigFile)) {
        console.error("Error: contracts.js not found. Please run 'npx hardhat run scripts/deploy.js' first.");
        process.exit(1);
    }

    const { 
        CROP_TOKEN_FACTORY_ADDRESS,
        CROP_MARKETPLACE_ADDRESS,
        CROP_FINANCING_ADDRESS,
        ORACLE_ADDRESS,
        FEE_RECIPIENT_ADDRESS
    } = require('../frontend/src/contracts');

    console.log("Using deployed contracts:");
    console.log("  CropTokenFactory:", CROP_TOKEN_FACTORY_ADDRESS);
    console.log("  CropMarketplace:", CROP_MARKETPLACE_ADDRESS);
    console.log("  CropFinancing:", CROP_FINANCING_ADDRESS);
    console.log("  Oracle Address:", ORACLE_ADDRESS);
    console.log("  Fee Recipient:", FEE_RECIPIENT_ADDRESS);

    const [deployer, farmer1, farmer2, buyer1, investor1] = await ethers.getSigners();

    const cropFactory = await ethers.getContractAt("CropTokenFactory", CROP_TOKEN_FACTORY_ADDRESS);
    const marketplace = await ethers.getContractAt("CropMarketplace", CROP_MARKETPLACE_ADDRESS);
    const financing = await ethers.getContractAt("CropFinancing", CROP_FINANCING_ADDRESS);

    // --- 1. Tokenize some crops ---
    console.log("\n🌱 Tokenizing sample crops...");
    
    // Farmer 1 tokenizes Maize
    console.log("  Farmer 1 tokenizing Maize...");
    let tx = await cropFactory.connect(farmer1).tokenizeCrop(
        "Maize",
        2000, // 2000 kg
        Math.floor(Date.now() / 1000) + 86400 * 90, // 90 days from now
        "4.0511,9.7679", // Douala
        "QmMaizeMetadata",
        ethers.utils.parseEther("0.05") // 0.05 HBAR/kg
    );
    let receipt = await tx.wait();
    const cropId1 = receipt.events?.find(e => e.event === 'CropTokenized')?.args?.cropId;
    console.log(`  Maize Crop #${cropId1} tokenized by Farmer 1.`);

    // Farmer 2 tokenizes Cocoa
    console.log("  Farmer 2 tokenizing Cocoa...");
    tx = await cropFactory.connect(farmer2).tokenizeCrop(
        "Cocoa",
        1500, // 1500 kg
        Math.floor(Date.now() / 1000) + 86400 * 180, // 180 days from now
        "6.1319,1.2228", // Yaoundé
        "QmCocoaMetadata",
        ethers.utils.parseEther("0.8") // 0.8 HBAR/kg
    );
    receipt = await tx.wait();
    const cropId2 = receipt.events?.find(e => e.event === 'CropTokenized')?.args?.cropId;
    console.log(`  Cocoa Crop #${cropId2} tokenized by Farmer 2.`);

    // --- 2. Oracle Verification ---
    console.log("\n✨ Verifying crops with Oracle...");

    console.log(`  Verifying Maize Crop #${cropId1}...`);
    await cropFactory.connect(deployer).verifyCrop(cropId1, true); // Deployer acts as Oracle
    console.log(`  Maize Crop #${cropId1} verified.`);

    console.log(`  Verifying Cocoa Crop #${cropId2}...`);
    await cropFactory.connect(deployer).verifyCrop(cropId2, true);
    console.log(`  Cocoa Crop #${cropId2} verified.`);

    // --- 3. Create Marketplace Listings ---
    console.log("\n🛒 Creating marketplace listings...");

    const crop1Data = await cropFactory.crops(cropId1);
    const cropToken1 = await ethers.getContractAt("IERC20", crop1Data.tokenAddress);

    // Farmer 1 lists Maize
    console.log(`  Farmer 1 listing Maize Crop #${cropId1} on marketplace...`);
    // Farmer 1 must approve marketplace to transfer tokens
    await cropToken1.connect(farmer1).approve(marketplace.address, crop1Data.expectedYield);
    tx = await marketplace.connect(farmer1).createListing(
        cropId1,
        ethers.utils.parseEther("0.06"), // Selling at 0.06 HBAR/kg
        1000 // Sell 1000 kg
    );
    receipt = await tx.wait();
    const listingId1 = receipt.events?.find(e => e.event === 'ListingCreated')?.args?.listingId;
    console.log(`  Maize Listing #${listingId1} created.`);

    const crop2Data = await cropFactory.crops(cropId2);
    const cropToken2 = await ethers.getContractAt("IERC20", crop2Data.tokenAddress);

    // Farmer 2 lists Cocoa
    console.log(`  Farmer 2 listing Cocoa Crop #${cropId2} on marketplace...`);
    await cropToken2.connect(farmer2).approve(marketplace.address, crop2Data.expectedYield);
    tx = await marketplace.connect(farmer2).createListing(
        cropId2,
        ethers.utils.parseEther("0.9"), // Selling at 0.9 HBAR/kg
        500 // Sell 500 kg
    );
    receipt = await tx.wait();
    const listingId2 = receipt.events?.find(e => e.event === 'ListingCreated')?.args?.listingId;
    console.log(`  Cocoa Listing #${listingId2} created.`);

    // --- 4. Create a Financing Request ---
    console.log("\n💰 Creating a financing request...");

    // Farmer 1 creates a financing request for a new crop
    console.log("  Farmer 1 creating a financing request for new Tomatoes...");
    tx = await financing.connect(farmer1).createFinancingRequest(
        "Tomatoes",
        5000, // 5000 kg expected yield
        Math.floor(Date.now() / 1000) + 86400 * 60, // 60 days from now
        "5.0000,10.0000", // Some other location
        "QmTomatoMetadata",
        ethers.utils.parseEther("0.02"), // 0.02 HBAR/kg
        ethers.utils.parseEther("100"), // Target 100 HBAR funding
        Math.floor(Date.now() / 1000) + 86400 * 30 // 30-day deadline
    );
    receipt = await tx.wait();
    const financingRequestId1 = receipt.events?.find(e => e.event === 'FinancingRequestCreated')?.args?.requestId;
    console.log(`  Tomatoes Financing Request #${financingRequestId1} created by Farmer 1.`);

    // --- 5. Investor Funds Financing Request ---
    console.log("\n💸 Investor funding financing request...");

    console.log(`  Investor 1 funding Tomatoes Financing Request #${financingRequestId1}...`);
    const fundingAmount = ethers.utils.parseEther("50");
    await financing.connect(investor1).fundRequest(financingRequestId1, { value: fundingAmount });
    console.log(`  Investor 1 funded request #${financingRequestId1} with ${ethers.utils.formatEther(fundingAmount)} HBAR.`);

    console.log("\n🎉 Setup complete! Contracts are populated with sample data.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
