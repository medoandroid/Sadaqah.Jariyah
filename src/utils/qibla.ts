/**
 * Mathematical Qibla Direction & Distance Calculator
 * Based on spherical geodesy forward azimuth formula towards the Holy Kaaba.
 */

// Coordinates of the Kaaba in Makkah al-Mukarramah
export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export interface QiblaResult {
  bearingDegrees: number; // 0 to 360 clockwise from True North
  compassCardinal: string; // e.g. "جنوب شرق"
  distanceKm: number; // Great circle distance to Makkah in km
}

/**
 * Calculates the Qibla bearing in degrees from True North.
 */
export function calculateQibla(latitude: number, longitude: number): QiblaResult {
  const phi1 = rad(latitude);
  const phi2 = rad(KAABA_LAT);
  const deltaLambda = rad(KAABA_LNG - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = deg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  // Calculate distance using Haversine formula
  const R = 6371; // Earth's mean radius in km
  const deltaPhi = phi2 - phi1;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Determine Arabic cardinal direction
  let cardinal = '';
  if (bearing >= 337.5 || bearing < 22.5) cardinal = 'شمال';
  else if (bearing >= 22.5 && bearing < 67.5) cardinal = 'شمال شرق';
  else if (bearing >= 67.5 && bearing < 112.5) cardinal = 'شرق';
  else if (bearing >= 112.5 && bearing < 157.5) cardinal = 'جنوب شرق';
  else if (bearing >= 157.5 && bearing < 202.5) cardinal = 'جنوب';
  else if (bearing >= 202.5 && bearing < 247.5) cardinal = 'جنوب غرب';
  else if (bearing >= 247.5 && bearing < 292.5) cardinal = 'غرب';
  else cardinal = 'شمال غرب';

  return {
    bearingDegrees: Math.round(bearing * 10) / 10,
    compassCardinal: cardinal,
    distanceKm,
  };
}
