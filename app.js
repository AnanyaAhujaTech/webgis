document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  // Base map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null;

  // State styling + popup info
  const stateData = {
    'madhya-pradesh.geojson': { 
      color: '#1f78b4', fillColor: '#a6cee3', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 56<br>Number of pending claims: 17<br>Number of water bodies: 3<br>Agricultural Land: 767 acres<br>Forest Land: 456 acres' 
    },
    'telangana.geojson': { 
      color: '#33a02c', fillColor: '#b2df8a', fillOpacity: 0.3, 
      popup: "Number of verified claims: 47<br>Number of pending claims: 62<br>Number of water bodies: 5<br>Agricultural Land: 3782 acres<br>Forest Land: 329 acres" 
    },
    'tripura.geojson': { 
      color: '#e31a1c', fillColor: '#fb9a99', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 77<br>Number of pending claims: 65<br>Number of water bodies: 2<br>Agricultural Land: 782 acres<br>Forest Land: 399 acres'
    },
    'odisha.geojson': { 
      color: '#ff7f00', fillColor: '#fdbf6f', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 62<br>Number of pending claims: 12<br>Number of water bodies: 6<br>Agricultural Land: 378 acres<br>Forest Land: 3379 acres' 
    }
  };

  // Handle dropdown selection
  const dropdown = document.getElementById('stateDropdown');
  dropdown.addEventListener('change', () => {
    const file = dropdown.value;

    if (!file) {
      if (currentLayer) {
        map.removeLayer(currentLayer);
        currentLayer = null;
      }
      return;
    }

    if (currentLayer) map.removeLayer(currentLayer);

    fetch(file)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        const stateInfo = stateData[file] || { color: 'black', fillColor: 'gray', fillOpacity: 0.3, popup: '' };

        currentLayer = L.geoJSON(data, {
          style: {
            color: stateInfo.color,
            fillColor: stateInfo.fillColor,
            fillOpacity: stateInfo.fillOpacity,
            weight: 2
          },
          onEachFeature: function(feature, layer) {
            if (stateInfo.popup && stateInfo.popup.trim() !== '') {
              layer.bindPopup(`<div style="background:white; color:black; padding:5px 8px; border-radius:4px;">${stateInfo.popup}</div>`);
            }
          }
        }).addTo(map);

        map.fitBounds(currentLayer.getBounds());
      })
      .catch(err => {
        console.error('Error loading file:', err);
        alert('Could not load ' + file + '. Check console for details.');
      });
  });
});
