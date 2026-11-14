
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("VehicleModule", function () {
    let contract: any;
    let admin: any;
    let manufacturer: any;
    let otherManufacturer: any;
    let owner: any;
    let stranger: any;

    beforeEach(async function () {
        [admin, manufacturer, otherManufacturer, owner, stranger] =
            await ethers.getSigners();

        contract = await ethers.deployContract("VehicleTraceability");
        await contract.waitForDeployment();

        await contract.connect(admin).authorizeManufacturer(
            manufacturer.address
        );
    });

    async function registerVehicle() {
        await contract.connect(manufacturer).registerVehicle(
            "VIN001",
            "BMW",
            "Series 3",
            2022,
            owner.address
        );
    }

    it("Should register a vehicle", async function () {
        await registerVehicle();

        const vehicle = await contract.getVehicle(1);

        expect(vehicle.vin).to.equal("VIN001");
        expect(vehicle.brand).to.equal("BMW");
        expect(vehicle.model).to.equal("Series 3");
        expect(vehicle.currentOwner).to.equal(owner.address);
        expect(vehicle.isCertified).to.equal(false);
    });

    it("Should reject unauthorized registration", async function () {
        await expect(
            contract.connect(stranger).registerVehicle(
                "VIN002", "Audi", "A3", 2023, owner.address
            )
        ).to.be.revert(ethers);
    });

    it("Should reject duplicate VIN", async function () {
        await registerVehicle();

        await expect(
            contract.connect(manufacturer).registerVehicle(
                "VIN001", "Audi", "A3", 2023, owner.address
            )
        ).to.be.revertedWith("VIN already exists");
    });

    it("Should reject an empty VIN", async function () {
        await expect(
            contract.connect(manufacturer).registerVehicle(
                "", "BMW", "Series 3", 2022, owner.address
            )
        ).to.be.revertedWith("Empty VIN");
    });

    it("Should certify a vehicle", async function () {
        await registerVehicle();

        await contract.connect(manufacturer).certifyVehicle(1);

        const vehicle = await contract.getVehicle(1);

        expect(vehicle.isCertified).to.equal(true);
        expect(vehicle.certificationDate).to.be.greaterThan(0n);
    });

    it("Should reject certification by another manufacturer", async function () {
        await registerVehicle();

        await contract.connect(admin).authorizeManufacturer(
            otherManufacturer.address
        );

        await expect(
            contract.connect(otherManufacturer).certifyVehicle(1)
        ).to.be.revertedWith("Not manufacturer");
    });

    it("Should reject certification by an unauthorized user", async function () {
        await registerVehicle();

        await expect(
            contract.connect(stranger).certifyVehicle(1)
        ).to.be.revert(ethers);
    });

    it("Should reject double certification", async function () {
        await registerVehicle();

        await contract.connect(manufacturer).certifyVehicle(1);

        await expect(
            contract.connect(manufacturer).certifyVehicle(1)
        ).to.be.revertedWith("Already certified");
    });

    it("Should return all registered vehicle IDs", async function () {
        await registerVehicle();

        await contract.connect(manufacturer).registerVehicle(
            "VIN002", "Audi", "A3", 2023, owner.address
        );

        const ids = await contract.getAllVehicleIds();

        expect(ids.length).to.equal(2);
        expect(ids[0]).to.equal(1n);
        expect(ids[1]).to.equal(2n);
    });
});
