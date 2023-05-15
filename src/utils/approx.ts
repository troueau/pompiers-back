
export function isApproximatelyEqual(value1: number, value2: number, decimalDifference = 0.00001) : boolean {
  return Math.abs(value1 - value2) < decimalDifference;
};

export function getMatchingPositionIndex(latitudes: number[], longitudes: number[], targetLatitude: number, targetLongitude: number): number {
  for (let i = 0; i < latitudes.length; i++) {
      if (isApproximatelyEqual(latitudes[i], targetLatitude) && isApproximatelyEqual(longitudes[i], targetLongitude)) {
          return i;
      }
  }
  return -1; // pas de correspondance trouvée
}