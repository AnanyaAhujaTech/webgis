document.addEventListener('DOMContentLoaded', () => {
  // Initialize map with only OSM tiles
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null;

  // Attach event listener to radio buttons
  document.querySelectorAll('#state-control input[type=radio]')
    .forEach(radio => {
      radio.addEventListener('change', () => {
        const file = radio.value;

        // Remove previous layer if any
        if (currentLayer) {
          map.removeLayer(currentLayer);
          currentLayer = null;
        }

        // Load new state GeoJSON
        fetch(file)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then(data => {
            currentLayer = L.geoJSON(data, {
              style: { color: 'darkred', weight: 2, fillColor: 'orange', fillOpacity: 0.3 }
            }).addTo(map);
            map.fitBounds(currentLayer.getBounds());
          })
          .catch(err => {
            console.error('Error loading file:', err);
            alert('Could not load ' + file + '. Check console for details.');
          });
      });
    });
});
