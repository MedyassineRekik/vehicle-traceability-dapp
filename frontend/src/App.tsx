
import { useEffect, useState } from "react";
import type { Contract } from "ethers";
import "./App.css";

import MarketplacePanel from "./components/MarketplacePanel";
import VehicleDetails from "./components/VehicleDetails";
import ManufacturerPanel from "./components/ManufacturerPanel";
import InsurancePanel from "./components/InsurancePanel";
import AdminPanel from "./components/AdminPanel";
import VehicleList from "./components/VehicleList";

import { connectWallet } from "./services/wallet";
import {
  getAllVehicles,
  type VehicleDisplay,
} from "./services/vehicleService";
import {
  getUserRoles,
  type UserRoles,
} from "./services/roleService";

type Section =
  | "marketplace"
  | "vehicles"
  | "admin"
  | "manufacturer"
  | "insurance";

const emptyRoles: UserRoles = {
  admin: false,
  manufacturer: false,
  insurer: false,
};

const sectionInfo: Record<Section, { title: string; description: string }> = {
  marketplace: {
    title: "Marketplace",
    description: "Découvrez les véhicules certifiés disponibles à la vente.",
  },
  vehicles: {
    title: "Tous les véhicules",
    description: "Consultez les véhicules enregistrés et leur traçabilité.",
  },
  admin: {
    title: "Administration",
    description: "Gérez les autorisations des fabricants et des assureurs.",
  },
  manufacturer: {
    title: "Espace fabricant",
    description: "Enregistrez et certifiez les véhicules sur la blockchain.",
  },
  insurance: {
    title: "Espace assurance",
    description: "Déclarez les événements et consultez l'historique des véhicules.",
  },
};

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [roles, setRoles] = useState<UserRoles>(emptyRoles);
  const [vehicles, setVehicles] = useState<VehicleDisplay[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [activeSection, setActiveSection] =
    useState<Section>("marketplace");
  const [selectedVehicleId, setSelectedVehicleId] =
    useState<string | null>(null);

  async function handleConnect() {
    try {
      setMessage("");
      const wallet = await connectWallet();

      setAccount(wallet.address);
      setContract(wallet.contract);
      setSelectedVehicleId(null);
      setActiveSection("marketplace");
      setMessage("Portefeuille connecté avec succès.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Échec de la connexion."
      );
    }
  }
  function handleReturnToLogin() {
    setAccount("");
    setContract(null);
    setRoles(emptyRoles);
    setSelectedVehicleId(null);
    setActiveSection("marketplace");
    setVehicles([]);
    setMessage("");
    }

  useEffect(() => {
    if (!contract || !account) {
      setRoles(emptyRoles);
      return;
    }

    async function loadRoles() {
      try {
        setRoleLoading(true);
        const result = await getUserRoles(contract!, account);
        setRoles(result);
      } catch (error) {
        console.error(error);
        setRoles(emptyRoles);
        setMessage("Impossible de récupérer les autorisations.");
      } finally {
        setRoleLoading(false);
      }
    }

    loadRoles();
  }, [contract, account]);

  async function handleLoadVehicles() {
    if (!contract) return;

    try {
      setLoading(true);
      setMessage("");

      const result = await getAllVehicles(contract);
      setVehicles(result);
      setMessage(`${result.length} véhicule(s) récupéré(s).`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger les véhicules."
      );
    } finally {
      setLoading(false);
    }
  }

  function openSection(section: Section) {
    setSelectedVehicleId(null);
    setActiveSection(section);
    setMessage("");
  }

  const navigation: {
    id: Section;
    label: string;
    icon: string;
    visible: boolean;
  }[] = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: "▦",
      visible: true,
    },
    {
      id: "vehicles",
      label: "Véhicules",
      icon: "◈",
      visible: true,
    },
    {
      id: "manufacturer",
      label: "Fabricant",
      icon: "⌂",
      visible: roles.manufacturer,
    },
    {
      id: "insurance",
      label: "Assurance",
      icon: "◇",
      visible: roles.insurer,
    },
    {
      id: "admin",
      label: "Administration",
      icon: "⚙",
      visible: roles.admin,
    },
  ];

  const roleLabels = [
    roles.admin ? "Administrateur" : "",
    roles.manufacturer ? "Fabricant" : "",
    roles.insurer ? "Assureur" : "",
  ].filter(Boolean);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  if (!account) {
    return (
      <div className="login-page">
        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />

        <div className="login-card">
          <div className="brand-mark">V</div>
          <p className="login-eyebrow">BLOCKCHAIN VEHICLE PLATFORM</p>
          <h1>Vehicle Traceability</h1>
          <p className="login-description">
            Une plateforme décentralisée pour certifier, vendre et suivre
            l'historique des véhicules en toute transparence.
          </p>

          <div className="login-features">
            <div>
              <span className="feature-icon">✓</span>
              <span>Véhicules certifiés</span>
            </div>
            <div>
              <span className="feature-icon">⌁</span>
              <span>Historique sur blockchain</span>
            </div>
            <div>
              <span className="feature-icon">◇</span>
              <span>Transactions sécurisées</span>
            </div>
          </div>

          <button className="connect-button" onClick={handleConnect}>
            <span>◈</span>
            Connecter MetaMask
          </button>

          {message && <div className="app-notice error-notice">{message}</div>}

          <p className="login-footer">
            Application décentralisée · Réseau Hardhat Local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small-brand-mark">V</div>
          <div>
            <strong>VTrace</strong>
            <span>VEHICLE PLATFORM</span>
          </div>
        </div>

        <div className="sidebar-section-label">MENU PRINCIPAL</div>

        <nav className="sidebar-navigation">
          {navigation
            .filter((item) => item.visible)
            .map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  activeSection === item.id && !selectedVehicleId
                    ? "nav-item-active"
                    : ""
                }`}
                onClick={() => openSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.id && !selectedVehicleId && (
                  <span className="nav-active-indicator" />
                )}
              </button>
            ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="network-status">
            <span className="status-dot" />
            <div>
              <strong>Hardhat Local</strong>
              <span>Réseau connecté</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <span className="footer-shield">◇</span>
            <span>Powered by Ethereum</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-label">VEHICLE TRACEABILITY</span>
            <span className="topbar-divider">/</span>
            <span className="topbar-current">
              {selectedVehicleId ? "Détails du véhicule" : sectionInfo[activeSection].title}
            </span>
          </div>

          <div className="wallet-area">
            <div className="wallet-indicator">
              <span className="status-dot" />
              <span>Wallet connecté</span>
            </div>
            <div className="wallet-avatar">W</div>
            <div className="wallet-details">
              <strong>{shortAddress}</strong>
              <span>{roleLabels.length ? roleLabels.join(" · ") : "Utilisateur"}</span>
            </div>
            <button
            className="switch-wallet-button"
            onClick={handleReturnToLogin}
            title="Retourner à la connexion MetaMask"
            >
            ↪
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="page-overline">ESPACE DE GESTION</div>
              <h1>
                {selectedVehicleId
                  ? "Détails du véhicule"
                  : sectionInfo[activeSection].title}
              </h1>
              <p>
                {selectedVehicleId
                  ? "Consultez les informations et l'historique de traçabilité."
                  : sectionInfo[activeSection].description}
              </p>
            </div>
            <div className="page-heading-decoration">V</div>
          </div>

          {message && (
            <div className="app-notice">
              <span>ⓘ</span>
              {message}
              <button
                className="notice-close"
                onClick={() => setMessage("")}
                aria-label="Fermer le message"
              >
                ×
              </button>
            </div>
          )}

          {roleLoading ? (
            <div className="loading-panel">
              <div className="loading-spinner" />
              <p>Chargement de vos autorisations...</p>
            </div>
          ) : (
            <>
              {selectedVehicleId && contract && (
                <VehicleDetails
                  contract={contract}
                  vehicleId={selectedVehicleId}
                  onBack={() => setSelectedVehicleId(null)}
                />
              )}

              {!selectedVehicleId &&
                activeSection === "marketplace" &&
                contract && (
                  <MarketplacePanel
                    contract={contract}
                    account={account}
                    onRefresh={handleLoadVehicles}
                    onViewDetails={(id) => setSelectedVehicleId(id)}
                  />
                )}

              {!selectedVehicleId &&
                activeSection === "vehicles" &&
                contract && (
                  <div className="content-panel">
                    <div className="panel-heading-row">
                      <div>
                        <h2>Registre des véhicules</h2>
                        <p>
                          Retrouvez les véhicules enregistrés sur la blockchain.
                        </p>
                      </div>
                      <button
                        className="primary-action"
                        onClick={handleLoadVehicles}
                        disabled={loading}
                      >
                        {loading ? "Chargement..." : "↻ Actualiser"}
                      </button>
                    </div>

                    <VehicleList
                      vehicles={vehicles}
                      onViewDetails={(id) => setSelectedVehicleId(id)}
                    />
                  </div>
                )}

              {!selectedVehicleId &&
                activeSection === "admin" &&
                roles.admin &&
                contract && (
                  <AdminPanel contract={contract} account={account} />
                )}

              {!selectedVehicleId &&
                activeSection === "manufacturer" &&
                roles.manufacturer &&
                contract && (
                  <ManufacturerPanel
                    contract={contract}
                    account={account}
                    onRefresh={handleLoadVehicles}
                  />
                )}

              {!selectedVehicleId &&
                activeSection === "insurance" &&
                roles.insurer &&
                contract && (
                  <InsurancePanel
                    contract={contract}
                    account={account}
                    onRefresh={handleLoadVehicles}
                  />
                )}
            </>
          )}

          <footer className="dashboard-footer">
            <span>VTrace · Vehicle Traceability DApp</span>
            <span>Développé sur Ethereum · Chain ID 31337</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
