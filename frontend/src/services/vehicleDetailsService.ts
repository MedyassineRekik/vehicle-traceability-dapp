
import { Contract, formatEther } from "ethers";

export interface OwnershipTransferDisplay {
    previousOwner: string;
    newOwner: string;
    timestamp: string;
}

export interface InsuranceEventDisplay {
    eventType: string;
    description: string;
    eventDate: string;
    recordedAt: string;
    insurer: string;
}

export interface VehicleDetails {
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
    ownershipHistory: OwnershipTransferDisplay[];
    insuranceHistory: InsuranceEventDisplay[];
}

function formatDate(timestamp: bigint | number): string {
    const value = Number(timestamp);

    if (!value) {
        return "Non disponible";
    }

    return new Date(value * 1000).toLocaleString();
}

export async function getVehicleDetails(
    contract: Contract,
    vehicleId: string
): Promise<VehicleDetails> {

    // Récupérer les informations principales
    const vehicle = await contract.getVehicle(BigInt(vehicleId));

    // Récupérer l'historique des propriétaires
    const ownershipRecords =
        await contract.getOwnershipHistory(BigInt(vehicleId));

    // Récupérer l'historique d'assurance
    const insuranceRecords =
        await contract.getInsuranceHistory(BigInt(vehicleId));

    return {
        id: vehicleId,
        vin: vehicle.vin,
        brand: vehicle.brand,
        model: vehicle.model,
        manufacturingYear: Number(vehicle.manufacturingYear),
        manufacturer: vehicle.manufacturer,
        certificationDate: formatDate(vehicle.certificationDate),
        currentOwner: vehicle.currentOwner,
        isCertified: vehicle.isCertified,
        isListed: vehicle.isListed,
        price: formatEther(vehicle.price),

        ownershipHistory: ownershipRecords.map((record: any) => ({
            previousOwner: record.previousOwner,
            newOwner: record.newOwner,
            timestamp: formatDate(record.timestamp)
        })),

        insuranceHistory: insuranceRecords.map((record: any) => ({
            eventType: record.eventType,
            description: record.description,
            eventDate: formatDate(record.eventDate),
            recordedAt: formatDate(record.recordedAt),
            insurer: record.insurer
        }))
    };
}
