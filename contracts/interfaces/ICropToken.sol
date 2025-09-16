// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICropToken is IERC20 {
    function factory() external view returns (address);
    function totalSupplyKg() external view returns (uint256);
}

