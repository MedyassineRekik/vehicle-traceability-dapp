
import { useEffect, useState, type FormEvent } from "react";
import type { Contract } from "ethers";

import {
  getInsuranceVehicles,
  isInsurer,
  reportInsuranceEvent,
  type InsuranceVehicle,
} from "../services/insuranceService";

interface InsurancePanelProps {
  contract: Contract;
  account: string;
  onRefresh: () => Promise<void>;
}

export default function InsurancePanel({
  contract,
  account,
  onRefresh,
}: InsurancePanelProps) {
  const [authorized, setAuthorized] = useState(false);
  const [vehicles, setVehicles] = useState<InsuranceVehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [eventType, setEventType] = useState("Accident");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  async function loadInsuranceData() {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const hasRole = await isInsurer(contract, account);
      setAuthorized(hasRole);

      if (hasRole) {
        const result = await getInsuranceVehicles(contract);
        setVehicles(result);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Impossible de charger les données depuis la blockchain.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsuranceData();
  }, [contract, account]);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === vehicleId
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      await reportInsuranceEvent(
        contract,
        vehicleId,
        eventType,
        description,
        eventDate
      );

      setMessage(
        "La déclaration a été enregistrée avec succès sur la blockchain."
      );
      setMessageType("success");

      setDescription("");
      setEventDate("");

      await onRefresh();
      await loadInsuranceData();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="insurance-loading">
        <div className="insurance-spinner" />
        <p>Chargement de l'espace assurance...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <section className="insurance-access">
        <div className="insurance-access-icon">🔒</div>
        <h2>Accès non autorisé</h2>
        <p>
          Cette adresse MetaMask ne possède pas le rôle d'assureur autorisé.
          Contactez l'administrateur pour obtenir les permissions nécessaires.
        </p>
        <div className="insurance-wallet">
          <span>Adresse connectée</span>
          <code>{account}</code>
        </div>
        <button
          className="insurance-secondary-button"
          onClick={loadInsuranceData}
        >
          Réessayer
        </button>
      </section>
    );
  }

  return (
    <section className="insurance-page">
      <div className="insurance-header">
        <div>
          <div className="insurance-eyebrow">
            GESTION DES DÉCLARATIONS
          </div>
          <h2>Espace Assurance</h2>
          <p>
            Consultez les véhicules enregistrés et ajoutez leurs événements
            d'assurance à leur historique blockchain.
          </p>
        </div>

        <div className="insurance-role-badge">
          <span className="insurance-status-dot" />
          Assureur autorisé
        </div>
      </div>

      <div className="insurance-summary">
        <div className="insurance-summary-card">
          <div className="insurance-summary-icon">🚘</div>
          <div>
            <span>Véhicules enregistrés</span>
            <strong>{vehicles.length}</strong>
          </div>
        </div>

        <div className="insurance-summary-card">
          <div className="insurance-summary-icon">🛡️</div>
          <div>
            <span>Statut du compte</span>
            <strong className="insurance-active-text">Actif</strong>
          </div>
        </div>
      </div>

      <div className="insurance-wallet-bar">
        <div>
          <span className="insurance-wallet-label">Compte assureur connecté</span>
          <code>{account}</code>
        </div>
        <span className="insurance-chain-label">Hardhat Local · Blockchain</span>
      </div>

      {message && (
        <div className={`insurance-message ${messageType}`}>
          <span className="insurance-message-icon">
            {messageType === "success" ? "✓" : "!"}
          </span>
          <p>{message}</p>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
            aria-label="Fermer le message"
          >
            ×
          </button>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="insurance-empty">
          <div className="insurance-empty-icon">🚗</div>
          <h3>Aucun véhicule disponible</h3>
          <p>
            Aucun véhicule n'est actuellement enregistré sur la blockchain.
            Les véhicules apparaîtront ici après leur enregistrement.
          </p>
        </div>
      ) : (
        <div className="insurance-content-grid">
          <div className="insurance-form-card">
            <div className="insurance-card-heading">
              <div>
                <span className="insurance-section-number">01</span>
                <h3>Nouvelle déclaration</h3>
              </div>
              <span className="insurance-required">* Champs obligatoires</span>
            </div>

            <form onSubmit={handleSubmit} className="insurance-form">
              <div className="insurance-field">
                <label htmlFor="insurance-vehicle">
                  Véhicule concerné <span>*</span>
                </label>
                <select
                  id="insurance-vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                  disabled={submitting}
                >
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} — {vehicle.vin}
                    </option>
                  ))}
                </select>
                <small>
                  Choisissez le véhicule auquel associer cet événement.
                </small>
              </div>

              {selectedVehicle && (
                <div className="insurance-selected-vehicle">
                  <div className="insurance-selected-icon">🚘</div>
                  <div className="insurance-selected-info">
                    <strong>
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </strong>
                    <span>VIN : {selectedVehicle.vin}</span>
                    <span>
                      Année de fabrication : {selectedVehicle.manufacturingYear}
                    </span>
                  </div>
                  <span className="insurance-selected-check">✓</span>
                </div>
              )}

              <div className="insurance-field">
                <label htmlFor="event-type">
                  Type d'événement <span>*</span>
                </label>
                <select
                  id="event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                  disabled={submitting}
                >
                  <option value="Accident">Accident</option>
                  <option value="Sinistre">Sinistre</option>
                  <option value="Réparation">Réparation</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="insurance-field">
                <label htmlFor="event-date">
                  Date de l'événement <span>*</span>
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  max={new Date().toLocaleDateString("en-CA")}
                  required
                  disabled={submitting}
                />
                <small>La date ne peut pas être dans le futur.</small>
              </div>

              <div className="insurance-field">
                <label htmlFor="event-description">
                  Description de l'événement <span>*</span>
                </label>
                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les circonstances et les détails de l'événement..."
                  required
                  rows={5}
                  maxLength={1000}
                  disabled={submitting}
                />
                <small className="insurance-character-count">
                  {description.length}/1000 caractères
                </small>
              </div>

              <div className="insurance-form-note">
                <span>ⓘ</span>
                <p>
                  Une fois confirmée, cette déclaration sera enregistrée sur
                  la blockchain et ne pourra plus être modifiée.
                </p>
              </div>

              <button
                type="submit"
                className="insurance-submit-button"
                disabled={submitting || !vehicleId}
              >
                {submitting ? (
                  <>
                    <span className="insurance-button-spinner" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>Enregistrer la déclaration <span>→</span></>
                )}
              </button>
            </form>
          </div>

          <aside className="insurance-side-card">
            <div className="insurance-side-icon">🛡️</div>
            <h3>Traçabilité et confiance</h3>
            <p>
              Chaque déclaration est associée à un véhicule identifié par son
              numéro VIN et conservée dans son historique.
            </p>

            <div className="insurance-side-divider" />

            <h4>Informations enregistrées</h4>
            <ul className="insurance-info-list">
              <li><span>✓</span> Type d'événement</li>
              <li><span>✓</span> Description</li>
              <li><span>✓</span> Date de l'événement</li>
              <li><span>✓</span> Date d'enregistrement</li>
              <li><span>✓</span> Adresse de l'assureur</li>
            </ul>

            <div className="insurance-side-footer">
              <span className="insurance-status-dot" />
              Données conservées sur la blockchain
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
