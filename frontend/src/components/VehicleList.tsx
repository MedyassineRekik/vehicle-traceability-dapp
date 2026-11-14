
import type { VehicleDisplay } from "../services/vehicleService";
import { getVehicleImage } from "../utils/vehicleImages";

interface VehicleListProps {
  vehicles: VehicleDisplay[];
  onViewDetails: (vehicleId: string) => void;
}

function VehicleList({
  vehicles,
  onViewDetails,
}: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <div className="marketplace-empty vehicle-list-empty">
        <div className="empty-icon">◇</div>
        <h3>Aucun véhicule enregistré</h3>
        <p>
          Aucun véhicule n'a encore été enregistré sur la blockchain.
          Actualisez la liste ou revenez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-summary">
        <div>
          <span className="section-kicker">REGISTRE BLOCKCHAIN</span>
          <h3>Véhicules enregistrés</h3>
          <p>Consultez les informations et la traçabilité de chaque véhicule.</p>
        </div>

        <span className="count-badge">
          {vehicles.length} véhicule(s)
        </span>
      </div>

      <div className="vehicle-card-grid">
        {vehicles.map((vehicle) => (
          <article className="vehicle-card" key={vehicle.id}>
            <div className="vehicle-card-top">
              <span className="vehicle-category">
                IDENTIFIANT #{vehicle.id}
              </span>

              <span
                className={`status-badge ${
                  vehicle.isCertified ? "status-certified" : "status-pending"
                }`}
              >
                <span className="status-badge-dot" />
                {vehicle.isCertified ? "Certifié" : "Non certifié"}
              </span>
            </div>

            <div className="vehicle-card-illustration">
                <img
                    src={getVehicleImage(vehicle.brand, vehicle.model)}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    onError={(event) => {
                    event.currentTarget.src = "/images/vehicles/default-car.jpg";
                    }}
                />
                <span className="vehicle-year">
                    {vehicle.manufacturingYear}
                </span>
                </div>

            <div className="vehicle-card-body">
              <h3>
                {vehicle.brand} {vehicle.model}
              </h3>

              <p className="vehicle-vin">VIN : {vehicle.vin}</p>

              <div className="vehicle-card-divider" />

              <div className="vehicle-meta-row">
                <span>Année de fabrication</span>
                <strong>{vehicle.manufacturingYear}</strong>
              </div>

              <div className="vehicle-meta-row">
                <span>Statut de certification</span>
                <strong
                  className={
                    vehicle.isCertified ? "text-listed" : "text-muted"
                  }
                >
                  {vehicle.isCertified ? "Certifié" : "En attente"}
                </strong>
              </div>

              <div className="vehicle-meta-row">
                <span>Disponibilité</span>
                <strong
                  className={
                    vehicle.isListed ? "text-listed" : "text-muted"
                  }
                >
                  {vehicle.isListed ? "En vente" : "Non disponible"}
                </strong>
              </div>

              <div className="vehicle-card-actions">
                <button
                  className="primary-action full-width"
                  onClick={() => onViewDetails(vehicle.id)}
                >
                  Consulter les détails et l'historique
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default VehicleList;
