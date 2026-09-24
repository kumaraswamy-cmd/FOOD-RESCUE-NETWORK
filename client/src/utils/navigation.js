/**
 * Utility to launch native turn-by-turn navigation in Google Maps or Apple Maps
 * based on the user's OS / Device.
 */
export function openLiveNavigation({ lat, lng, destLat, destLng, title = 'Pickup Location' }) {
  const pickupLat = parseFloat(lat);
  const pickupLng = parseFloat(lng);

  if (isNaN(pickupLat) || isNaN(pickupLng)) {
    alert('📍 Valid GPS coordinates not available for this venue.');
    return;
  }

  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent);

  let url = '';

  if (destLat && destLng && !isNaN(parseFloat(destLat)) && !isNaN(parseFloat(destLng))) {
    // Navigation route between Pickup Venue and Shelter/NGO Destination
    if (isApple) {
      url = `https://maps.apple.com/?saddr=${pickupLat},${pickupLng}&daddr=${parseFloat(destLat)},${parseFloat(destLng)}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${parseFloat(destLat)},${parseFloat(destLng)}&travelmode=driving`;
    }
  } else {
    // Turn-by-turn navigation from user's current GPS to venue
    if (isApple) {
      url = `https://maps.apple.com/?daddr=${pickupLat},${pickupLng}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}&travelmode=driving`;
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
