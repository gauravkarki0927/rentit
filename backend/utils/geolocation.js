import NodeGeocoder from 'node-geocoder';

const options = {
  provider: 'openstreetmap',
  timeout: 5000,
};

const geoCoder = NodeGeocoder(options);

// Convert address to coordinates
export const geocodeAddress = async (street, city, state, country = 'Nepal') => {
  try {
    const address = `${street}, ${city}, ${state}, ${country}`;
    const result = await geoCoder.geocode(address);
    
    if (result && result.length > 0) {
      return {
        coordinates: [result[0].longitude, result[0].latitude], // [longitude, latitude] for GeoJSON
        latitude: result[0].latitude,
        longitude: result[0].longitude,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Get address from coordinates
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const result = await geoCoder.reverse({ lat: latitude, lon: longitude });
    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
