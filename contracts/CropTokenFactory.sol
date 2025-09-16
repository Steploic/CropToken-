// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ICropToken.sol";

/**
 * @title CropTokenFactory
 * @dev Main contract for tokenizing agricultural crops on Hedera
 * @author CropToken Team - Hedera Africa Hackathon 2025
 */
contract CropTokenFactory is Ownable, ReentrancyGuard {
    
    struct Crop {
        string cropType;        // "maize", "cocoa", "coffee"
        uint256 expectedYield;  // in kilograms
        uint256 plantingDate;   // timestamp
        uint256 harvestDate;    // expected harvest timestamp
        string location;        // GPS coordinates
        address farmer;         // crop owner
        bool isVerified;       // oracle verification status
        string ipfsHash;       // metadata hash
        address tokenAddress;  // ERC20 token for this crop
        uint256 pricePerKg;    // in wei (HBAR)
        CropStatus status;
    }
    
    enum CropStatus { PLANTED, GROWING, READY, HARVESTED, TRADED }
    
    mapping(uint256 => Crop) public crops;
    mapping(address => uint256[]) public farmerCrops;
    mapping(string => uint256[]) public locationCrops;
    
    uint256 public cropCounter;
    address public oracleAddress;
    uint256 public platformFee = 200; // 2% in basis points
    
    event CropTokenized(
        uint256 indexed cropId,
        address indexed farmer,
        string cropType,
        uint256 expectedYield,
        address tokenAddress
    );
    
    event CropVerified(uint256 indexed cropId, bool verified);
    event CropStatusUpdated(uint256 indexed cropId, CropStatus newStatus);
    
    modifier onlyFarmer(uint256 cropId) {
        require(crops[cropId].farmer == msg.sender, "Not the crop owner");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call");
        _;
    }
    
    constructor(address _oracleAddress) {
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Tokenize a new crop
     * @param _cropType Type of crop (e.g., "maize", "cocoa")
     * @param _expectedYield Expected yield in kilograms
     * @param _harvestDate Expected harvest date (timestamp)
     * @param _location GPS coordinates as string
     * @param _ipfsHash IPFS hash for additional metadata
     * @param _pricePerKg Desired price per kilogram in wei
     */
    function tokenizeCrop(
        string memory _cropType,
        uint256 _expectedYield,
        uint256 _harvestDate,
        string memory _location,
        string memory _ipfsHash,
        uint256 _pricePerKg
    ) external nonReentrant returns (uint256 cropId) {
        require(bytes(_cropType).length > 0, "Crop type required");
        require(_expectedYield > 0, "Expected yield must be positive");
        require(_harvestDate > block.timestamp, "Harvest date must be future");
        require(_pricePerKg > 0, "Price must be positive");
        
        cropId = cropCounter++;
        
        // Deploy new ERC20 token for this crop
        string memory tokenName = string(abi.encodePacked(_cropType, " Crop #", Strings.toString(cropId)));
        string memory tokenSymbol = string(abi.encodePacked("CROP", Strings.toString(cropId)));
        
        CropToken newToken = new CropToken(tokenName, tokenSymbol, _expectedYield, address(this));
        
        crops[cropId] = Crop({
            cropType: _cropType,
            expectedYield: _expectedYield,
            plantingDate: block.timestamp,
            harvestDate: _harvestDate,
            location: _location,
            farmer: msg.sender,
            isVerified: false,
            ipfsHash: _ipfsHash,
            tokenAddress: address(newToken),
            pricePerKg: _pricePerKg,
            status: CropStatus.PLANTED
        });
        
        farmerCrops[msg.sender].push(cropId);
        locationCrops[_location].push(cropId);
        
        emit CropTokenized(cropId, msg.sender, _cropType, _expectedYield, address(newToken));
        
        return cropId;
    }
    
    /**
     * @dev Oracle verification of crop conditions
     */
    function verifyCrop(uint256 cropId, bool verified) external onlyOracle {
        require(cropId < cropCounter, "Crop does not exist");
        crops[cropId].isVerified = verified;
        emit CropVerified(cropId, verified);
    }
    
    /**
     * @dev Update crop status
     */
    function updateCropStatus(uint256 cropId, CropStatus newStatus) 
        external 
        onlyFarmer(cropId) 
    {
        crops[cropId].status = newStatus;
        emit CropStatusUpdated(cropId, newStatus);
    }
    
    /**
     * @dev Get crops by farmer
     */
    function getFarmerCrops(address farmer) external view returns (uint256[] memory) {
        return farmerCrops[farmer];
    }
    
    /**
     * @dev Get crops by location
     */
    function getLocationCrops(string memory location) external view returns (uint256[] memory) {
        return locationCrops[location];
    }
    
    /**
     * @dev Update oracle address (only owner)
     */
    function setOracleAddress(address newOracle) external onlyOwner {
        oracleAddress = newOracle;
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
}

/**
 * @title CropToken
 * @dev Individual ERC20 token representing kilograms of a specific crop
 */
contract CropToken is ERC20 {
    address public factory;
    uint256 public totalSupplyKg;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupplyKg,
        address _factory
    ) ERC20(name, symbol) {
        factory = _factory;
        totalSupplyKg = _totalSupplyKg;
        _mint(_factory, _totalSupplyKg * 10**decimals());
    }
    
    function decimals() public pure override returns (uint8) {
        return 18; // 1 token = 1 kg with 18 decimal precision
    }
}
