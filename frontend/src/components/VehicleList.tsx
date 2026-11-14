
import type { VehicleDisplay } from "../services/vehicleService";

interface VehicleListProps {
    vehicles: VehicleDisplay[];
    onViewDetails: (vehicleId: string) => void;
}

function VehicleList({
    vehicles,
    onViewDetails
}: VehicleListProps) {

    if (vehicles.length === 0) {
        return <p>Aucun véhicule enregistré sur la blockchain.</p>;
    }

    return (
        <div>
            <h2>Liste des véhicules</h2>

            {vehicles.map((vehicle) => (
                <div
                    key={vehicle.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: "15px",
                        marginBottom: "10px",
                        borderRadius: "8px"
                    }}
                >
                    <h3>{vehicle.brand} {vehicle.model}</h3>

                    <p>VIN : {vehicle.vin}</p>
                    <p>Année : {vehicle.manufacturingYear}</p>
                    <p>Certifié : {vehicle.isCertified ? "Oui" : "Non"}</p>
                    <p>En vente : {vehicle.isListed ? "Oui" : "Non"}</p>

                    <button onClick={() => onViewDetails(vehicle.id)}>
                        Voir les détails
                    </button>
                </div>
            ))}
        </div>
    );
}

export default VehicleList;
