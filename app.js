document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null;

  // State colors and popup text
  const stateData = {
    'madhya-pradesh.geojson': { color: '#1f78b4', fillColor: '#a6cee3', fillOpacity: 0.3, popup: 'Madhya Pradesh, a large state in central India, retains landmarks from eras throughout Indian history. Begun in the 10th century, its Hindu and Jain temples at Khajuraho are renowned for their carvings of erotic scenes, most prominently Kandariya Mahadeva, a temple with more than 800 sculptures. The eastern Bandhavgarh and Kanha national parks, noted Bengal tiger sanctuaries, offer guided safaris.' },
    'telangana.geojson': { color: '#33a02c', fillColor: '#b2df8a', fillOpacity: 0.3, popup: "Telangana is a state in southern India. In the capital of Hyderabad, the Charminar is a 16th-century mosque with 4 arches supporting 4 towering minarets. The monument overlooks the city's long-running Laad Bazaar. Once the seat of the Qutb Shahi dynasty, the sprawling Golconda Fort is a former diamond-trading center. In the city of Warangal, the centuries-old Warangal Fort features carved stone towers and gateways." },
    'tripura.geojson': { color: '#e31a1c', fillColor: '#fb9a99', fillOpacity: 0.3, popup: 'Tripura is a hilly state in northeast India, bordered on 3 sides by Bangladesh, and home to a diverse mix of tribal cultures and religious groups. In the capital Agartala, the imposing Ujjayanta Palace is set among Mughal gardens, and Gedu Mia’s Mosque has white marble domes and towers. South of the city, Neermahal summer palace sits in the middle of Lake Rudrasagar and blends Hindu and Islamic architectural styles.' },
    'odisha.geojson': { color: '#ff7f00', fillColor: '#fdbf6f', fillOpacity: 0.3, popup: 'Odisha (formerly Orissa), an eastern Indian state on the Bay of Bengal, is known for its tribal cultures and its many ancient Hindu temples. The capital, Bhubaneswar, is home to hundreds of temples, notably the intricately-carved Mukteshvara. The Lingaraj Temple complex, dating to the 11th century, is set around sacred Bindusagar Lake. The Odisha State Museum is focused on the area’s history and environment.' }
  };

  // Tripura district popups (editable)
  const districtData = {
    'West Tripura': 'Number of verified claims: 56\nNumber of pending claims: 17\nNumber of water bodies: 3\nAgricultural Land: 767 acres\nForest Land: 456 acres',
    'South Tripura': 'Number of verified claims: 47\nNumber of pending claims: 62\nNumber of water bodies: 5\nAgricultural Land: 3782 acres\nForest Land: 329 acres',
    'North Tripura': 'Number of verified claims: 77\nNumber of pending claims: 65\nNumber of water bodies: 2\nAgricultural Land: 782 acres\nForest Land: 399 acres',
    'Dhalai': 'Number of verified claims: 62\nNumber of pending claims: 12\nNumber of water bodies: 6\nAgricultural Land: 378 acres\nForest Land: 3379 acres',
    'Khowai': 'Number of verified claims: 40\nNumber of pending claims: 16\nNumber of water bodies: 5\nAgricultural Land: 3334 acres\nForest Land: 3439 acres',
    'Gomati': 'Number of verified claims: 43\nNumber of pending claims: 42\nNumber of water bodies: 8\nAgricultural Land: 282 acres\nForest Land: 229 acres',
    'Unakoti': 'Number of verified claims: 54\nNumber of pending claims: 43\nNumber of water bodies: 2\nAgricultural Land: 332 acres\nForest Land: 3359 acres',
    'Sipahijala': 'Number of verified claims: 40\nNumber of pending claims: 29\nNumber of water bodies: 1\nAgricultural Land: 239 acres\nForest Land: 2949 acres'
  };

  const StateControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function(map) {
      const container = L.DomUtil.create('div', 'leaflet-bar');
      container.style.background = 'white';
      container.style.padding = '10px';
      container.style.borderRadius = '6px';
      container.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      container.style.fontSize = '14px';
      container.style.zIndex = '9999';

      container.innerHTML = `
        <form>
          <label><input type="radio" name="state" value="madhya-pradesh.geojson"> Madhya Pradesh</label><br>
          <label><input type="radio" name="state" value="telangana.geojson"> Telangana</label><br>
          <label><input type="radio" name="state" value="tripura.geojson"> Tripura</label><br>
          <label><input type="radio" name="state" value="odisha.geojson"> Odisha</label>
        </form>
      `;

      L.DomEvent.disableClickPropagation(container);

      const radios = container.querySelectorAll('input[name="state"]');
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          const file = radio.value;

          if (currentLayer) map.removeLayer(currentLayer);

          fetch(file)
            .then(r => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.json();
            })
            .then(data => {
              const stateInfo = stateData[file] || { color: 'black', fillColor: 'gray', fillOpacity: 0.3, popup: 'State' };

              currentLayer = L.geoJSON(data, {
                style: {
                  color: stateInfo.color,
                  fillColor: stateInfo.fillColor,
                  fillOpacity: stateInfo.fillOpacity,
                  weight: 2
                },
                onEachFeature: function(feature, layer) {
                  if (file === 'tripura.geojson') {
                    // Use district name for Tripura
                    const districtName = feature.properties.NAME || feature.properties.name || 'District';
                    const desc = districtData[districtName] || districtName;
                    layer.bindPopup(`<div style="font-weight:bold; color:white; background-color:darkred; padding:5px 10px; border-radius:5px; white-space: pre-line;">${desc}</div>`);
                  } else {
                    // Other states show state description
                    layer.bindPopup(`<div style="font-weight:bold; color:white; background-color:darkblue; padding:5px 10px; border-radius:5px;">${stateInfo.popup}</div>`);
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

      return container;
    }
  });

  map.addControl(new StateControl());
});
