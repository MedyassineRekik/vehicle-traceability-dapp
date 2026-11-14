
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./modules/VehicleModule.sol";
import "./modules/MarketplaceModule.sol";
import "./modules/InsuranceModule.sol";
import "./modules/AdminModule.sol";

contract VehicleTraceability is
    VehicleModule,
    MarketplaceModule,
    InsuranceModule,
    AdminModule
{
}
