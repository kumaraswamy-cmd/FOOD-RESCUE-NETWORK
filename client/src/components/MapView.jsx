import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet icon defaults
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ donations = [], ngos = [], center = [17.4400, 78.4400], zoom = 12 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers except tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom Vector Icons
    const donorIcon = L.divIcon({
      className: 'custom-map-pin donor-pin',
      html: `<div style="background:#EF4444; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const ngoIcon = L.divIcon({
      className: 'custom-map-pin ngo-pin',
      html: `<div style="background:#2563EB; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const deliveredIcon = L.divIcon({
      className: 'custom-map-pin delivered-pin',
      html: `<div style="background:#10B981; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Render NGO Markers
    ngos.forEach((ngo) => {
      if (ngo.lat && ngo.lng) {
        L.marker([ngo.lat, ngo.lng], { icon: ngoIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif; font-size:13px; line-height:1.4;">
              <strong>${ngo.name}</strong><br/>
              <span style="color:#64748B;">Reg: ${ngo.registration_doc_url ? 'Govt Verified' : 'Pending'}</span><br/>
              <span style="color:#64748B;">Radius: ${ngo.service_radius_km} km</span>
            </div>
          `);
      }
    });

    // Render Donation Markers & Connection Polylines
    donations.forEach((d) => {
      const icon = d.status === 'delivered' ? deliveredIcon : donorIcon;
      const lat = parseFloat(d.pickup_lat) || 17.4526;
      const lng = parseFloat(d.pickup_lng) || 78.3846;

      let foodItemsText = d.food_type ? `${d.food_type} (${d.quantity} Servings)` : `${d.quantity} Servings`;
      if (d.food_items && Array.isArray(d.food_items) && d.food_items.length > 0) {
        foodItemsText = d.food_items.map(i => `${i.itemName} (${i.quantity} ${i.unit || 'plates'})`).join(', ');
      }

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif; font-size:13px; line-height:1.4;">
          <strong>${foodItemsText}</strong><br/>
          <span style="color:#64748B;">Pickup: ${d.pickup_address}</span><br/>
          <span>Status: <strong>${d.status}</strong></span>
        </div>
      `);

      // Draw connection lines if assigned to an NGO
      if (d.assigned_ngo_name) {
        const matchedNgo = ngos.find(n => n.name === d.assigned_ngo_name);
        if (matchedNgo && matchedNgo.lat && matchedNgo.lng) {
          L.polyline([[lat, lng], [matchedNgo.lat, matchedNgo.lng]], {
            color: '#10B981',
            weight: 3,
            dashArray: '6, 6'
          }).addTo(map);
        }
      }
    });

  }, [donations, ngos, center, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '360px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #CBD5E1' }} 
    />
  );
}
