
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

                const result = await getVehicleDetails(
                    contract,
                    vehicleId
                );

                if (active) {
                    setDetails(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger les détails."
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
        return <p>Chargement des informations du véhicule...</p>;
    }

    if (error) {
        return (
            <section>
                <p>{error}</p>
                <button onClick={onBack}>Retour</button>
            </section>
        );
    }

    if (!details) {
        return <p>Véhicule introuvable.</p>;
    }

    return (
        <section style={{ marginTop: "30px" }}>
            <button onClick={onBack}>← Retour à la liste</button>

            <h2>
                {details.brand} {details.model}
            </h2>

            <h3>Informations générales</h3>

            <p><strong>VIN :</strong> {details.vin}</p>
            <p><strong>Année :</strong> {details.manufacturingYear}</p>
            <p><strong>Fabricant :</strong> {details.manufacturer}</p>
            <p><strong>Propriétaire actuel :</strong> {details.currentOwner}</p>
            <p><strong>Date de certification :</strong> {details.certificationDate}</p>
            <p><strong>Certifié :</strong> {details.isCertified ? "Oui" : "Non"}</p>
            <p><strong>En vente :</strong> {details.isListed ? "Oui" : "Non"}</p>

            {details.isListed && (
                <p><strong>Prix :</strong> {details.price} ETH</p>
            )}

            <hr />

            <h3>Historique des propriétaires</h3>

            {details.ownershipHistory.length === 0 ? (
                <p>Aucun transfert de propriété enregistré.</p>
            ) : (
                <ol>
                    {details.ownershipHistory.map((record, index) => (
                        <li key={index} style={{ marginBottom: "15px" }}>
                            <p>
                                <strong>Ancien propriétaire :</strong>{" "}
                                {record.previousOwner}
                            </p>
                            <p>
                                <strong>Nouveau propriétaire :</strong>{" "}
                                {record.newOwner}
                            </p>
                            <p>
                                <strong>Date du transfert :</strong>{" "}
                                {record.timestamp}
                            </p>
                        </li>
                    ))}
                </ol>
            )}

            <hr />

            <h3>Historique d'assurance</h3>

            {details.insuranceHistory.length === 0 ? (
                <p>Aucun événement d'assurance déclaré.</p>
            ) : (
                <div>
                    {details.insuranceHistory.map((event, index) => (
                        <div
                            key={index}
                            style={{
                                border: "1px solid #ccc",
                                padding: "12px",
                                marginBottom: "12px",
                                borderRadius: "8px"
                            }}
                        >
                            <h4>{event.eventType}</h4>
                            <p>{event.description}</p>
                            <p>
                                <strong>Date de l'événement :</strong>{" "}
                                {event.eventDate}
                            </p>
                            <p>
                                <strong>Enregistré sur la blockchain :</strong>{" "}
                                {event.recordedAt}
                            </p>
                            <p>
                                <strong>Assureur :</strong> {event.insurer}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default VehicleDetails;
