
import { useState } from "react";
import { connectWallet } from "./services/wallet";

function App() {
    const [account, setAccount] = useState("");
    const [message, setMessage] = useState("");

    async function handleConnect() {
        try {
            const wallet = await connectWallet();

            setAccount(wallet.address);
            setMessage("Wallet connected successfully!");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Connection failed"
            );
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
        </div>
    );
}

export default App;


