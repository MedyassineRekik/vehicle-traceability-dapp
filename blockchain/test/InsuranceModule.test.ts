
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("InsuranceModule", function () {
    let contract: any;
    let admin: any;
    let manufacturer: any;
    let insurer: any;
    let stranger: any;
    let owner: any;

    beforeEach(async function () {
        [admin, manufacturer, insurer, stranger, owner] =
            await ethers.getSigners();

        contract = await ethers.deployContract("VehicleTraceability");
        await contract.waitForDeployment();

        await contract.connect(admin).authorizeManufacturer(
            manufacturer.address
        );

        await contract.connect(admin).authorizeInsurer(
            insurer.address
        );

        await contract.connect(manufacturer).registerVehicle(
            "VIN001",
            "BMW",
            "Series 3",
            2022,
            owner.address
        );
    });

    it("Should allow an authorized insurer to report an event", async function () {
        await contract.connect(insurer).reportInsuranceEvent(
            1,
            "Accident",
            "Front collision",
            1000
        );

        const history = await contract.getInsuranceHistory(1);

        expect(history.length).to.equal(1);
        expect(history[0].eventType).to.equal("Accident");
        expect(history[0].description).to.equal("Front collision");
        expect(history[0].insurer).to.equal(insurer.address);
        expect(history[0].eventDate).to.equal(1000n);
        expect(history[0].recordedAt).to.be.greaterThan(0n);
    });

    it("Should reject an unauthorized insurer", async function () {
        await expect(
            contract.connect(stranger).reportInsuranceEvent(
                1,
                "Accident",
                "Front collision",
                1000
            )
        ).to.be.revert(ethers);
    });

    it("Should reject an event for a vehicle that does not exist", async function () {
        await expect(
            contract.connect(insurer).reportInsuranceEvent(
                999,
                "Accident",
                "Front collision",
                1000
            )
        ).to.be.revertedWith("Vehicle not found");
    });

    it("Should reject an event with a future date", async function () {
        await expect(
            contract.connect(insurer).reportInsuranceEvent(
                1,
                "Accident",
                "Front collision",
                9999999999
            )
        ).to.be.revertedWith("Future event date");
    });

    it("Should reject an empty event type", async function () {
        await expect(
            contract.connect(insurer).reportInsuranceEvent(
                1,
                "",
                "Front collision",
                1000
            )
        ).to.be.revertedWith("Empty event type");
    });

    it("Should reject an empty description", async function () {
        await expect(
            contract.connect(insurer).reportInsuranceEvent(
                1,
                "Accident",
                "",
                1000
            )
        ).to.be.revertedWith("Empty description");
    });

    it("Should preserve multiple insurance events", async function () {
        await contract.connect(insurer).reportInsuranceEvent(
            1, "Accident", "Front collision", 1000
        );

        await contract.connect(insurer).reportInsuranceEvent(
            1, "Repair", "Front bumper repaired", 2000
        );

        const history = await contract.getInsuranceHistory(1);

        expect(history.length).to.equal(2);
        expect(history[0].eventType).to.equal("Accident");
        expect(history[1].eventType).to.equal("Repair");
    });

    it("Should reject reports after insurer authorization is revoked", async function () {
        await contract.connect(admin).revokeInsurer(insurer.address);

        await expect(
            contract.connect(insurer).reportInsuranceEvent(
                1,
                "Accident",
                "Front collision",
                1000
            )
        ).to.be.revert(ethers);
    });
});
