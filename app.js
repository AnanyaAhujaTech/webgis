// app.js
document.addEventListener('DOMContentLoaded', () => {
  // Center of India (lat, lon) and a sensible zoom for country-level view
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  // OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Load local GeoJSON file named "india.geojson" (must be in same folder)
  fetch('india.geojson')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        style: () => ({
          color: '#0077be',    // border color
          weight: 2,
          opacity: 0.8,
          fillColor: '#00aaff',
          fillOpacity: 0.12
        }),
        onEachFeature: (feature, layer) => {
          // Build a small popup from properties (if any)
          const props = feature.properties || {};
          const content = Object.keys(props).length
            ? Object.entries(props).map(([k, v]) => `<strong>${k}</strong>: ${String(v)}`).join('<br/>')
            : '<em>Feature</em>';
          layer.bindPopup(content);
        }
      }).addTo(map);

      // Fit map to the GeoJSON bounds (if valid)
      try {
        const bounds = geojsonLayer.getBounds();
        if (bounds && typeof bounds.isValid === 'function' ? bounds.isValid() : true) {
          map.fitBounds(bounds);
        }
      } catch (err) {
        console.warn('Could not fit map to GeoJSON bounds:', err);
      }
    })
    .catch(err => {
      console.error('Failed to load india.geojson:', err);
      alert('Failed to load india.geojson — check browser console and ensure the file is present in the repo/root of the site.');
    });
});
