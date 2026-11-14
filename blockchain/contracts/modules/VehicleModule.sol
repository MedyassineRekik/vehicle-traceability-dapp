
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/VehicleTraceabilityStorage.sol";

contract VehicleModule is VehicleTraceabilityStorage {

    function registerVehicle(
        string calldata vin,
        string calldata brand,
        string calldata model,
        uint16 year,
        address initialOwner
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(bytes(vin).length > 0, "Empty VIN");
        require(bytes(brand).length > 0, "Empty brand");
        require(bytes(model).length > 0, "Empty model");
        require(year > 1885, "Invalid year");
        require(initialOwner != address(0), "Invalid owner");
        require(vinToVehicleId[vin] == 0, "VIN already exists");

        uint256 id = nextVehicleId++;

        vehicles[id] = Vehicle({
            vin: vin,
            brand: brand,
            model: model,
            manufacturingYear: year,
            manufacturer: msg.sender,
            certificationDate: 0,
            currentOwner: initialOwner,
            isCertified: false,
            isListed: false,
            price: 0
        });

        vinToVehicleId[vin] = id;
        allVehicleIds.push(id);

        emit VehicleRegistered(id, vin, msg.sender, initialOwner);
    }

    function certifyVehicle(uint256 id)
        external
        onlyRole(MANUFACTURER_ROLE)
    {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");
        require(vehicles[id].manufacturer == msg.sender, "Not manufacturer");
        require(!vehicles[id].isCertified, "Already certified");

        vehicles[id].isCertified = true;
        vehicles[id].certificationDate = block.timestamp;

        emit VehicleCertified(id, msg.sender, block.timestamp);
    }

    function getVehicle(uint256 id)
        external
        view
        returns (Vehicle memory)
    {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");
        return vehicles[id];
    }

    function getAllVehicleIds()
        external
        view
        returns (uint256[] memory)
    {
        return allVehicleIds;
    }
}
