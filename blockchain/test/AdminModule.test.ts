
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AdminModule", function () {
    let contract: any;
    let admin: any;
    let manufacturer: any;
    let insurer: any;
    let stranger: any;

    beforeEach(async function () {
        [admin, manufacturer, insurer, stranger] =
            await ethers.getSigners();

        contract = await ethers.deployContract("VehicleTraceability");
        await contract.waitForDeployment();
    });

    it("Should authorize a manufacturer", async function () {
        await contract.connect(admin).authorizeManufacturer(
            manufacturer.address
        );

        expect(
            await contract.hasRole(
                await contract.MANUFACTURER_ROLE(),
                manufacturer.address
            )
        ).to.equal(true);
    });

    it("Should revoke a manufacturer", async function () {
        await contract.connect(admin).authorizeManufacturer(
            manufacturer.address
        );

        await contract.connect(admin).revokeManufacturer(
            manufacturer.address
        );

        expect(
            await contract.hasRole(
                await contract.MANUFACTURER_ROLE(),
                manufacturer.address
            )
        ).to.equal(false);
    });

    it("Should authorize an insurer", async function () {
        await contract.connect(admin).authorizeInsurer(
            insurer.address
        );

        expect(
            await contract.hasRole(
                await contract.INSURER_ROLE(),
                insurer.address
            )
        ).to.equal(true);
    });

    it("Should revoke an insurer", async function () {
        await contract.connect(admin).authorizeInsurer(
            insurer.address
        );

        await contract.connect(admin).revokeInsurer(
            insurer.address
        );

        expect(
            await contract.hasRole(
                await contract.INSURER_ROLE(),
                insurer.address
            )
        ).to.equal(false);
    });

    it("Should reject authorization by a non-admin", async function () {
        await expect(
            contract.connect(stranger).authorizeManufacturer(
                manufacturer.address
            )
        ).to.be.revert(ethers);
    });

    it("Should reject revocation by a non-admin", async function () {
        await contract.connect(admin).authorizeInsurer(
            insurer.address
        );

        await expect(
            contract.connect(stranger).revokeInsurer(
                insurer.address
            )
        ).to.be.revert(ethers);
    });

    it("Should reject the zero address for authorization", async function () {
        await expect(
            contract.connect(admin).authorizeManufacturer(
                ethers.ZeroAddress
            )
        ).to.be.revertedWith("Invalid address");
    });
});
