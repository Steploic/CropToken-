// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    // price in wei per kg (HBAR denominated)
    mapping(string => uint256) public pricePerKg;

    event PriceUpdated(string indexed cropType, uint256 pricePerKg);

    function setPrice(string calldata cropType, uint256 priceWeiPerKg) external onlyOwner {
        require(bytes(cropType).length > 0, "PriceOracle: empty cropType");
        pricePerKg[cropType] = priceWeiPerKg;
        emit PriceUpdated(cropType, priceWeiPerKg);
    }

    function getPrice(string calldata cropType) external view returns (uint256) {
        return pricePerKg[cropType];
    }
}

