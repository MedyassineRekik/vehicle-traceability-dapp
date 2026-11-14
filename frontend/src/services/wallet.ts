
import { BrowserProvider, Contract } from "ethers";
import {
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    LOCAL_CHAIN_ID
} from "../contracts/contractConfig";

declare global {
    interface Window {
        ethereum?: {
            request: (args: {
                method: string;
                params?: unknown[];
            }) => Promise<any>;
        };
    }
}

export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }

    const provider = new BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();

    if (network.chainId !== LOCAL_CHAIN_ID) {
        throw new Error("Please connect to Hardhat Local (Chain ID 31337)");
    }

    const signer = await provider.getSigner();

    const address = await signer.getAddress();

    const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
    );

    return {
        address,
        provider,
        signer,
        contract
    };
}
