const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CropTokenFactory", function () {
    let cropFactory;
    let owner, farmer, oracle, buyer;
    
    beforeEach(async function () {
        [owner, farmer, oracle, buyer] = await ethers.getSigners();
        
        const CropTokenFactory = await ethers.getContractFactory("CropTokenFactory");
        cropFactory = await CropTokenFactory.deploy(oracle.address);
        await cropFactory.deployed();
    });
    
    describe("Crop Tokenization", function () {
        it("Should tokenize a crop successfully", async function () {
            const tx = await cropFactory.connect(farmer).tokenizeCrop(
                "maize",
                1000, // 1000 kg expected yield
                Math.floor(Date.now() / 1000) + 86400 * 120, // 120 days from now
                "4.0511,9.7679", // Douala coordinates
                "QmTestIPFSHash",
                ethers.utils.parseEther("0.1") // 0.1 HBAR per kg
            );
            
            await expect(tx)
                .to.emit(cropFactory, "CropTokenized")
                .withArgs(0, farmer.address, "maize", 1000, await cropFactory.crops(0).then(c => c.tokenAddress));
                
            const crop = await cropFactory.crops(0);
            expect(crop.farmer).to.equal(farmer.address);
            expect(crop.cropType).to.equal("maize");
            expect(crop.expectedYield).to.equal(1000);
        });
        
        it("Should fail with invalid parameters", async function () {
            await expect(
                cropFactory.connect(farmer).tokenizeCrop(
                    "",
                    1000,
                    Math.floor(Date.now() / 1000) + 86400 * 120,
                    "4.0511,9.7679",
                    "QmTestIPFSHash",
                    ethers.utils.parseEther("0.1")
                )
            ).to.be.revertedWith("Crop type required");
        });
    });
    
    describe("Oracle Verification", function () {
        beforeEach(async function () {
            await cropFactory.connect(farmer).tokenizeCrop(
                "cocoa",
                500,
                Math.floor(Date.now() / 1000) + 86400 * 180,
                "6.1319,1.2228", // Yaoundé coordinates
                "QmTestIPFSHash2",
                ethers.utils.parseEther("0.5")
            );
        });
        
        it("Should allow oracle to verify crop", async function () {
            await expect(cropFactory.connect(oracle).verifyCrop(0, true))
                .to.emit(cropFactory, "CropVerified")
                .withArgs(0, true);
                
            const crop = await cropFactory.crops(0);
            expect(crop.isVerified).to.be.true;
        });
        
        it("Should reject verification from non-oracle", async function () {
            await expect(
                cropFactory.connect(farmer).verifyCrop(0, true)
            ).to.be.revertedWith("Only oracle can call");
        });
    });
});
