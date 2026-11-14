
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/VehicleTraceabilityStorage.sol";

contract AdminModule is VehicleTraceabilityStorage {

    function authorizeManufacturer(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(account != address(0), "Invalid address");

        if (!hasRole(MANUFACTURER_ROLE, account)) {
            _grantRole(MANUFACTURER_ROLE, account);
            emit ManufacturerAuthorized(account);
        }
    }

    function revokeManufacturer(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (hasRole(MANUFACTURER_ROLE, account)) {
            _revokeRole(MANUFACTURER_ROLE, account);
            emit ManufacturerRevoked(account);
        }
    }

    function authorizeInsurer(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(account != address(0), "Invalid address");

        if (!hasRole(INSURER_ROLE, account)) {
            _grantRole(INSURER_ROLE, account);
            emit InsurerAuthorized(account);
        }
    }

    function revokeInsurer(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (hasRole(INSURER_ROLE, account)) {
            _revokeRole(INSURER_ROLE, account);
            emit InsurerRevoked(account);
        }
    }
}
