
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/VehicleTraceabilityStorage.sol";

contract InsuranceModule is VehicleTraceabilityStorage {

    function reportInsuranceEvent(
        uint256 id,
        string calldata eventType,
        string calldata description,
        uint256 eventDate
    ) external onlyRole(INSURER_ROLE) {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");
        require(bytes(eventType).length > 0, "Empty event type");
        require(bytes(description).length > 0, "Empty description");
        require(eventDate <= block.timestamp, "Future event date");

        insuranceHistory[id].push(
            InsuranceEvent({
                eventType: eventType,
                description: description,
                eventDate: eventDate,
                recordedAt: block.timestamp,
                insurer: msg.sender
            })
        );

        emit InsuranceEventReported(
            id,
            msg.sender,
            eventDate,
            block.timestamp,
            eventType
        );
    }

    function getInsuranceHistory(uint256 id)
        external
        view
        returns (InsuranceEvent[] memory)
    {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");
        return insuranceHistory[id];
    }
}
