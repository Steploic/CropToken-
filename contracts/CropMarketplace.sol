// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ICropToken.sol";
import "./CropTokenFactory.sol";

/**
 * @title CropMarketplace
 * @dev Decentralized marketplace for trading tokenized crops
 */
contract CropMarketplace is ReentrancyGuard {
    
    struct Listing {
        uint256 cropId;
        address seller;
        uint256 pricePerToken;  // in wei (HBAR)
        uint256 availableTokens;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Order {
        uint256 listingId;
        address buyer;
        uint256 quantity;
        uint256 totalPrice;
        bool isDelivered;
        uint256 createdAt;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public sellerListings;
    mapping(address => uint256[]) public buyerOrders;
    
    uint256 public listingCounter;
    uint256 public orderCounter;
    
    CropTokenFactory public cropFactory;
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;
    
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed cropId,
        address indexed seller,
        uint256 pricePerToken,
        uint256 availableTokens
    );
    
    event OrderPlaced(
        uint256 indexed orderId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalPrice
    );
    
    event OrderDelivered(uint256 indexed orderId);
    event ListingCanceled(uint256 indexed listingId);
    
    constructor(address _cropFactory, address _feeRecipient) {
        cropFactory = CropTokenFactory(_cropFactory);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new listing for crop tokens
     */
    function createListing(
        uint256 cropId,
        uint256 pricePerToken,
        uint256 tokensToSell
    ) external nonReentrant returns (uint256 listingId) {
        // Verify crop exists and caller is farmer
        (,,,,, address farmer,,,,) = cropFactory.crops(cropId);
        require(farmer == msg.sender, "Only crop owner can list");
        
        // Verify crop is verified and ready
        (,,,,,, bool isVerified,,,) = cropFactory.crops(cropId);
        require(isVerified, "Crop must be verified");
        
        // Get crop token address
        (,,,,,,, address tokenAddress,,) = cropFactory.crops(cropId);
        IERC20 cropToken = IERC20(tokenAddress);
        
        // Verify seller has enough tokens
        require(cropToken.balanceOf(msg.sender) >= tokensToSell, "Insufficient tokens");
        
        // Transfer tokens to marketplace (escrow)
        cropToken.transferFrom(msg.sender, address(this), tokensToSell);
        
        listingId = listingCounter++;
        
        listings[listingId] = Listing({
            cropId: cropId,
            seller: msg.sender,
            pricePerToken: pricePerToken,
            availableTokens: tokensToSell,
            isActive: true,
            createdAt: block.timestamp
        });
        
        sellerListings[msg.sender].push(listingId);
        
        emit ListingCreated(listingId, cropId, msg.sender, pricePerToken, tokensToSell);
        
        return listingId;
    }
    
    /**
     * @dev Buy crop tokens from a listing
     */
    function buyTokens(uint256 listingId, uint256 quantity) 
        external 
        payable 
        nonReentrant 
    {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(quantity <= listing.availableTokens, "Insufficient tokens available");
        
        uint256 totalPrice = quantity * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Calculate platform fee
        uint256 feeAmount = (totalPrice * platformFee) / 10000;
        uint256 sellerAmount = totalPrice - feeAmount;
        
        // Update listing
        listing.availableTokens -= quantity;
        if (listing.availableTokens == 0) {
            listing.isActive = false;
        }
        
        // Create order
        uint256 orderId = orderCounter++;
        orders[orderId] = Order({
            listingId: listingId,
            buyer: msg.sender,
            quantity: quantity,
            totalPrice: totalPrice,
            isDelivered: false,
            createdAt: block.timestamp
        });
        
        buyerOrders[msg.sender].push(orderId);
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Transfer fee to platform
        payable(feeRecipient).transfer(feeAmount);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        // Transfer tokens to buyer
        (,,,,,,, address tokenAddress,,) = cropFactory.crops(listing.cropId);
        IERC20(tokenAddress).transfer(msg.sender, quantity);
        
        emit OrderPlaced(orderId, listingId, msg.sender, quantity, totalPrice);
    }
    
    /**
     * @dev Mark order as delivered (can be automated with IoT/oracles)
     */
    function confirmDelivery(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Only buyer can confirm");
        require(!order.isDelivered, "Already delivered");
        
        order.isDelivered = true;
        emit OrderDelivered(orderId);
    }
    
    /**
     * @dev Cancel active listing
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        
        // Return escrowed tokens to seller
        (,,,,,,, address tokenAddress,,) = cropFactory.crops(listing.cropId);
        IERC20(tokenAddress).transfer(msg.sender, listing.availableTokens);
        
        emit ListingCanceled(listingId);
    }
    
    /**
     * @dev Get active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].isActive) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
}
