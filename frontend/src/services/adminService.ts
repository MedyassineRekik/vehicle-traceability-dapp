
import { Contract, isAddress, getAddress } from "ethers";

export async function isAdmin(
    contract: Contract,
    account: string
): Promise<boolean> {
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    return await contract.hasRole(adminRole, account);
}

function validateAddress(address: string): string {
    const cleanAddress = address.trim();

    if (!isAddress(cleanAddress)) {
        throw new Error(
            "Adresse Ethereum invalide. Vérifiez l'adresse saisie."
        );
    }

    return getAddress(cleanAddress);
}

export async function authorizeManufacturer(
    contract: Contract,
    address: string
): Promise<void> {
    const validAddress = validateAddress(address);

    const tx = await contract.authorizeManufacturer(validAddress);
    await tx.wait();
}

export async function revokeManufacturer(
    contract: Contract,
    address: string
): Promise<void> {
    const validAddress = validateAddress(address);

    const tx = await contract.revokeManufacturer(validAddress);
    await tx.wait();
}

export async function authorizeInsurer(
    contract: Contract,
    address: string
): Promise<void> {
    const validAddress = validateAddress(address);

    const tx = await contract.authorizeInsurer(validAddress);
    await tx.wait();
}

export async function revokeInsurer(
    contract: Contract,
    address: string
): Promise<void> {
    const validAddress = validateAddress(address);

    const tx = await contract.revokeInsurer(validAddress);
    await tx.wait();
}
