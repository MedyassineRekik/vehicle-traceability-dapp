
import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { getVehicleImage } from "../utils/vehicleImages";

import {
  getAllVehicles,
  type VehicleDisplay,
} from "../services/vehicleService";

import {
  getMarketplaceVehicles,
  listVehicle,
  cancelListing,
  buyVehicle,
  type MarketplaceVehicle,
} from "../services/marketplaceService";

interface MarketplacePanelProps {
  contract: Contract;
  account: string;
  onRefresh: () => Promise<void>;
  onViewDetails: (vehicleId: string) => void;
}

function MarketplacePanel({
  contract,
  account,
  onRefresh,
  onViewDetails,
}: MarketplacePanelProps) {
  const [myVehicles, setMyVehicles] = useState<VehicleDisplay[]>([]);
  const [marketVehicles, setMarketVehicles] = useState<MarketplaceVehicle[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  async function loadMarketplace() {
    try {
      const [allVehicles, listedVehicles] = await Promise.all([
        getAllVehicles(contract),
        getMarketplaceVehicles(contract),
      ]);

      setMyVehicles(
        allVehicles.filter(
          (vehicle) =>
            vehicle.currentOwner.toLowerCase() === account.toLowerCase()
        )
      );

      setMarketVehicles(listedVehicles);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger la Marketplace."
      );
      setMessageType("error");
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    void loadMarketplace();
  }, [contract, account]);

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function handleList(vehicleId: string) {
    try {
      setLoading(true);
      setMessage("");

      const price = prices[vehicleId]?.trim();

      if (!price || !/^\d+(\.\d{1,18})?$/.test(price)) {
        throw new Error("Veuillez saisir un prix ETH valide (maximum 18 décimales).");
      }

      if (Number(price) <= 0) {
        throw new Error("Le prix doit être supérieur à zéro.");
      }

      await listVehicle(contract, vehicleId, price);

      showMessage("Votre véhicule a été publié avec succès !", "success");
      await loadMarketplace();
      await onRefresh();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Impossible de publier le véhicule.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(vehicleId: string) {
    try {
      setLoading(true);
      setMessage("");

      await cancelListing(contract, vehicleId);

      showMessage("Votre annonce a été annulée avec succès.", "success");
      await loadMarketplace();
      await onRefresh();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Impossible d'annuler l'annonce.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(vehicle: MarketplaceVehicle) {
    try {
      setLoading(true);
      setMessage("");

      if (vehicle.currentOwner.toLowerCase() === account.toLowerCase()) {
        throw new Error("Vous ne pouvez pas acheter votre propre véhicule.");
      }

      await buyVehicle(contract, vehicle.id, vehicle.price);

      showMessage("Achat effectué avec succès !", "success");
      await loadMarketplace();
      await onRefresh();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Échec de l'achat.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function shortAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  if (initialLoading) {
    return (
      <section className="marketplace-section">
        <div className="marketplace-loading">
          <div className="loading-spinner" />
          <p>Chargement de la Marketplace...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-section">
      <div className="marketplace-toolbar">
        <div>
          <div className="marketplace-overline">ACHAT & VENTE</div>
          <h2>Explorez les véhicules</h2>
          <p>
            Achetez ou mettez en vente des véhicules certifiés sur la blockchain.
          </p>
        </div>

        <button
          className="marketplace-refresh"
          onClick={() => {
            setInitialLoading(true);
            void loadMarketplace();
          }}
          disabled={loading}
        >
          ↻ Actualiser
        </button>
      </div>

      {message && (
        <div className={`marketplace-message ${messageType}`}>
          <span>{messageType === "success" ? "✓" : "!"}</span>
          <p>{message}</p>
          <button onClick={() => setMessage("")} aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      {/* MES VÉHICULES */}

      <div className="marketplace-section-heading">
        <div>
          <span className="section-kicker">ESPACE PERSONNEL</span>
          <h3>Mes véhicules</h3>
          <p>Gérez vos véhicules et vos annonces de vente.</p>
        </div>

        <span className="count-badge">{myVehicles.length} véhicule(s)</span>
      </div>

      {myVehicles.length === 0 ? (
        <div className="marketplace-empty">
          <div className="empty-icon">◇</div>
          <h3>Aucun véhicule pour le moment</h3>
          <p>
            Vous ne possédez actuellement aucun véhicule enregistré sur la
            blockchain.
          </p>
        </div>
      ) : (
        <div className="vehicle-card-grid">
          {myVehicles.map((vehicle) => (
            <article className="vehicle-card owner-card" key={vehicle.id}>
              <div className="vehicle-card-top">
                <span className="vehicle-category">MON VÉHICULE</span>

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
                  <span>Statut de l'annonce</span>
                  <strong className={vehicle.isListed ? "text-listed" : "text-muted"}>
                    {vehicle.isListed ? "En vente" : "Non publié"}
                  </strong>
                </div>

                <div className="vehicle-card-actions">
                  <button
                    className="secondary-action"
                    onClick={() => onViewDetails(vehicle.id)}
                  >
                    Voir les détails
                  </button>
                </div>

                {!vehicle.isCertified && (
                  <div className="vehicle-hint">
                    Ce véhicule doit être certifié par son fabricant avant sa
                    mise en vente.
                  </div>
                )}

                {vehicle.isCertified && !vehicle.isListed && (
                  <div className="listing-form">
                    <label htmlFor={`price-${vehicle.id}`}>
                      Prix de vente (ETH)
                    </label>

                    <div className="price-input-wrapper">
                      <input
                        id={`price-${vehicle.id}`}
                        type="number"
                        min="0"
                        step="0.000000000000000001"
                        placeholder="Ex. 2.5"
                        value={prices[vehicle.id] ?? ""}
                        onChange={(event) =>
                          setPrices((previous) => ({
                            ...previous,
                            [vehicle.id]: event.target.value,
                          }))
                        }
                        disabled={loading}
                      />
                      <span>ETH</span>
                    </div>

                    <button
                      className="primary-action full-width"
                      disabled={loading}
                      onClick={() => void handleList(vehicle.id)}
                    >
                      {loading ? "Transaction en cours..." : "Mettre en vente"}
                    </button>
                  </div>
                )}

                {vehicle.isListed && (
                  <button
                    className="danger-action full-width"
                    disabled={loading}
                    onClick={() => void handleCancel(vehicle.id)}
                  >
                    {loading ? "Transaction en cours..." : "Annuler l'annonce"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MARKETPLACE */}

      <div className="marketplace-section-heading public-market-heading">
        <div>
          <span className="section-kicker">MARCHÉ PUBLIC</span>
          <h3>Véhicules disponibles à la vente</h3>
          <p>Découvrez les véhicules proposés par les autres propriétaires.</p>
        </div>

        <span className="count-badge">{marketVehicles.length} annonce(s)</span>
      </div>

      {marketVehicles.length === 0 ? (
        <div className="marketplace-empty">
          <div className="empty-icon">⌕</div>
          <h3>Aucune annonce disponible</h3>
          <p>
            Il n'y a actuellement aucun véhicule proposé à la vente. Revenez
            plus tard pour découvrir de nouvelles annonces.
          </p>
        </div>
      ) : (
        <div className="vehicle-card-grid">
          {marketVehicles.map((vehicle) => {
            const isMyListing =
              vehicle.currentOwner.toLowerCase() === account.toLowerCase();

            return (
              <article className="vehicle-card" key={vehicle.id}>
                <div className="vehicle-card-top">
                  <span className="vehicle-category">VÉHICULE CERTIFIÉ</span>
                  <span className="status-badge status-listed">
                    <span className="status-badge-dot" />
                    Disponible
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

                  <div className="vehicle-price-block">
                    <span>Prix demandé</span>
                    <strong>
                      {vehicle.price} <small>ETH</small>
                    </strong>
                  </div>

                  <div className="vehicle-meta-row seller-row">
                    <span>Vendeur</span>
                    <strong title={vehicle.currentOwner}>
                      {shortAddress(vehicle.currentOwner)}
                    </strong>
                  </div>

                  <div className="vehicle-card-actions">
                    <button
                      className="secondary-action"
                      onClick={() => onViewDetails(vehicle.id)}
                    >
                      Consulter l'historique
                    </button>
                  </div>

                  <button
                    className={`primary-action full-width ${
                      isMyListing ? "own-listing-button" : ""
                    }`}
                    disabled={loading || isMyListing}
                    onClick={() => void handleBuy(vehicle)}
                  >
                    {loading
                      ? "Transaction en cours..."
                      : isMyListing
                        ? "Votre annonce"
                        : "Acheter avec MetaMask"}
                  </button>

                  {!isMyListing && (
                    <p className="transaction-hint">
                      Le paiement et le transfert de propriété seront confirmés
                      par MetaMask.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MarketplacePanel;
