
//import { Contract } from "ethers";
import { Contract, isAddress, getAddress } from "ethers";
export async function isAdmin(
    contract: Contract,
    account: string
): Promise<boolean> {
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();

    return await contract.hasRole(adminRole, account);
}

export async function authorizeManufacturer(
  contract: Contract,
  address: string
) {
  const cleanAddress = address.trim();

  console.log("Address received:", JSON.stringify(address));
  console.log("Address after trim:", cleanAddress);
  console.log("Is valid address:", isAddress(cleanAddress));

  if (!isAddress(cleanAddress)) {
    throw new Error("Invalid wallet address. Check the address entered.");
  }

  const checksumAddress = getAddress(cleanAddress);

  const tx = await contract.authorizeManufacturer(checksumAddress);
  await tx.wait();
}
export async function revokeManufacturer(
    contract: Contract,
    address: string
) {
    const tx = await contract.revokeManufacturer(address);
    await tx.wait();
}

export async function authorizeInsurer(
    contract: Contract,
    address: string
) {
    const tx = await contract.authorizeInsurer(address);
    await tx.wait();
}

export async function revokeInsurer(
    contract: Contract,
    address: string
) {
    const tx = await contract.revokeInsurer(address);
    await tx.wait();
}
