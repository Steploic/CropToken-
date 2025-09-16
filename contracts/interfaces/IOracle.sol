// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOracle {
    function verifyCrop(uint256 cropId, bool verified) external;
}

