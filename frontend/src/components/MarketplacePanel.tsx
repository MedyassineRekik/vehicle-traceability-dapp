
import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { getAllVehicles, type VehicleDisplay } from "../services/vehicleService";
import {
    getMarketplaceVehicles,
    listVehicle,
    cancelListing,
    buyVehicle,
    type MarketplaceVehicle
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
    onViewDetails
}: MarketplacePanelProps) {

    const [myVehicles, setMyVehicles] = useState<VehicleDisplay[]>([]);
    const [marketVehicles, setMarketVehicles] = useState<MarketplaceVehicle[]>([]);
    const [prices, setPrices] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function loadMarketplace() {
        try {
            const allVehicles = await getAllVehicles(contract);
            const listedVehicles = await getMarketplaceVehicles(contract);

            setMyVehicles(
                allVehicles.filter(
                    (vehicle) =>
                        vehicle.currentOwner.toLowerCase() ===
                        account.toLowerCase()
                )
            );

            setMarketVehicles(listedVehicles);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de charger la Marketplace."
            );
        }
    }

    useEffect(() => {
        loadMarketplace();
    }, [contract, account]);

    async function handleList(vehicleId: string) {
        try {
            setLoading(true);
            setMessage("");

            const price = prices[vehicleId];

            if (!price || !/^\d+(\.\d{1,18})?$/.test(price)) {
                throw new Error("Veuillez saisir un prix ETH valide.");
            }

            await listVehicle(contract, vehicleId, price);

            setMessage("Véhicule publié avec succès !");
            await loadMarketplace();
            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de publier le véhicule."
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

            setMessage("Annonce annulée avec succès !");
            await loadMarketplace();
            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible d'annuler l'annonce."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleBuy(vehicle: MarketplaceVehicle) {
        try {
            setLoading(true);
            setMessage("");

            if (
                vehicle.currentOwner.toLowerCase() ===
                account.toLowerCase()
            ) {
                throw new Error(
                    "Vous ne pouvez pas acheter votre propre véhicule."
                );
            }

            await buyVehicle(contract, vehicle.id, vehicle.price);

            setMessage("Achat effectué avec succès !");
            await loadMarketplace();
            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Échec de l'achat."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ marginTop: "40px" }}>
            <h2>Marketplace</h2>

            <button
                onClick={loadMarketplace}
                disabled={loading}
            >
                Actualiser la Marketplace
            </button>

            {message && <p>{message}</p>}

            <hr />

            <h3>Mes véhicules</h3>

            {myVehicles.length === 0 ? (
                <p>Vous ne possédez aucun véhicule enregistré.</p>
            ) : (
                myVehicles.map((vehicle) => (
                    <div
                        key={vehicle.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "12px",
                            borderRadius: "8px"
                        }}
                    >
                        <h4>{vehicle.brand} {vehicle.model}</h4>
                        <p>VIN : {vehicle.vin}</p>
                        <p>Certifié : {vehicle.isCertified ? "Oui" : "Non"}</p>
                        <p>En vente : {vehicle.isListed ? "Oui" : "Non"}</p>

                        <button
                            onClick={() => onViewDetails(vehicle.id)}
                        >
                            Voir les détails
                        </button>

                        {!vehicle.isCertified && (
                            <p>Ce véhicule doit être certifié avant sa mise en vente.</p>
                        )}

                        {vehicle.isCertified && !vehicle.isListed && (
                            <div style={{ marginTop: "10px" }}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.000000000000000001"
                                    placeholder="Prix en ETH"
                                    value={prices[vehicle.id] ?? ""}
                                    onChange={(e) =>
                                        setPrices({
                                            ...prices,
                                            [vehicle.id]: e.target.value
                                        })
                                    }
                                />

                                <button
                                    disabled={loading}
                                    onClick={() => handleList(vehicle.id)}
                                >
                                    Mettre en vente
                                </button>
                            </div>
                        )}

                        {vehicle.isListed && (
                            <button
                                disabled={loading}
                                onClick={() => handleCancel(vehicle.id)}
                            >
                                Annuler l'annonce
                            </button>
                        )}
                    </div>
                ))
            )}

            <hr />

            <h3>Véhicules disponibles à la vente</h3>

            {marketVehicles.length === 0 ? (
                <p>Aucun véhicule disponible pour le moment.</p>
            ) : (
                marketVehicles.map((vehicle) => (
                    <div
                        key={vehicle.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            marginBottom: "12px",
                            borderRadius: "8px"
                        }}
                    >
                        <h4>{vehicle.brand} {vehicle.model}</h4>

                        <p>VIN : {vehicle.vin}</p>
                        <p>Année : {vehicle.manufacturingYear}</p>
                        <p>Vendeur : {vehicle.currentOwner}</p>
                        <p><strong>Prix : {vehicle.price} ETH</strong></p>

                        <button
                            onClick={() => onViewDetails(vehicle.id)}
                        >
                            Consulter l'historique
                        </button>

                        <button
                            disabled={
                                loading ||
                                vehicle.currentOwner.toLowerCase() ===
                                account.toLowerCase()
                            }
                            onClick={() => handleBuy(vehicle)}
                        >
                            {vehicle.currentOwner.toLowerCase() ===
                            account.toLowerCase()
                                ? "Votre annonce"
                                : "Acheter avec MetaMask"}
                        </button>
                    </div>
                ))
            )}
        </section>
    );
}

export default MarketplacePanel;
