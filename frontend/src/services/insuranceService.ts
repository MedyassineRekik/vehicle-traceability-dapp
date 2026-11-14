
import type { Contract } from "ethers";

export interface InsuranceVehicle {
  id: string;
  vin: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  currentOwner: string;
}

// Vérifier si l'adresse connectée est un assureur autorisé
export async function isInsurer(
  contract: Contract,
  account: string
): Promise<boolean> {
  const insurerRole = await contract.INSURER_ROLE();
  return await contract.hasRole(insurerRole, account);
}

// Récupérer les véhicules enregistrés sur la blockchain
export async function getInsuranceVehicles(
  contract: Contract
): Promise<InsuranceVehicle[]> {
  const ids: bigint[] = await contract.getAllVehicleIds();

  const vehicles = await Promise.all(
    ids.map(async (id) => {
      const vehicle = await contract.getVehicle(id);

      return {
        id: id.toString(),
        vin: vehicle.vin,
        brand: vehicle.brand,
        model: vehicle.model,
        manufacturingYear: Number(vehicle.manufacturingYear),
        currentOwner: vehicle.currentOwner,
      };
    })
  );

  return vehicles;
}

// Enregistrer une déclaration d'assurance
export async function reportInsuranceEvent(
  contract: Contract,
  vehicleId: string,
  eventType: string,
  description: string,
  eventDate: string
): Promise<void> {
  if (!/^\d+$/.test(vehicleId)) {
    throw new Error("Veuillez sélectionner un véhicule valide.");
  }

  const cleanEventType = eventType.trim();
  const cleanDescription = description.trim();

  if (!cleanEventType) {
    throw new Error("Le type d'événement est obligatoire.");
  }

  if (!cleanDescription) {
    throw new Error("La description est obligatoire.");
  }

  if (cleanDescription.length > 1000) {
    throw new Error("La description ne doit pas dépasser 1000 caractères.");
  }

  if (!eventDate) {
    throw new Error("La date de l'événement est obligatoire.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    throw new Error("Format de date invalide.");
  }

  const date = new Date(`${eventDate}T00:00:00`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== eventDate
  ) {
    throw new Error("Date invalide.");
  }

  if (date.getTime() > Date.now()) {
    throw new Error("La date ne peut pas être dans le futur.");
  }

  const timestamp = Math.floor(date.getTime() / 1000);

  const tx = await contract.reportInsuranceEvent(
    BigInt(vehicleId),
    cleanEventType,
    cleanDescription,
    BigInt(timestamp)
  );

  await tx.wait();
}
