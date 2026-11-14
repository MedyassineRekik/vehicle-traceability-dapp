
import type { Contract } from "ethers";
import { isAdmin } from "./adminService";
import { isManufacturer } from "./manufacturerService";
import { isInsurer } from "./insuranceService";

export interface UserRoles {
  admin: boolean;
  manufacturer: boolean;
  insurer: boolean;
}

export async function getUserRoles(
  contract: Contract,
  account: string
): Promise<UserRoles> {
  const [admin, manufacturer, insurer] = await Promise.all([
    isAdmin(contract, account),
    isManufacturer(contract, account),
    isInsurer(contract, account),
  ]);

  return {
    admin,
    manufacturer,
    insurer,
  };
}
