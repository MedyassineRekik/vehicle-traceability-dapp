
import { useEffect, useState } from "react";
import { Contract } from "ethers";

import {
    isAdmin,
    authorizeManufacturer,
    revokeManufacturer,
    authorizeInsurer,
    revokeInsurer
} from "../services/adminService";

interface AdminPanelProps {
    contract: Contract;
    account: string;
}

type AdminAction =
    | "authorizeManufacturer"
    | "revokeManufacturer"
    | "authorizeInsurer"
    | "revokeInsurer";

function AdminPanel({ contract, account }: AdminPanelProps) {
    const [address, setAddress] = useState("");
    const [admin, setAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    async function checkAdmin() {
        try {
            setChecking(true);
            setMessage("");

            const result = await isAdmin(contract, account);
            setAdmin(result);
        } catch {
            setAdmin(null);
            setMessage("Impossible de vérifier le rôle Admin.");
            setMessageType("error");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        checkAdmin();
    }, [contract, account]);

    async function executeAction(action: AdminAction) {
        if (!address.trim()) {
            setMessage("Veuillez saisir une adresse Ethereum.");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");

            switch (action) {
                case "authorizeManufacturer":
                    await authorizeManufacturer(contract, address);
                    setMessage("Le fabricant a été autorisé avec succès.");
                    break;

                case "revokeManufacturer":
                    await revokeManufacturer(contract, address);
                    setMessage("L'autorisation du fabricant a été révoquée.");
                    break;

                case "authorizeInsurer":
                    await authorizeInsurer(contract, address);
                    setMessage("La compagnie d'assurance a été autorisée avec succès.");
                    break;

                case "revokeInsurer":
                    await revokeInsurer(contract, address);
                    setMessage("L'autorisation de la compagnie d'assurance a été révoquée.");
                    break;
            }

            setMessageType("success");
            setAddress("");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "La transaction a échoué."
            );
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    if (checking) {
        return (
            <section className="admin-state">
                <div className="loading-spinner"></div>
                <p>Vérification des autorisations administrateur...</p>
            </section>
        );
    }

    if (admin !== true) {
        return (
            <section className="admin-access-denied">
                <div className="admin-access-icon">🔒</div>
                <h2>Accès administrateur requis</h2>
                <p>
                    Ce panneau est réservé au compte disposant du rôle
                    administrateur sur le smart contract.
                </p>

                {message && (
                    <div className="admin-message admin-message-error">
                        {message}
                    </div>
                )}

                <button className="admin-secondary-button" onClick={checkAdmin}>
                    Vérifier à nouveau
                </button>
            </section>
        );
    }

    return (
        <section className="admin-page">

            <div className="admin-welcome">
                <div className="admin-welcome-content">
                    <span className="admin-eyebrow">
                        ESPACE DE CONTRÔLE
                    </span>
                    <h2>Administration</h2>
                    <p>
                        Gérez les autorisations des fabricants et des
                        compagnies d'assurance sur la blockchain.
                    </p>
                </div>

                <div className="admin-role-indicator">
                    <span className="admin-role-dot"></span>
                    Administrateur actif
                </div>
            </div>

            <div className="admin-account-card">
                <div className="admin-account-icon">👤</div>

                <div className="admin-account-info">
                    <span>Compte administrateur connecté</span>
                    <strong title={account}>{account}</strong>
                </div>

                <span className="admin-account-badge">ADMIN</span>
            </div>

            <div className="admin-section-heading">
                <div>
                    <span className="admin-eyebrow">GESTION DES RÔLES</span>
                    <h3>Gestion des autorisations</h3>
                    <p>
                        Ajoutez ou retirez les permissions des acteurs
                        autorisés à interagir avec la plateforme.
                    </p>
                </div>
            </div>

            <div className="admin-address-panel">
                <label htmlFor="admin-wallet-address">
                    Adresse du portefeuille Ethereum
                </label>

                <input
                    id="admin-wallet-address"
                    type="text"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                />

                <small>
                    Saisissez l'adresse MetaMask de l'acteur dont vous
                    souhaitez modifier les autorisations.
                </small>
            </div>

            {message && (
                <div className={`admin-message ${
                    messageType === "success"
                        ? "admin-message-success"
                        : "admin-message-error"
                }`}>
                    <span>{messageType === "success" ? "✓" : "!"}</span>
                    {message}
                </div>
            )}

            <div className="admin-role-grid">

                <div className="admin-role-card">
                    <div className="admin-role-card-header">
                        <div className="admin-role-card-icon manufacturer-icon">
                            🏭
                        </div>
                        <span className="admin-role-tag">MANUFACTURER_ROLE</span>
                    </div>

                    <h3>Fabricants</h3>

                    <p>
                        Autorisez les fabricants à enregistrer et certifier
                        les véhicules sur la blockchain.
                    </p>

                    <div className="admin-card-actions">
                        <button
                            className="admin-authorize-button"
                            disabled={loading || !address.trim()}
                            onClick={() => executeAction("authorizeManufacturer")}
                        >
                            {loading ? "Transaction..." : "✓ Autoriser"}
                        </button>

                        <button
                            className="admin-revoke-button"
                            disabled={loading || !address.trim()}
                            onClick={() => executeAction("revokeManufacturer")}
                        >
                            Révoquer
                        </button>
                    </div>
                </div>

                <div className="admin-role-card">
                    <div className="admin-role-card-header">
                        <div className="admin-role-card-icon insurer-icon">
                            🛡️
                        </div>
                        <span className="admin-role-tag">INSURER_ROLE</span>
                    </div>

                    <h3>Compagnies d'assurance</h3>

                    <p>
                        Autorisez les assureurs à déclarer des événements
                        liés à l'historique des véhicules.
                    </p>

                    <div className="admin-card-actions">
                        <button
                            className="admin-authorize-button"
                            disabled={loading || !address.trim()}
                            onClick={() => executeAction("authorizeInsurer")}
                        >
                            {loading ? "Transaction..." : "✓ Autoriser"}
                        </button>

                        <button
                            className="admin-revoke-button"
                            disabled={loading || !address.trim()}
                            onClick={() => executeAction("revokeInsurer")}
                        >
                            Révoquer
                        </button>
                    </div>
                </div>

            </div>

            <div className="admin-security-note">
                <span>🔐</span>
                <div>
                    <strong>Contrôle des accès sur la blockchain</strong>
                    <p>
                        Chaque modification nécessite une transaction signée
                        par le portefeuille administrateur. Les permissions
                        sont contrôlées directement par le smart contract.
                    </p>
                </div>
            </div>

        </section>
    );
}

export default AdminPanel;
