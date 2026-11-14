
import { Contract, formatEther } from "ethers";

export interface VehicleDisplay {
    id: string;
    vin: string;
    brand: string;
    model: string;
    manufacturingYear: number;
    manufacturer: string;
    certificationDate: string;
    currentOwner: string;
    isCertified: boolean;
    isListed: boolean;
    price: string;
}

export async function getAllVehicles(
    contract: Contract
): Promise<VehicleDisplay[]> {

    // 1. Récupérer tous les identifiants
    const ids = await contract.getAllVehicleIds();

    // 2. Aucun véhicule enregistré
    if (ids.length === 0) {
        return [];
    }

    // 3. Récupérer les informations de chaque véhicule
    const vehicles = await Promise.all(
        ids.map(async (id: bigint) => {
            const vehicle = await contract.getVehicle(id);

            return {
                id: id.toString(),
                vin: vehicle.vin,
                brand: vehicle.brand,
                model: vehicle.model,
                manufacturingYear: Number(vehicle.manufacturingYear),
                manufacturer: vehicle.manufacturer,
                certificationDate: new Date(
                    Number(vehicle.certificationDate) * 1000
                ).toLocaleDateString(),
                currentOwner: vehicle.currentOwner,
                isCertified: vehicle.isCertified,
                isListed: vehicle.isListed,
                price: formatEther(vehicle.price)
            };
        })
    );

    return vehicles;
}
