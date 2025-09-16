// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./CropTokenFactory.sol";

contract CropFinancing is ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Campaign {
        uint256 cropId;
        address farmer;
        uint256 goal; // wei
        uint256 pledged;
        uint256 deadline; // timestamp
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns; // campaignId -> Campaign
    mapping(uint256 => mapping(address => uint256)) public pledgedAmounts; // campaignId -> investor -> amount
    uint256 public campaignCounter;

    CropTokenFactory public cropFactory;
    address public admin;
    uint256 public platformFee = 200; // 2% basis points (200 = 2%)

    event CampaignCreated(uint256 indexed campaignId, uint256 cropId, address farmer, uint256 goal, uint256 deadline);
    event Invested(uint256 indexed campaignId, address indexed investor, uint256 amount);
    event Refunded(uint256 indexed campaignId, address indexed investor, uint256 amount);
    event Claimed(uint256 indexed campaignId, uint256 amount);

    constructor(address _cropFactory) {
        cropFactory = CropTokenFactory(_cropFactory);
        admin = msg.sender;
    }

    function createCampaign(uint256 cropId, uint256 goalWei, uint256 durationSeconds) external returns (uint256) {
        address farmer = cropFactory.getCropOwner(cropId);
        require(farmer == msg.sender, "Only farmer can create campaign");
        require(goalWei > 0, "Goal must be > 0");
        require(durationSeconds > 0, "Duration must be > 0");

        uint256 id = campaignCounter++;
        campaigns[id] = Campaign({
            cropId: cropId,
            farmer: farmer,
            goal: goalWei,
            pledged: 0,
            deadline: block.timestamp + durationSeconds,
            claimed: false
        });

        emit CampaignCreated(id, cropId, farmer, goalWei, block.timestamp + durationSeconds);
        return id;
    }

    function invest(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp <= c.deadline, "Campaign ended");
        require(msg.value > 0, "Must send funds");
        c.pledged += msg.value;
        pledgedAmounts[campaignId][msg.sender] += msg.value;
        emit Invested(campaignId, msg.sender, msg.value);
    }

    function claim(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.farmer, "Only farmer can claim");
        require(block.timestamp > c.deadline, "Campaign still active");
        require(c.pledged >= c.goal, "Goal not reached");
        require(!c.claimed, "Already claimed");

        uint256 fee = (c.pledged * platformFee) / 10000;
        uint256 amount = c.pledged - fee;
        c.claimed = true;

        // send fee to admin
        (bool sentFee, ) = admin.call{value: fee}("");
        require(sentFee, "Fee transfer failed");

        (bool sent, ) = c.farmer.call{value: amount}("");
        require(sent, "Transfer to farmer failed");

        emit Claimed(campaignId, amount);
    }

    function refund(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp > c.deadline, "Campaign still active");
        require(c.pledged < c.goal, "Goal reached, cannot refund");

        uint256 pledged = pledgedAmounts[campaignId][msg.sender];
        require(pledged > 0, "No funds to refund");

        pledgedAmounts[campaignId][msg.sender] = 0;
        (bool refunded, ) = msg.sender.call{value: pledged}("");
        require(refunded, "Refund failed");

        emit Refunded(campaignId, msg.sender, pledged);
    }

    // Admin setter
    function setPlatformFee(uint256 newFee) external {
        require(msg.sender == admin, "Not admin");
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }
}

