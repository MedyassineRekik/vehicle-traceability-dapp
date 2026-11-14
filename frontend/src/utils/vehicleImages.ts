
const DEFAULT_VEHICLE_IMAGE = "/images/vehicles/default-car.jpg";

const vehicleImages: Record<string, string> = {
  "toyota-corolla": "/images/vehicles/toyota-corolla.jpg",
  "bmw-3-series": "/images/vehicles/bmw-3-series.jpg",
  "peugeot-308": "/images/vehicles/peugeot-308.jpg",
};

export function getVehicleImage(brand: string, model: string): string {
  const key = `${brand}-${model}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return vehicleImages[key] ?? DEFAULT_VEHICLE_IMAGE;
}
