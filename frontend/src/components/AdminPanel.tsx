
import { useState } from "react";
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

function AdminPanel({ contract, account }: AdminPanelProps) {
    const [address, setAddress] = useState("");
    const [admin, setAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function checkAdmin() {
        try {
            const result = await isAdmin(contract, account);
            setAdmin(result);
        } catch {
            setMessage("Impossible de vérifier le rôle Admin.");
        }
    }

    async function executeAction(action: string) {
        try {
            setLoading(true);
            setMessage("");

            if (action === "authorizeManufacturer") {
                await authorizeManufacturer(contract, address);
            } else if (action === "revokeManufacturer") {
                await revokeManufacturer(contract, address);
            } else if (action === "authorizeInsurer") {
                await authorizeInsurer(contract, address);
            } else if (action === "revokeInsurer") {
                await revokeInsurer(contract, address);
            }

            setMessage("Transaction confirmée avec succès !");
            setAddress("");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Transaction échouée."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ marginTop: "30px" }}>
            <h2>Administration</h2>

            <button onClick={checkAdmin}>
                Vérifier mon rôle Admin
            </button>

            {admin === true && (
                <div>
                    <h3>Gestion des autorisations</h3>

                    <input
                        type="text"
                        placeholder="Adresse MetaMask (0x...)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ width: "350px", padding: "10px" }}
                    />

                    <div style={{ marginTop: "15px" }}>
                        <h4>Fabricants</h4>

                        <button
                            disabled={loading || !address}
                            onClick={() =>
                                executeAction("authorizeManufacturer")
                            }
                        >
                            Autoriser
                        </button>

                        <button
                            disabled={loading || !address}
                            onClick={() =>
                                executeAction("revokeManufacturer")
                            }
                        >
                            Révoquer
                        </button>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <h4>Assureurs</h4>

                        <button
                            disabled={loading || !address}
                            onClick={() =>
                                executeAction("authorizeInsurer")
                            }
                        >
                            Autoriser
                        </button>

                        <button
                            disabled={loading || !address}
                            onClick={() =>
                                executeAction("revokeInsurer")
                            }
                        >
                            Révoquer
                        </button>
                    </div>
                </div>
            )}

            {admin === false && (
                <p>Accès refusé : ce compte n'est pas Admin.</p>
            )}

            {loading && <p>Transaction en cours...</p>}
            {message && <p>{message}</p>}
        </section>
    );
}

export default AdminPanel;
