
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VehicleTraceabilityModule", (m) => {
    const vehicleTraceability = m.contract("VehicleTraceability");

    return { vehicleTraceability };
});
