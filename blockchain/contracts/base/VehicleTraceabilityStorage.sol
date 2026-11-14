
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract VehicleTraceabilityStorage is
    AccessControl,
    ReentrancyGuard
{
    // =========================================
    // ROLES
    // =========================================

    bytes32 public constant MANUFACTURER_ROLE =
        keccak256("MANUFACTURER_ROLE");

    bytes32 public constant INSURER_ROLE =
        keccak256("INSURER_ROLE");

    // =========================================
    // STRUCTURES
    // =========================================

    struct Vehicle {
        string vin;
        string brand;
        string model;
        uint16 manufacturingYear;
        address manufacturer;
        uint256 certificationDate;
        address currentOwner;
        bool isCertified;
        bool isListed;
        uint256 price;
    }

    struct OwnershipTransfer {
        address previousOwner;
        address newOwner;
        uint256 timestamp;
    }

    struct InsuranceEvent {
        string eventType;
        string description;
        uint256 eventDate;
        uint256 recordedAt;
        address insurer;
    }

    // =========================================
    // STORAGE
    // =========================================

    uint256 internal nextVehicleId = 1;
    uint256[] internal allVehicleIds;

    mapping(uint256 => Vehicle) internal vehicles;

    mapping(string => uint256) internal vinToVehicleId;

    mapping(uint256 => OwnershipTransfer[])
        internal ownershipHistory;

    mapping(uint256 => InsuranceEvent[])
        internal insuranceHistory;

    // =========================================
    // EVENTS
    // =========================================

    event ManufacturerAuthorized(address indexed manufacturer);
    event ManufacturerRevoked(address indexed manufacturer);

    event InsurerAuthorized(address indexed insurer);
    event InsurerRevoked(address indexed insurer);

    event VehicleRegistered(
        uint256 indexed vehicleId,
        string vin,
        address indexed manufacturer,
        address indexed initialOwner
    );

    event VehicleCertified(
        uint256 indexed vehicleId,
        address indexed manufacturer,
        uint256 certificationDate
    );

    event VehicleListed(
        uint256 indexed vehicleId,
        address indexed owner,
        uint256 price
    );

    event ListingCancelled(
        uint256 indexed vehicleId,
        address indexed owner
    );

    event VehicleSold(
        uint256 indexed vehicleId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event OwnershipTransferred(
        uint256 indexed vehicleId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event InsuranceEventReported(
        uint256 indexed vehicleId,
        address indexed insurer,
        uint256 eventDate,
        uint256 recordedAt,
        string eventType
    );

    // =========================================
    // CONSTRUCTOR
    // =========================================

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
