// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccessControlSimple is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    modifier onlyOracle() {
        require(hasRole(ORACLE_ROLE, msg.sender), "AccessControlSimple: not oracle");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "AccessControlSimple: not operator");
        _;
    }

    function grantOracle(address account) external {
        grantRole(ORACLE_ROLE, account);
    }

    function revokeOracle(address account) external {
        revokeRole(ORACLE_ROLE, account);
    }
}

