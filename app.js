document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // State or District GeoJSON layer
  let fraClaimsLayer = null; // New layer for FRA claims
  
  // Define FRA Polygons (The 3, 5, 4, 6, 7 polygons as required)
  const fraClaimsGeoJSON = {
    type: "FeatureCollection",
    features: [
      // Madhya Pradesh: Burhanpur (3) - Use simple mock coordinates
      { type: "Feature", properties: { district: "Burhanpur", state: "Madhya Pradesh", count: 1 }, geometry: { type: "Polygon", coordinates: [[[76.22, 21.32], [76.24, 21.32], [76.24, 21.30], [76.22, 21.30], [76.22, 21.32]]] }},
      { type: "Feature", properties: { district: "Burhanpur", state: "Madhya Pradesh", count: 2 }, geometry: { type: "Polygon", coordinates: [[[76.30, 21.40], [76.32, 21.40], [76.32, 21.38], [76.30, 21.38], [76.30, 21.40]]] }},
      { type: "Feature", properties: { district: "Burhanpur", state: "Madhya Pradesh", count: 3 }, geometry: { type: "Polygon", coordinates: [[[76.15, 21.25], [76.17, 21.25], [76.17, 21.23], [76.15, 21.23], [76.15, 21.25]]] }},
      // Madhya Pradesh: Seoni (5)
      { type: "Feature", properties: { district: "Seoni", state: "Madhya Pradesh", count: 4 }, geometry: { type: "Polygon", coordinates: [[[79.55, 22.10], [79.57, 22.10], [79.57, 22.08], [79.55, 22.08], [79.55, 22.10]]] }},
      { type: "Feature", properties: { district: "Seoni", state: "Madhya Pradesh", count: 5 }, geometry: { type: "Polygon", coordinates: [[[79.65, 22.20], [79.67, 22.20], [79.67, 22.18], [79.65, 22.18], [79.65, 22.20]]] }},
      { type: "Feature", properties: { district: "Seoni", state: "Madhya Pradesh", count: 6 }, geometry: { type: "Polygon", coordinates: [[[79.75, 22.00], [79.77, 22.00], [79.77, 21.98], [79.75, 21.98], [79.75, 22.00]]] }},
      { type: "Feature", properties: { district: "Seoni", state: "Madhya Pradesh", count: 7 }, geometry: { type: "Polygon", coordinates: [[[79.85, 22.30], [79.87, 22.30], [79.87, 22.28], [79.85, 22.28], [79.85, 22.30]]] }},
      { type: "Feature", properties: { district: "Seoni", state: "Madhya Pradesh", count: 8 }, geometry: { type: "Polygon", coordinates: [[[79.95, 22.15], [79.97, 22.15], [79.97, 22.13], [79.95, 22.13], [79.95, 22.15]]] }},
      // Telangana: Adilabad (4)
      { type: "Feature", properties: { district: "Adilabad", state: "Telangana", count: 9 }, geometry: { type: "Polygon", coordinates: [[[78.50, 19.60], [78.52, 19.60], [78.52, 19.58], [78.50, 19.58], [78.50, 19.60]]] }},
      { type: "Feature", properties: { district: "Adilabad", state: "Telangana", count: 10 }, geometry: { type: "Polygon", coordinates: [[[78.60, 19.70], [78.62, 19.70], [78.62, 19.68], [78.60, 19.68], [78.60, 19.70]]] }},
      { type: "Feature", properties: { district: "Adilabad", state: "Telangana", count: 11 }, geometry: { type: "Polygon", coordinates: [[[78.70, 19.50], [78.72, 19.50], [78.72, 19.48], [78.70, 19.48], [78.70, 19.50]]] }},
      { type: "Feature", properties: { district: "Adilabad", state: "Telangana", count: 12 }, geometry: { type: "Polygon", coordinates: [[[78.80, 19.80], [78.82, 19.80], [78.82, 19.78], [78.80, 19.78], [78.80, 19.80]]] }},
      // Tripura: North Tripura (6)
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 13 }, geometry: { type: "Polygon", coordinates: [[[92.00, 24.30], [92.02, 24.30], [92.02, 24.28], [92.00, 24.28], [92.00, 24.30]]] }},
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 14 }, geometry: { type: "Polygon", coordinates: [[[92.10, 24.40], [92.12, 24.40], [92.12, 24.38], [92.10, 24.38], [92.10, 24.40]]] }},
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 15 }, geometry: { type: "Polygon", coordinates: [[[92.20, 24.20], [92.22, 24.20], [92.22, 24.18], [92.20, 24.18], [92.20, 24.20]]] }},
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 16 }, geometry: { type: "Polygon", coordinates: [[[92.30, 24.50], [92.32, 24.50], [92.32, 24.48], [92.30, 24.48], [92.30, 24.50]]] }},
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 17 }, geometry: { type: "Polygon", coordinates: [[[92.40, 24.10], [92.42, 24.10], [92.42, 24.08], [92.40, 24.08], [92.40, 24.10]]] }},
      { type: "Feature", properties: { district: "North Tripura", state: "Tripura", count: 18 }, geometry: { type: "Polygon", coordinates: [[[92.50, 24.00], [92.52, 24.00], [92.52, 23.98], [92.50, 23.98], [92.50, 24.00]]] }},
      // Odisha: Bhadrak (7)
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 19 }, geometry: { type: "Polygon", coordinates: [[[86.50, 21.08], [86.52, 21.08], [86.52, 21.06], [86.50, 21.06], [86.50, 21.08]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 20 }, geometry: { type: "Polygon", coordinates: [[[86.60, 21.18], [86.62, 21.18], [86.62, 21.16], [86.60, 21.16], [86.60, 21.18]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 21 }, geometry: { type: "Polygon", coordinates: [[[86.70, 21.00], [86.72, 21.00], [86.72, 20.98], [86.70, 20.98], [86.70, 21.00]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 22 }, geometry: { type: "Polygon", coordinates: [[[86.80, 21.28], [86.82, 21.28], [86.82, 21.26], [86.80, 21.26], [86.80, 21.28]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 23 }, geometry: { type: "Polygon", coordinates: [[[86.90, 21.10], [86.92, 21.10], [86.92, 21.08], [86.90, 21.08], [86.90, 21.10]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 24 }, geometry: { type: "Polygon", coordinates: [[[87.00, 21.38], [87.02, 21.38], [87.02, 21.36], [87.00, 21.36], [87.00, 21.38]]] }},
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 25 }, geometry: { type: "Polygon", coordinates: [[[87.10, 21.05], [87.12, 21.05], [87.12, 21.03], [87.10, 21.03], [87.10, 21.05]]] }}
    ]
  };

  // The stateData object remains the same
  // ... (stateData object is unchanged) ...
  const stateData = {
    'madhya-pradesh': {
      name: 'Madhya Pradesh', color: '#1f78b4', fillColor: '#a6cee3',
      districts: ['Burhanpur', 'Seoni', 'Alirajpur', 'Chhindwara', 'Harda', 'Khargone', 'Khandwa', 'Balaghat', 'Barwani', 'Betul', 'Morena', 'Bhind', 'Gwalior', 'Sheopur', 'Shivpuri', 'Tikamgarh', 'Neemuch', 'Rewa', 'Satna', 'Guna', 'Ashoknagar', 'Mandsaur', 'Singrauli', 'Sidhi', 'Sagar', 'Damoh', 'Shajapur', 'Vidisha', 'Rajgarh', 'Shahdol', 'Katni', 'Umaria', 'Ratlam', 'Bhopal', 'Ujjain', 'Raisen', 'Sehore', 'Jabalpur', 'Dewas', 'Anuppur', 'Jhabua', 'Dindori', 'Narsinghpur', 'Dhar', 'Indore', 'Mandla', 'Hoshangabad', 'Agar Malwa', 'Datia', 'Chhatarpur', 'Panna', 'Niwari'],
      stats: {
        claims_received: { Individual: '585,326', Community: '42,187', Total: '627,513' },
        titles_distributed: { Individual: '266,901', Community: '27,976', Total: '294,877' },
        land_distributed: { Individual: '903,533.06', Community: '1,463,614.46', Total: '2,367,147.52' },
        claims_rejected: '322,407',
        claims_disposed: '617,284',
        percent_disposed: '98.37%',
        percent_titles: '46.99%'
      }
    },
    'telangana': {
      name: 'Telangana', color: '#33a02c', fillColor: '#b2df8a',
      districts: ['Adilabad', 'Hyderabad', 'Jagtial', 'Jangaon', 'Mulugu', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Nagarkurnool', 'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri', 'Bhadradri Kothagudem', 'Jayashankar Bhupalapally', 'Narayanpet'],
      stats: {
        claims_received: { Individual: '651,822', Community: '3,427', Total: '655,249' },
        titles_distributed: { Individual: '230,735', Community: '721', Total: '231,456' },
        land_distributed: { Individual: '669,689.14', Community: '457,663.17', Total: '1,127,352.32' },
        claims_rejected: '94,426',
        claims_disposed: '325,882',
        percent_disposed: '49.73%',
        percent_titles: '35.32%'
      }
    },
    'tripura': {
      name: 'Tripura', color: '#e31a1c', fillColor: '#fb9a99',
      districts: ['North Tripura', 'Dhalai', 'Sipahijala', 'Gomati', 'Khowai', 'West Tripura', 'South Tripura', 'Unokoti'],
      stats: {
        claims_received: { Individual: '200,557', Community: '164', Total: '200,721' },
        titles_distributed: { Individual: '127,931', Community: '101', Total: '128,032' },
        land_distributed: { Individual: '465,192.88', Community: '552.40', Total: '465,745.28' },
        claims_rejected: '68,848',
        claims_disposed: '196,880',
        percent_disposed: '98.09%',
        percent_titles: '63.79%'
      }
    },
    'odisha': {
      name: 'Odisha', color: '#ff7f00', fillColor: '#fdbf6f',
      districts: ['Bhadrak', 'Dhenkanal', 'Jajpur', 'Subarnapur', 'Nuapada', 'Balangir', 'Boudh', 'Cuttack', 'Kandhamal', 'Nayagarh', 'Khordha', 'Kalahandi', 'Jagatsinghpur', 'Puri', 'Nabarangapur', 'Rayagada', 'Koraput', 'Malkangiri', 'Angul', 'Kendrapara', 'Ganjam', 'Gajapati', 'Mayurbhanj', 'Sundargarh', 'Kendujhar', 'Balasore', 'Jharsuguda', 'Bargarh', 'Deogarh', 'Sambalpur'],
      stats: {
        claims_received: { Individual: '732,530', Community: '35,843', Total: '768,373' },
        titles_distributed: { Individual: '463,129', Community: '8,990', Total: '472,119' },
        land_distributed: { Individual: '676,078.86', Community: '763,729.00', Total: '1,439,807.86' },
        claims_rejected: '146,340',
        claims_disposed: '618,429',
        percent_disposed: '80.49%',
        percent_titles: '61.44%'
      }
    }
  };


  // --- DOM Elements ---

  const stateDropdown = document.getElementById('state-dropdown');
  const districtDropdown = document.getElementById('district-dropdown');
  const statusMessageDiv = document.getElementById('status-message');
  
  // 👇 NEW DOM Elements 👇
  const statisticsSidebar = document.getElementById('statistics-sidebar');
  const statisticsPanel = document.getElementById('statistics-panel');
  const mapElement = document.getElementById('map');
  const fraClaimsRadio = document.getElementById('fra-claims-radio');
  const fraDateInput = document.getElementById('fra-date');
  const otherLayerRadios = document.querySelectorAll('input[name="map-layer"]:not(#fra-claims-radio)'); // Placeholder for other layers
  // 👆 NEW DOM Elements 👆

  // --- Core Functions ---

  function clearLayer() {
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
    }
    // Statistics panel cleared only when a new state selection clears the map OR when the whole system is reset (not on district change)
    // statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>'; 
  }
  
  // 👇 NEW Clear FRA Layer Function 👇
  function clearFraLayer() {
    if (fraClaimsLayer) {
      map.removeLayer(fraClaimsLayer);
      fraClaimsLayer = null;
    }
  }
  // 👆 NEW Clear FRA Layer Function 👆

  function updateStatus(message, isError = false) {
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  // 👇 Modified renderStatistics to also control the right sidebar visibility 👇
  function renderStatistics(stateKey) {
    if (!stateKey || !stateData[stateKey]) {
      statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>';
      statisticsSidebar.classList.remove('visible');
      mapElement.classList.remove('stats-visible');
      return;
    }
    
    const stats = stateData[stateKey].stats;
    
    // Function to format the three-part stats (Individual, Community, Total)
    const formatThreePartStat = (title, data, unit = '') => `
      <strong>${title}</strong>
      <ul>
        <li>Individual: ${data.Individual} ${unit}</li>
        <li>Community: ${data.Community} ${unit}</li>
        <li>Total: ${data.Total} ${unit}</li>
      </ul>
    `;
    
    statisticsPanel.innerHTML = `
      ${formatThreePartStat('No. of claims received upto 31.7.2025', stats.claims_received)}
      ${formatThreePartStat('No. of titles distributed upto 31.7.2025', stats.titles_distributed)}
      ${formatThreePartStat('Extent of forest land for which titles distributed', stats.land_distributed, 'acres')}
      
      <strong>No. of claims rejected:</strong> ${stats.claims_rejected}<br>
      <strong>Total No. of Claims Disposed off:</strong> ${stats.claims_disposed}<br>
      
      <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 10px 0;">
      
      <strong>% of Claims disposed off w.r.t. claims received:</strong> ${stats.percent_disposed}<br>
      <strong>% of Titles distributed over number of claims received:</strong> ${stats.percent_titles}
    `;
    
    statisticsSidebar.classList.add('visible');
    mapElement.classList.add('stats-visible');
  }
  // 👆 Modified renderStatistics 👆
  
  // 👇 NEW FRA Layer Toggling Function 👇
  function toggleFraLayer(stateKey, enable) {
      clearFraLayer();

      if (enable && stateKey && stateData[stateKey]) {
          const stateConfig = stateData[stateKey];
          const filteredFeatures = fraClaimsGeoJSON.features.filter(f => f.properties.state === stateConfig.name);

          if (filteredFeatures.length === 0) {
              updateStatus(`No FRA claim polygons available for ${stateConfig.name}.`, false);
              return;
          }
          
          fraClaimsLayer = L.geoJSON({ type: "FeatureCollection", features: filteredFeatures }, {
              style: (feature) => ({
                  color: '#FF0000', // Red border
                  fillColor: '#FF0000',
                  fillOpacity: 0.7,
                  weight: 1
              }),
              onEachFeature: (feature, layer) => {
                  // Attach a popup/dialogue box
                  // The polygon properties are placeholders, you will fill in the actual data.
                  const props = feature.properties;
                  const popupContent = `
                      <strong>Community Forest Right Claim</strong><br>
                      <hr style="border-color: #ddd;">
                      1. Name(s) of the holder(s) of community forest right: ${props.holderName || 'N/A (Add details)'}<br>
                      2. Village/Gram Sabha: ${props.village || 'N/A (Add details)'}<br>
                      3. Gram Panchayat: ${props.gramPanchayat || 'N/A (Add details)'}<br>
                      4. Tehsil/Taluka: ${props.tehsil || 'N/A (Add details)'}<br>
                      5. District: <strong>${props.district}</strong>
                  `;
                  layer.bindPopup(popupContent);
              }
          }).addTo(map);

          updateStatus(`${filteredFeatures.length} FRA claim area(s) for ${stateConfig.name} plotted.`);
          
          // Optional: Zoom to the plotted polygons
          // map.fitBounds(fraClaimsLayer.getBounds());
          
      } else if (enable) {
          updateStatus('Select a state first to view FRA claims.', false);
      } else {
          updateStatus('FRA claims layer cleared.');
      }
  }
  // 👆 NEW FRA Layer Toggling Function 👆


  // --- Initialization: Populate State Dropdown ---

  Object.keys(stateData).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = stateData[key].name;
    stateDropdown.appendChild(option);
  });
  
  // Also, set the default layer radio button (State boundary)
  const defaultLayerRadio = document.querySelector('input[name="map-layer"][value="state-district"]');
  if (!defaultLayerRadio) {
      // Create a default radio button if one doesn't exist (assuming state/district is default)
      const defaultRadioHtml = `
          <div class="control-group layer-control">
              <label>
                  <input type="radio" name="map-layer" value="state-district" checked>
                  State/District Boundary
              </label>
          </div>
      `;
      // Prepend it before the FRA control
      document.querySelector('.layer-control').insertAdjacentHTML('beforebegin', defaultRadioHtml);
      document.getElementById('state-dropdown').closest('.control-group').nextElementSibling.nextElementSibling.nextElementSibling.checked = true;
  }
  
  // --- Event Handlers (Modified) ---

  function handleStateSelection(stateKey) {
    clearLayer();
    clearFraLayer(); // Ensure FRA layer is cleared on new state selection

    // ... (rest of the state boundary loading logic is the same) ...
    
    // Set current bounds for the state (even if not used for query, helpful for map state)
    let currentBounds = null;
    
    districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
    districtDropdown.disabled = true;
    
    // 👇 Hide right panel and reset FRA radio if state is deselected 👇
    if (!stateKey) {
      renderStatistics(null); // Hide stats panel
      fraClaimsRadio.checked = false;
      updateStatus('Please select a State to begin.');
      return;
    }
    // 👆 Hide right panel and reset FRA radio if state is deselected 👆

    const config = stateData[stateKey];
    updateStatus(`State selected: ${config.name}. Loading state boundary...`);
    
    // Render the statistics immediately
    renderStatistics(stateKey);
    
    // 👇 If FRA radio is checked, toggle the layer now for the newly selected state 👇
    if (fraClaimsRadio.checked) {
        toggleFraLayer(stateKey, true);
    }
    // 👆 If FRA radio is checked, toggle the layer now for the newly selected state 👆

    config.districts.forEach(distName => {
      const option = document.createElement('option');
      option.value = distName;
      option.textContent = distName;
      districtDropdown.appendChild(option);
    });
    districtDropdown.disabled = false;
    
    // Ensure state-district radio is checked when selecting a state
    const stateDistrictRadio = document.querySelector('input[name="map-layer"][value="state-district"]');
    if (stateDistrictRadio) stateDistrictRadio.checked = true;


    const stateFile = `${stateKey}.geojson`;
    
    fetch(stateFile)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        currentLayer = L.geoJSON(data, {
          style: {
            color: config.color,
            fillColor: config.fillColor,
            fillOpacity: config.fillOpacity,
            weight: 2
          }
        }).addTo(map);

        map.fitBounds(currentLayer.getBounds());
        
        updateStatus(`State layer for ${config.name} loaded. Select a district.`);
      })
      .catch(err => {
        console.error(`Error loading state file ${stateFile}:`, err);
        updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
      });
  }

  function handleDistrictSelection(stateKey, districtName) {
    clearLayer(); 
    clearFraLayer(); // Clear FRA layer on district change
    
    // Ensure state-district radio is checked
    const stateDistrictRadio = document.querySelector('input[name="map-layer"][value="state-district"]');
    if (stateDistrictRadio) stateDistrictRadio.checked = true;

    // Render stats remains for context
    renderStatistics(stateKey); 
    
    if (!districtName) {
        handleStateSelection(stateKey); // Fallback to state selection logic
        return;
    }

    // ... (rest of the district loading logic is the same) ...
    const config = stateData[stateKey];
    const distFile = `${stateKey}Dist.geojson`;
    updateStatus(`District selected: ${districtName}. Loading district layer...`);

    fetch(distFile)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        let selectedFeatureBounds = null;
        
        const styleFeature = (feature) => {
          // Using 'district' property
          const isSelected = feature.properties && feature.properties.district === districtName;

          if (isSelected) {
            if (!selectedFeatureBounds) {
                const tempLayer = L.geoJSON(feature);
                selectedFeatureBounds = tempLayer.getBounds();
            }
            return {
              color: config.color, 
              fillColor: config.fillColor, 
              fillOpacity: 0.6, // Increased transparency
              weight: 3
            };
          }
          // Style for other districts in the file (dimmed)
          return {
            color: '#444', 
            fillColor: '#888',
            fillOpacity: 0.1,
            weight: 1
          };
        };

        currentLayer = L.geoJSON(data, { style: styleFeature }).addTo(map);
        
        if (selectedFeatureBounds) {
            map.fitBounds(selectedFeatureBounds);
        } else {
            map.fitBounds(currentLayer.getBounds());
        }

        updateStatus(`District layer for ${districtName} loaded.`);
      })
      .catch(err => {
        console.error(`Error loading district file ${distFile}:`, err);
        updateStatus(`Could not load district file for ${config.name}. Check the console.`, true);
      });
  }
  
  // --- Event Listeners ---

  // State Dropdown Change (unchanged)
  stateDropdown.addEventListener('change', (event) => {
    const stateKey = event.target.value;
    districtDropdown.value = ""; 
    handleStateSelection(stateKey);
  });

  // District Dropdown Change (slightly modified fallback)
  districtDropdown.addEventListener('change', (event) => {
    const districtName = event.target.value;
    const stateKey = stateDropdown.value; 
    
    if (stateKey) {
      handleDistrictSelection(stateKey, districtName);
    } 
  });
  
  // 👇 NEW Layer Radio Button Listener 👇
  document.querySelectorAll('input[name="map-layer"]').forEach(radio => {
      radio.addEventListener('change', (event) => {
          const selectedLayer = event.target.value;
          const stateKey = stateDropdown.value;
          
          if (!stateKey) {
              updateStatus('Please select a State before choosing a layer.', true);
              event.target.checked = false;
              // Revert to default/uncheck all
              const defaultRadio = document.querySelector('input[name="map-layer"][value="state-district"]');
              if (defaultRadio) defaultRadio.checked = false;
              clearLayer();
              clearFraLayer();
              return;
          }
          
          if (selectedLayer === 'fra-claims') {
              // Clear state/district boundary layers
              clearLayer();
              // Load FRA layer
              toggleFraLayer(stateKey, true);
          } else if (selectedLayer === 'state-district') {
              // Clear FRA layer
              clearFraLayer();
              // Re-run state selection logic (which handles boundary/district load)
              if (districtDropdown.value && districtDropdown.value !== "-- Select a District --") {
                  handleDistrictSelection(stateKey, districtDropdown.value);
              } else {
                  handleStateSelection(stateKey);
              }
          }
          
          // The date field is purely cosmetic in this implementation
      });
  });
  // 👆 NEW Layer Radio Button Listener 👆

  // Initial state logic
  renderStatistics(null); // Ensures right panel is hidden on load
  
  // Initial message
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
