
import { Contract, getAddress, isAddress } from "ethers";

export async function isManufacturer(
    contract: Contract,
    account: string
): Promise<boolean> {
    const role = await contract.MANUFACTURER_ROLE();
    return await contract.hasRole(role, account);
}

export async function registerVehicle(
    contract: Contract,
    vin: string,
    brand: string,
    model: string,
    year: number,
    initialOwner: string
): Promise<string> {
    if (!isAddress(initialOwner)) {
        throw new Error("Adresse du propriétaire invalide.");
    }

    const tx = await contract.registerVehicle(
        vin.trim(),
        brand.trim(),
        model.trim(),
        year,
        getAddress(initialOwner)
    );

    await tx.wait();

    // Retrouver l'identifiant du véhicule enregistré
    const ids = await contract.getAllVehicleIds();

    for (const id of ids) {
        const vehicle = await contract.getVehicle(id);

        if (vehicle.vin === vin.trim()) {
            return id.toString();
        }
    }

    throw new Error(
        "Transaction réussie, mais véhicule introuvable."
    );
}

export async function certifyVehicle(
    contract: Contract,
    vehicleId: string
): Promise<void> {
    const tx = await contract.certifyVehicle(BigInt(vehicleId));
    await tx.wait();
}
