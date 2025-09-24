document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  // Base map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Load India base GeoJSON
  fetch('india.geojson')
    .then(r => r.json())
    .then(data => {
      const indiaLayer = L.geoJSON(data, {
        style: { color: '#0077be', weight: 2, fillOpacity: 0.1 }
      }).addTo(map);
      map.fitBounds(indiaLayer.getBounds());
    });

  // Madhya Pradesh layer variable
  let mpLayer = null;

  // Toggle logic
  const mpToggle = document.getElementById('mp-toggle');
  mpToggle.addEventListener('change', () => {
    if (mpToggle.checked) {
      // Load MP GeoJSON if not already loaded
      if (!mpLayer) {
        fetch('madhya-pradesh.geojson')
          .then(r => r.json())
          .then(data => {
            mpLayer = L.geoJSON(data, {
              style: { color: 'green', weight: 2, fillColor: 'lime', fillOpacity: 0.2 }
            }).addTo(map);
            map.fitBounds(mpLayer.getBounds());
          })
          .catch(err => {
            console.error('Error loading madhya-pradesh.geojson:', err);
            alert('Could not load Madhya Pradesh GeoJSON file.');
          });
      } else {
        map.addLayer(mpLayer);
        map.fitBounds(mpLayer.getBounds());
      }
    } else {
      if (mpLayer) {
        map.removeLayer(mpLayer);
      }
    }
  });
});
