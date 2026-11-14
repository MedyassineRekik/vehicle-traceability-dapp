// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/VehicleTraceabilityStorage.sol";

contract MarketplaceModule is VehicleTraceabilityStorage {

    function listVehicle(uint256 id, uint256 price)
        external
    {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");

        Vehicle storage v = vehicles[id];

        require(v.currentOwner == msg.sender, "Not owner");
        require(v.isCertified, "Not certified");
        require(!v.isListed, "Already listed");
        require(price > 0, "Invalid price");

        v.isListed = true;
        v.price = price;

        emit VehicleListed(id, msg.sender, price);
    }

    function cancelListing(uint256 id) external {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");

        Vehicle storage v = vehicles[id];

        require(v.currentOwner == msg.sender, "Not owner");
        require(v.isListed, "Not listed");

        v.isListed = false;
        v.price = 0;

        emit ListingCancelled(id, msg.sender);
    }

    function buyVehicle(uint256 id) external payable nonReentrant {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");

        Vehicle storage v = vehicles[id];

        require(v.isListed, "Not listed");
        require(v.currentOwner != msg.sender, "Cannot buy own vehicle");
        require(msg.value == v.price, "Incorrect payment");

        address seller = v.currentOwner;
        uint256 price = v.price;

        // Update ownership before sending payment.
        v.currentOwner = msg.sender;
        v.isListed = false;
        v.price = 0;

        ownershipHistory[id].push(
            OwnershipTransfer(seller, msg.sender, block.timestamp)
        );

        emit VehicleSold(id, seller, msg.sender, price);
        emit OwnershipTransferred(id, seller, msg.sender, block.timestamp);

        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Payment failed");
    }

    function getVehiclesForSale()
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;

        for (uint256 i = 0; i < allVehicleIds.length; i++) {
            if (vehicles[allVehicleIds[i]].isListed) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allVehicleIds.length; i++) {
            uint256 id = allVehicleIds[i];

            if (vehicles[id].isListed) {
                result[index++] = id;
            }
        }

        return result;
    }

    function getOwnershipHistory(uint256 id)
        external
        view
        returns (OwnershipTransfer[] memory)
    {
        require(id > 0 && id < nextVehicleId, "Vehicle not found");
        return ownershipHistory[id];
    }
}
