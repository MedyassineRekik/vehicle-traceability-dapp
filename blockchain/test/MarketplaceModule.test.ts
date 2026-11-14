import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("MarketplaceModule", function () {
    let contract: any;
    let admin: any;
    let manufacturer: any;
    let seller: any;
    let buyer: any;
    let anotherBuyer: any;

    const price = ethers.parseEther("1");

    beforeEach(async function () {
        [admin, manufacturer, seller, buyer, anotherBuyer] =
            await ethers.getSigners();

        contract = await ethers.deployContract("VehicleTraceability");
        await contract.waitForDeployment();

        await contract.connect(admin).authorizeManufacturer(
            manufacturer.address
        );

        await contract.connect(manufacturer).registerVehicle(
            "VIN001",
            "BMW",
            "Series 3",
            2022,
            seller.address
        );

        await contract.connect(manufacturer).certifyVehicle(1);
    });

    it("Should allow the owner to list a certified vehicle", async function () {
        await contract.connect(seller).listVehicle(1, price);

        const vehicle = await contract.getVehicle(1);

        expect(vehicle.isListed).to.equal(true);
        expect(vehicle.price).to.equal(price);
    });

    it("Should reject listing by a non-owner", async function () {
        await expect(
            contract.connect(buyer).listVehicle(1, price)
        ).to.be.revertedWith("Not owner");
    });

    it("Should reject listing with zero price", async function () {
        await expect(
            contract.connect(seller).listVehicle(1, 0)
        ).to.be.revertedWith("Invalid price");
    });

    it("Should reject listing an uncertified vehicle", async function () {
        await contract.connect(manufacturer).registerVehicle(
            "VIN002",
            "Audi",
            "A3",
            2023,
            seller.address
        );

        await expect(
            contract.connect(seller).listVehicle(2, price)
        ).to.be.revertedWith("Not certified");
    });

    it("Should allow the owner to cancel a listing", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await contract.connect(seller).cancelListing(1);

        const vehicle = await contract.getVehicle(1);

        expect(vehicle.isListed).to.equal(false);
        expect(vehicle.price).to.equal(0n);
    });

    it("Should reject cancellation by a non-owner", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await expect(
            contract.connect(buyer).cancelListing(1)
        ).to.be.revertedWith("Not owner");
    });

    it("Should allow relisting after cancellation", async function () {
        await contract.connect(seller).listVehicle(1, price);
        await contract.connect(seller).cancelListing(1);

        await contract.connect(seller).listVehicle(1, price);

        expect((await contract.getVehicle(1)).isListed).to.equal(true);
    });

    it("Should allow a buyer to purchase with the exact price", async function () {
        await contract.connect(seller).listVehicle(1, price);

        const sellerBalanceBefore =
            await ethers.provider.getBalance(seller.address);

        await contract.connect(buyer).buyVehicle(1, { value: price });

        const sellerBalanceAfter =
            await ethers.provider.getBalance(seller.address);

        const vehicle = await contract.getVehicle(1);

        expect(vehicle.currentOwner).to.equal(buyer.address);
        expect(vehicle.isListed).to.equal(false);
        expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(price);
    });

    it("Should reject payment below the price", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await expect(
            contract.connect(buyer).buyVehicle(1, {
                value: ethers.parseEther("0.5")
            })
        ).to.be.revertedWith("Incorrect payment");
    });

    it("Should reject payment above the price", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await expect(
            contract.connect(buyer).buyVehicle(1, {
                value: ethers.parseEther("2")
            })
        ).to.be.revertedWith("Incorrect payment");
    });

    it("Should reject purchase by the current owner", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await expect(
            contract.connect(seller).buyVehicle(1, { value: price })
        ).to.be.revertedWith("Cannot buy own vehicle");
    });

    it("Should reject a second purchase after the first sale", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await contract.connect(buyer).buyVehicle(1, { value: price });

        await expect(
            contract.connect(anotherBuyer).buyVehicle(1, {
                value: price
            })
        ).to.be.revertedWith("Not listed");
    });

    it("Should record the ownership transfer", async function () {
        await contract.connect(seller).listVehicle(1, price);

        await contract.connect(buyer).buyVehicle(1, { value: price });

        const history = await contract.getOwnershipHistory(1);

        expect(history.length).to.equal(1);
        expect(history[0].previousOwner).to.equal(seller.address);
        expect(history[0].newOwner).to.equal(buyer.address);
    });

    it("Should return only listed vehicles", async function () {
        await contract.connect(seller).listVehicle(1, price);

        const listedIds = await contract.getVehiclesForSale();

        expect(listedIds.length).to.equal(1);
        expect(listedIds[0]).to.equal(1n);
    });
});
