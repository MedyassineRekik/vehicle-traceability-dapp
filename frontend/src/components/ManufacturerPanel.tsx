
import { useState, type FormEvent } from "react";
import { Contract } from "ethers";
import {
    isManufacturer,
    registerVehicle,
    certifyVehicle
} from "../services/manufacturerService";

interface ManufacturerPanelProps {
    contract: Contract;
    account: string;
    onRefresh: () => Promise<void>;
}

function ManufacturerPanel({
    contract,
    account,
    onRefresh
}: ManufacturerPanelProps) {
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    const [vin, setVin] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [initialOwner, setInitialOwner] = useState("");

    const [vehicleId, setVehicleId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function checkRole() {
        try {
            const result = await isManufacturer(contract, account);
            setAuthorized(result);

            setMessage(
                result
                    ? "Vous êtes un fabricant autorisé."
                    : "Cette adresse n'est pas autorisée comme fabricant."
            );
        } catch {
            setMessage("Impossible de vérifier le rôle fabricant.");
        }
    }

    async function handleRegister(event: FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            if (!vin.trim() || !brand.trim() || !model.trim()) {
                throw new Error("Veuillez remplir tous les champs.");
            }

            const numericYear = Number(year);
            const currentYear = new Date().getFullYear();

            if (
                !Number.isInteger(numericYear) ||
                numericYear <= 1885 ||
                numericYear > currentYear
            ) {
                throw new Error("Année de fabrication invalide.");
            }

            const id = await registerVehicle(
                contract,
                vin,
                brand,
                model,
                numericYear,
                initialOwner
            );

            setVehicleId(id);
            setMessage(
                `Véhicule enregistré avec succès. ID : ${id}.`
            );

            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Échec de l'enregistrement."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCertify() {
        try {
            setLoading(true);
            setMessage("");

            await certifyVehicle(contract, vehicleId);

            setMessage("Véhicule certifié avec succès !");
            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Échec de la certification."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ marginTop: "30px" }}>
            <h2>Espace Fabricant</h2>

            <button onClick={checkRole}>
                Vérifier mon rôle Fabricant
            </button>

            {authorized === false && (
                <p>Accès refusé : fabricant non autorisé.</p>
            )}

            {authorized === true && (
                <>
                    <h3>Enregistrer un véhicule</h3>

                    <form onSubmit={handleRegister}>
                        <div>
                            <label>VIN</label><br />
                            <input
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Marque</label><br />
                            <input
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Modèle</label><br />
                            <input
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Année de fabrication</label><br />
                            <input
                                type="number"
                                min="1886"
                                max={new Date().getFullYear()}
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Adresse du propriétaire initial</label><br />
                            <input
                                value={initialOwner}
                                onChange={(e) => setInitialOwner(e.target.value)}
                                placeholder="0x..."
                                required
                                style={{ width: "350px" }}
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer le véhicule"}
                        </button>
                    </form>

                    {vehicleId && (
                        <div style={{ marginTop: "20px" }}>
                            <p>Identifiant du véhicule : {vehicleId}</p>

                            <button
                                onClick={handleCertify}
                                disabled={loading}
                            >
                                {loading ? "Traitement..." : "Certifier ce véhicule"}
                            </button>
                        </div>
                    )}
                </>
            )}

            {message && <p>{message}</p>}
        </section>
    );
}

export default ManufacturerPanel;
