import type { VehicleDisplay } from "../services/vehicleService";

interface VehicleListProps {
    vehicles: VehicleDisplay[];
}

function VehicleList({ vehicles }: VehicleListProps) {
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
                    <p>Propriétaire : {vehicle.currentOwner}</p>
                    <p>Certifié : {vehicle.isCertified ? "Oui" : "Non"}</p>
                    <p>En vente : {vehicle.isListed ? "Oui" : "Non"}</p>
                    <p>Prix : {vehicle.price} ETH</p>
                    <p>Date de certification : {vehicle.certificationDate}</p>
                </div>
            ))}
        </div>
    );
}

export default VehicleList;
