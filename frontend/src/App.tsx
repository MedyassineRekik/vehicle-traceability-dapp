
import { useState } from "react";
import ManufacturerPanel from "./components/ManufacturerPanel";
import { Contract } from "ethers";
import AdminPanel from "./components/AdminPanel";
import { connectWallet } from "./services/wallet";
import {
    getAllVehicles,
    type VehicleDisplay
} from "./services/vehicleService";
import VehicleList from "./components/VehicleList";

function App() {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState<Contract | null>(null);
    const [vehicles, setVehicles] = useState<VehicleDisplay[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleConnect() {
        try {
            const wallet = await connectWallet();

            setAccount(wallet.address);
            setContract(wallet.contract);
            setMessage("Wallet connected successfully!");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Connection failed"
            );
        }
    }

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
                    : "Unable to load vehicles"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>Vehicle Traceability DApp</h1>

            <button onClick={handleConnect}>
                Connect MetaMask
            </button>

            {account && (
                <p>Connected account: {account}</p>
            )}

            <p>{message}</p>
            {contract && account && (
            <AdminPanel
                contract={contract}
                account={account}
            />
           )}
            {contract && account && (
            <ManufacturerPanel
                contract={contract}
                account={account}
                 onRefresh={handleLoadVehicles}
          />
          )}
            {contract && (
                <button
                    onClick={handleLoadVehicles}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Load Vehicles"}
                </button>
            )}

            <VehicleList vehicles={vehicles} />
        </div>
    );
}

export default App;
