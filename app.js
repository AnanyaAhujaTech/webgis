document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Map
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // To hold the currently displayed GeoJSON layer

  // 2. State Data Configuration
  const stateData = {
    'madhya-pradesh.geojson': { 
      name: 'Madhya Pradesh',
      color: '#1f78b4', fillColor: '#a6cee3', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 56<br>Number of pending claims: 17<br>Number of water bodies: 3<br>Agricultural Land: 767 acres<br>Forest Land: 456 acres' 
    },
    'telangana.geojson': { 
      name: 'Telangana',
      color: '#33a02c', fillColor: '#b2df8a', fillOpacity: 0.3, 
      popup: "Number of verified claims: 47<br>Number of pending claims: 62<br>Number of water bodies: 5<br>Agricultural Land: 3782 acres<br>Forest Land: 329 acres" 
    },
    'tripura.geojson': { 
      name: 'Tripura',
      color: '#e31a1c', fillColor: '#fb9a99', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 77<br>Number of pending claims: 65<br>Number of water bodies: 2<br>Agricultural Land: 782 acres<br>Forest Land: 399 acres'
    },
    'odisha.geojson': { 
      name: 'Odisha',
      color: '#ff7f00', fillColor: '#fdbf6f', fillOpacity: 0.3, 
      popup: 'Number of verified claims: 62<br>Number of pending claims: 12<br>Number of water bodies: 6<br>Agricultural Land: 378 acres<br>Forest Land: 3379 acres' 
    }
  };

  // 3. Populate Dropdown
  const stateDropdown = document.getElementById('state-dropdown');
  
  Object.keys(stateData).forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = stateData[file].name;
    stateDropdown.appendChild(option);
  });
  
  // 4. Handle State Selection
  stateDropdown.addEventListener('change', (event) => {
    const file = event.target.value;
    
    // Clear previous layer
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null; // "sent back"
    }

    if (!file) return; // Do nothing if the placeholder option is selected

    // Fetch and display new state layer
    fetchState(file);
  });
  
  // 5. Fetch and Display GeoJSON Function
  function fetchState(file) {
    const stateInfo = stateData[file];
    const layerInfoDiv = document.getElementById('layer-info');
    layerInfoDiv.innerHTML = 'Loading ' + stateInfo.name + '...';

    fetch(file)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Create the new layer
        currentLayer = L.geoJSON(data, {
          style: {
            color: stateInfo.color,
            fillColor: stateInfo.fillColor,
            fillOpacity: stateInfo.fillOpacity,
            weight: 2
          },
          onEachFeature: function(feature, layer) {
            // Bind the popup content
            if (stateInfo.popup && stateInfo.popup.trim() !== '') {
              const popupContent = `
                <div style="background:white; color:black; padding:5px 8px; border-radius:4px;">
                  <strong style="font-size: 1.1em;">${stateInfo.name} Statistics</strong><br>
                  <hr style="margin: 5px 0;">
                  ${stateInfo.popup}
                </div>`;
              layer.bindPopup(popupContent);
            }
          }
        }).addTo(map);

        // Zoom to the bounds of the new layer
        map.fitBounds(currentLayer.getBounds());

        // Update layer info in the sidebar
        layerInfoDiv.innerHTML = `
          <strong>Currently Displayed:</strong> ${stateInfo.name}<br>
          <hr style="margin: 5px 0;">
          ${stateInfo.popup.replace(/<br>/g, '<br>')}
        `;
      })
      .catch(err => {
        console.error('Error loading file:', err);
        alert('Could not load ' + file + '. Check console for details.');
        layerInfoDiv.innerHTML = `<span style="color: red;">Error: Could not load ${stateInfo.name}.</span>`;
      });
  }
});
