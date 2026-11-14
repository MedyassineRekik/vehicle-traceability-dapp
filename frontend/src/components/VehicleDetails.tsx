
import { useEffect, useState } from "react";
import { Contract } from "ethers";
import {
    getVehicleDetails,
    type VehicleDetails as VehicleDetailsType
} from "../services/vehicleDetailsService";

interface VehicleDetailsProps {
    contract: Contract;
    vehicleId: string;
    onBack: () => void;
}

function shortenAddress(address: string) {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function VehicleDetails({
    contract,
    vehicleId,
    onBack
}: VehicleDetailsProps) {
    const [details, setDetails] = useState<VehicleDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDetails() {
            try {
                setLoading(true);
                setError("");

                const result = await getVehicleDetails(contract, vehicleId);

                if (active) {
                    setDetails(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger les détails du véhicule."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDetails();

        return () => {
            active = false;
        };
    }, [contract, vehicleId]);

    if (loading) {
        return (
            <div className="details-state">
                <div className="loading-spinner"></div>
                <p>Chargement des informations du véhicule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="details-state details-error">
                <div className="details-state-icon">!</div>
                <h3>Impossible de charger le véhicule</h3>
                <p>{error}</p>
                <button onClick={onBack}>Retour</button>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="details-state">
                <h3>Véhicule introuvable</h3>
                <button onClick={onBack}>Retour</button>
            </div>
        );
    }

    return (
        <section className="vehicle-details-page">

            <div className="details-header">
                <button className="details-back-button" onClick={onBack}>
                    ← Retour
                </button>

                <div className="details-title-row">
                    <div>
                        <span className="details-eyebrow">
                            DOSSIER DU VÉHICULE
                        </span>
                        <h2>{details.brand} {details.model}</h2>
                        <p className="details-vin">
                            VIN : {details.vin}
                        </p>
                    </div>

                    <div className="details-status-group">
                        <span className={
                            details.isCertified
                                ? "status-badge status-certified"
                                : "status-badge status-pending"
                        }>
                            {details.isCertified ? "✓ Certifié" : "Non certifié"}
                        </span>

                        <span className={
                            details.isListed
                                ? "status-badge status-listed"
                                : "status-badge status-not-listed"
                        }>
                            {details.isListed ? "En vente" : "Non disponible à la vente"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="details-overview-grid">

                <div className="details-overview-card">
                    <span className="overview-icon">🚘</span>
                    <div>
                        <p>Année de fabrication</p>
                        <h3>{details.manufacturingYear}</h3>
                    </div>
                </div>

                <div className="details-overview-card">
                    <span className="overview-icon">👤</span>
                    <div>
                        <p>Propriétaire actuel</p>
                        <h3 className="address-value" title={details.currentOwner}>
                            {shortenAddress(details.currentOwner)}
                        </h3>
                    </div>
                </div>

                <div className="details-overview-card">
                    <span className="overview-icon">🛡️</span>
                    <div>
                        <p>Certification</p>
                        <h3>{details.isCertified ? "Validée" : "En attente"}</h3>
                    </div>
                </div>

                <div className="details-overview-card">
                    <span className="overview-icon">💰</span>
                    <div>
                        <p>Prix actuel</p>
                        <h3>
                            {details.isListed
                                ? `${details.price} ETH`
                                : "Non fixé"}
                        </h3>
                    </div>
                </div>

            </div>

            <div className="details-content-grid">

                <div className="details-panel vehicle-info-panel">
                    <div className="details-panel-heading">
                        <div>
                            <span className="details-section-label">IDENTITÉ</span>
                            <h3>Informations générales</h3>
                        </div>
                        <span className="panel-icon">📋</span>
                    </div>

                    <div className="details-info-list">
                        <div className="details-info-row">
                            <span>Numéro VIN</span>
                            <strong>{details.vin}</strong>
                        </div>

                        <div className="details-info-row">
                            <span>Marque</span>
                            <strong>{details.brand}</strong>
                        </div>

                        <div className="details-info-row">
                            <span>Modèle</span>
                            <strong>{details.model}</strong>
                        </div>

                        <div className="details-info-row">
                            <span>Année de fabrication</span>
                            <strong>{details.manufacturingYear}</strong>
                        </div>

                        <div className="details-info-row">
                            <span>Fabricant</span>
                            <strong className="address-value" title={details.manufacturer}>
                                {shortenAddress(details.manufacturer)}
                            </strong>
                        </div>

                        <div className="details-info-row">
                            <span>Date de certification</span>
                            <strong>{details.certificationDate}</strong>
                        </div>

                        <div className="details-info-row">
                            <span>État de certification</span>
                            <strong className={details.isCertified ? "text-success" : "text-warning"}>
                                {details.isCertified ? "Certifié" : "Non certifié"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="details-panel ownership-panel">
                    <div className="details-panel-heading">
                        <div>
                            <span className="details-section-label">TRAÇABILITÉ</span>
                            <h3>Historique des propriétaires</h3>
                        </div>
                        <span className="panel-icon">🔄</span>
                    </div>

                    {details.ownershipHistory.length === 0 ? (
                        <div className="details-empty-state">
                            <span>📜</span>
                            <p>Aucun transfert de propriété enregistré.</p>
                            <small>Le véhicule n'a pas encore changé de propriétaire depuis son enregistrement.</small>
                        </div>
                    ) : (
                        <div className="ownership-timeline">
                            {details.ownershipHistory.map((record, index) => (
                                <div className="ownership-timeline-item" key={index}>
                                    <div className="timeline-marker">
                                        <span></span>
                                    </div>

                                    <div className="timeline-card">
                                        <div className="timeline-card-top">
                                            <strong>Transfert #{index + 1}</strong>
                                            <span>{record.timestamp}</span>
                                        </div>

                                        <div className="timeline-address">
                                            <span>Ancien propriétaire</span>
                                            <strong title={record.previousOwner}>
                                                {shortenAddress(record.previousOwner)}
                                            </strong>
                                        </div>

                                        <div className="timeline-arrow">↓</div>

                                        <div className="timeline-address new-owner">
                                            <span>Nouveau propriétaire</span>
                                            <strong title={record.newOwner}>
                                                {shortenAddress(record.newOwner)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="details-panel insurance-panel">
                <div className="details-panel-heading">
                    <div>
                        <span className="details-section-label">SUIVI DU VÉHICULE</span>
                        <h3>Historique d'assurance</h3>
                        <p className="details-panel-description">
                            Événements déclarés par les compagnies d'assurance et enregistrés sur la blockchain.
                        </p>
                    </div>
                    <span className="panel-icon">🛡️</span>
                </div>

                {details.insuranceHistory.length === 0 ? (
                    <div className="details-empty-state">
                        <span>🛡️</span>
                        <p>Aucun événement d'assurance déclaré.</p>
                        <small>L'historique ne contient actuellement aucune déclaration.</small>
                    </div>
                ) : (
                    <div className="insurance-events-grid">
                        {details.insuranceHistory.map((event, index) => (
                            <article className="insurance-event-card" key={index}>
                                <div className="insurance-event-header">
                                    <span className="insurance-event-number">
                                        ÉVÉNEMENT #{index + 1}
                                    </span>
                                    <span className="insurance-event-type">
                                        {event.eventType}
                                    </span>
                                </div>

                                <p className="insurance-event-description">
                                    {event.description}
                                </p>

                                <div className="insurance-event-details">
                                    <div>
                                        <span>Date de l'événement</span>
                                        <strong>{event.eventDate}</strong>
                                    </div>

                                    <div>
                                        <span>Enregistré sur la blockchain</span>
                                        <strong>{event.recordedAt}</strong>
                                    </div>

                                    <div>
                                        <span>Adresse de l'assureur</span>
                                        <strong title={event.insurer}>
                                            {shortenAddress(event.insurer)}
                                        </strong>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="details-blockchain-note">
                <span>⛓️</span>
                <p>
                    Les informations et les historiques présentés proviennent
                    du smart contract et sont enregistrés sur la blockchain.
                </p>
            </div>

        </section>
    );
}

export default VehicleDetails;
