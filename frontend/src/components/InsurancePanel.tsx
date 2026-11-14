
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

  async function loadInsuranceData() {
    try {
      setLoading(true);
      setMessage("");

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
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsuranceData();
  }, [contract, account]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      await reportInsuranceEvent(
        contract,
        vehicleId,
        eventType,
        description,
        eventDate
      );

      setMessage("Déclaration enregistrée avec succès sur la blockchain.");

      setDescription("");
      setEventDate("");

      await onRefresh();
      await loadInsuranceData();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de la déclaration."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Chargement du panneau d'assurance...</p>;
  }

  if (!authorized) {
    return (
      <section>
        <h2>Espace Assurance</h2>
        <p>
          Cette adresse MetaMask n'est pas autorisée à déclarer des événements
          d'assurance.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Espace Assurance</h2>

      <p>Adresse assureur : {account}</p>

      <h3>Véhicules enregistrés</h3>

      {vehicles.length === 0 ? (
        <p>Aucun véhicule disponible.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="insurance-vehicle">
            Sélectionner un véhicule
          </label>

          <select
            id="insurance-vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          >
            <option value="">-- Choisir un véhicule --</option>

            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} - {vehicle.vin}
              </option>
            ))}
          </select>

          <br /><br />

          <label htmlFor="event-type">Type d'événement</label>

          <select
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
          >
            <option value="Accident">Accident</option>
            <option value="Sinistre">Sinistre</option>
            <option value="Réparation">Réparation</option>
            <option value="Autre">Autre</option>
          </select>

          <br /><br />

          <label htmlFor="event-description">
            Description de l'événement
          </label>

          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrire l'événement..."
            required
            rows={4}
          />

          <br /><br />

          <label htmlFor="event-date">Date de l'événement</label>

          <input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            required
          />

          <br /><br />

          <button type="submit" disabled={submitting}>
            {submitting
              ? "Enregistrement en cours..."
              : "Enregistrer la déclaration"}
          </button>
        </form>
      )}

      {message && <p>{message}</p>}
    </section>
  );
}
