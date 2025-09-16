// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMarketplace {
    function createListing(uint256 cropId, uint256 pricePerToken, uint256 tokensToSell) external returns (uint256);
    function buyTokens(uint256 listingId, uint256 quantity) external payable;
    function cancelListing(uint256 listingId) external;
}

