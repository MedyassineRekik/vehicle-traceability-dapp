
import { useEffect, useState, type FormEvent } from "react";
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
    const [checking, setChecking] = useState(true);

    const [vin, setVin] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [initialOwner, setInitialOwner] = useState("");

    const [vehicleId, setVehicleId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [certified, setCertified] = useState(false);

    async function checkRole() {
        try {
            setChecking(true);

            const result = await isManufacturer(contract, account);
            setAuthorized(result);

            if (!result) {
                setMessage("Cette adresse n'est pas autorisée comme fabricant.");
                setMessageType("error");
            } else {
                setMessage("");
                setMessageType("");
            }
        } catch {
            setAuthorized(null);
            setMessage("Impossible de vérifier le rôle fabricant.");
            setMessageType("error");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        checkRole();
    }, [contract, account]);

    async function handleRegister(event: FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");
            setVehicleId("");
            setCertified(false);

            const numericYear = Number(year);
            const currentYear = new Date().getFullYear();

            if (!vin.trim() || !brand.trim() || !model.trim() || !year || !initialOwner.trim()) {
                throw new Error("Veuillez remplir tous les champs.");
            }

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
            setMessage(`Véhicule enregistré avec succès. Identifiant : ${id}. Vous pouvez maintenant le certifier.`);
            setMessageType("success");

            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Échec de l'enregistrement du véhicule."
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    async function handleCertify() {
        if (!vehicleId) return;

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");

            await certifyVehicle(contract, vehicleId);

            setCertified(true);
            setMessage("Le véhicule a été certifié avec succès !");
            setMessageType("success");

            await onRefresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Échec de la certification."
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    if (checking) {
        return (
            <section className="manufacturer-state">
                <div className="loading-spinner"></div>
                <p>Vérification des autorisations fabricant...</p>
            </section>
        );
    }

    if (authorized !== true) {
        return (
            <section className="manufacturer-access-denied">
                <div className="manufacturer-access-icon">🏭</div>
                <h2>Accès fabricant requis</h2>
                <p>
                    Seules les adresses autorisées par l'administrateur
                    peuvent enregistrer et certifier des véhicules.
                </p>

                {message && (
                    <div className="manufacturer-message manufacturer-message-error">
                        {message}
                    </div>
                )}

                <button
                    className="manufacturer-secondary-button"
                    onClick={checkRole}
                >
                    Vérifier à nouveau
                </button>
            </section>
        );
    }

    return (
        <section className="manufacturer-page">

            <div className="manufacturer-welcome">
                <div>
                    <span className="manufacturer-eyebrow">
                        ESPACE PROFESSIONNEL
                    </span>
                    <h2>Espace Fabricant</h2>
                    <p>
                        Enregistrez et certifiez les véhicules afin de garantir
                        leur origine et leur traçabilité sur la blockchain.
                    </p>
                </div>

                <div className="manufacturer-role-indicator">
                    <span></span>
                    Fabricant autorisé
                </div>
            </div>

            <div className="manufacturer-account-card">
                <div className="manufacturer-account-icon">🏭</div>
                <div>
                    <span>Portefeuille fabricant connecté</span>
                    <strong title={account}>{account}</strong>
                </div>
                <span className="manufacturer-account-badge">AUTHORIZED</span>
            </div>

            <div className="manufacturer-process">
                <div className={`manufacturer-process-step ${vehicleId ? "step-completed" : "step-active"}`}>
                    <span className="manufacturer-step-number">
                        {vehicleId ? "✓" : "1"}
                    </span>
                    <div>
                        <strong>Enregistrement</strong>
                        <small>Déclarer les informations du véhicule</small>
                    </div>
                </div>

                <div className="manufacturer-process-line"></div>

                <div className={`manufacturer-process-step ${certified ? "step-completed" : vehicleId ? "step-active" : ""}`}>
                    <span className="manufacturer-step-number">
                        {certified ? "✓" : "2"}
                    </span>
                    <div>
                        <strong>Certification</strong>
                        <small>Valider l'origine du véhicule</small>
                    </div>
                </div>
            </div>

            <div className="manufacturer-form-panel">
                <div className="manufacturer-panel-heading">
                    <div>
                        <span className="manufacturer-eyebrow">NOUVEAU VÉHICULE</span>
                        <h3>Enregistrer un véhicule</h3>
                        <p>
                            Renseignez les informations officielles du véhicule.
                        </p>
                    </div>
                    <span className="manufacturer-panel-icon">🚘</span>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="manufacturer-form-grid">

                        <div className="manufacturer-form-field">
                            <label htmlFor="manufacturer-vin">Numéro VIN</label>
                            <input
                                id="manufacturer-vin"
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                placeholder="Ex. TESTVIN202700001"
                                required
                                disabled={loading}
                            />
                            <small>Identifiant unique du véhicule.</small>
                        </div>

                        <div className="manufacturer-form-field">
                            <label htmlFor="manufacturer-brand">Marque</label>
                            <input
                                id="manufacturer-brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="Ex. Toyota"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="manufacturer-form-field">
                            <label htmlFor="manufacturer-model">Modèle</label>
                            <input
                                id="manufacturer-model"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="Ex. Corolla"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="manufacturer-form-field">
                            <label htmlFor="manufacturer-year">Année de fabrication</label>
                            <input
                                id="manufacturer-year"
                                type="number"
                                min="1886"
                                max={new Date().getFullYear()}
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="Ex. 2022"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="manufacturer-form-field manufacturer-owner-field">
                            <label htmlFor="manufacturer-owner">
                                Adresse du propriétaire initial
                            </label>
                            <input
                                id="manufacturer-owner"
                                value={initialOwner}
                                onChange={(e) => setInitialOwner(e.target.value)}
                                placeholder="0x..."
                                required
                                disabled={loading}
                            />
                            <small>
                                Adresse Ethereum du premier propriétaire du véhicule.
                            </small>
                        </div>

                    </div>

                    <div className="manufacturer-form-footer">
                        <p>
                            <span>*</span> Tous les champs sont obligatoires.
                        </p>

                        <button
                            type="submit"
                            className="manufacturer-submit-button"
                            disabled={loading || certified}
                        >
                            {loading ? "Traitement..." : "＋ Enregistrer le véhicule"}
                        </button>
                    </div>
                </form>
            </div>

            {vehicleId && (
                <div className="manufacturer-certification-panel">
                    <div className="manufacturer-certification-info">
                        <span className="manufacturer-certification-icon">
                            {certified ? "✓" : "🛡️"}
                        </span>

                        <div>
                            <span className="manufacturer-eyebrow">
                                {certified ? "CERTIFICATION TERMINÉE" : "ÉTAPE SUIVANTE"}
                            </span>
                            <h3>
                                {certified
                                    ? "Véhicule certifié"
                                    : "Certifier le véhicule"}
                            </h3>
                            <p>
                                Identifiant du véhicule : <strong>#{vehicleId}</strong>
                            </p>
                        </div>
                    </div>

                    {certified ? (
                        <button
                            className="manufacturer-secondary-button"
                            onClick={resetVehicleForm}
                        >
                            + Enregistrer un autre véhicule
                        </button>
                    ) : (
                        <button
                            className="manufacturer-certify-button"
                            onClick={handleCertify}
                            disabled={loading}
                        >
                            {loading ? "Certification..." : "Certifier avec MetaMask"}
                        </button>
                    )}
                </div>
            )}

            {message && (
                <div className={`manufacturer-message ${
                    messageType === "success"
                        ? "manufacturer-message-success"
                        : "manufacturer-message-error"
                }`}>
                    <span>{messageType === "success" ? "✓" : "!"}</span>
                    {message}
                </div>
            )}

            <div className="manufacturer-security-note">
                <span>⛓️</span>
                <div>
                    <strong>Certification sur la blockchain</strong>
                    <p>
                        L'enregistrement et la certification sont effectués
                        par des transactions signées avec MetaMask. Une fois
                        enregistrées, ces informations ne peuvent pas être
                        modifiées par l'interface.
                    </p>
                </div>
            </div>

        </section>
    );
    function resetVehicleForm() {
        setVin("");
        setBrand("");
        setModel("");
        setYear("");
        setInitialOwner("");
        setVehicleId("");
        setCertified(false);
        setMessage("");
        setMessageType("");
    }
}

export default ManufacturerPanel;
