
import {
    Contract,
    formatEther,
    parseEther
} from "ethers";

export interface MarketplaceVehicle {
    id: string;
    vin: string;
    brand: string;
    model: string;
    manufacturingYear: number;
    currentOwner: string;
    price: string;
}

export async function getMarketplaceVehicles(
    contract: Contract
): Promise<MarketplaceVehicle[]> {

    // Récupérer les identifiants des véhicules en vente
    const ids = await contract.getVehiclesForSale();

    // Récupérer les informations de chaque véhicule
    const vehicles = await Promise.all(
        ids.map(async (id: bigint) => {
            const vehicle = await contract.getVehicle(id);

            return {
                id: id.toString(),
                vin: vehicle.vin,
                brand: vehicle.brand,
                model: vehicle.model,
                manufacturingYear: Number(vehicle.manufacturingYear),
                currentOwner: vehicle.currentOwner,
                price: formatEther(vehicle.price)
            };
        })
    );

    return vehicles;
}

export async function listVehicle(
    contract: Contract,
    vehicleId: string,
    priceInEth: string
): Promise<void> {

    const price = parseEther(priceInEth);

    if (price <= 0n) {
        throw new Error("Le prix doit être supérieur à zéro.");
    }

    const tx = await contract.listVehicle(
        BigInt(vehicleId),
        price
    );

    await tx.wait();
}

export async function cancelListing(
    contract: Contract,
    vehicleId: string
): Promise<void> {

    const tx = await contract.cancelListing(
        BigInt(vehicleId)
    );

    await tx.wait();
}

export async function buyVehicle(
    contract: Contract,
    vehicleId: string,
    priceInEth: string
): Promise<void> {

    const value = parseEther(priceInEth);

    const tx = await contract.buyVehicle(
        BigInt(vehicleId),
        { value }
    );

    await tx.wait();
}
