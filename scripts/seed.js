// scripts/seed.js
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
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const farmer = signers[1];
    const buyer = signers[2];

    const cropFactory = await ethers.getContractAt("CropTokenFactory", deployed.CropTokenFactory);
    const marketplace = await ethers.getContractAt("CropMarketplace", deployed.CropMarketplace);

    console.log("Tokenizing a sample crop as farmer:", farmer.address);

    const harvestTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90; // 90 days
    const tx = await cropFactory.connect(farmer).tokenizeCrop(
        "maize",
        1000,
        harvestTimestamp,
        "4.0511,9.7679",
        "QmTestIPFSHash",
        ethers.utils.parseEther("0.01")
    );
    await tx.wait();
    console.log("Crop tokenized. CropId = 0 (expected)");

    // Mark verified using oracle (deployer)
    console.log("Verifying crop as oracle (deployer)...");
    await (await cropFactory.connect(deployer).verifyCrop(0, true)).wait();

    // Approve marketplace to move tokens on behalf of farmer (we need crop token address)
    const tokenAddress = await cropFactory.getCropTokenAddress(0);
    const cropToken = await ethers.getContractAt("CropToken", tokenAddress);

    console.log("Farmer approving marketplace to sell 100 tokens...");
    await (await cropToken.connect(farmer).approve(marketplace.address, 100)).wait();

    console.log("Creating listing...");
    await (await marketplace.connect(farmer).createListing(0, ethers.utils.parseEther("0.01"), 100)).wait();

    console.log("Seeding complete.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

