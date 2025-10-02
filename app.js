document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // State or District GeoJSON layer
  let landUseLayer = L.layerGroup().addTo(map); // Layer group for OSM data (Forest/Agri)
  let currentBounds = null; // Stores the bounds of the current state/district selection (no longer used for query, but kept for future reference)

  // --- Configuration ---
  const stateData = {
    'madhya-pradesh': { 
      name: 'Madhya Pradesh', color: '#1f78b4', fillColor: '#a6cee3', 
      districts: ['Burhanpur', 'Seoni', 'Alirajpur', 'Chhindwara', 'Harda', 'Khargone', 'Khandwa', 'Balaghat', 'Barwani', 'Betul', 'Morena', 'Bhind', 'Gwalior', 'Sheopur', 'Shivpuri', 'Tikamgarh', 'Neemuch', 'Rewa', 'Satna', 'Guna', 'Ashoknagar', 'Mandsaur', 'Singrauli', 'Sidhi', 'Sagar', 'Damoh', 'Shajapur', 'Vidisha', 'Rajgarh', 'Shahdol', 'Katni', 'Umaria', 'Ratlam', 'Bhopal', 'Ujjain', 'Raisen', 'Sehore', 'Jabalpur', 'Dewas', 'Anuppur', 'Jhabua', 'Dindori', 'Narsinghpur', 'Dhar', 'Indore', 'Mandla', 'Hoshangabad', 'Agar Malwa', 'Datia', 'Chhatarpur', 'Panna', 'Niwari']
    },
    'telangana': { 
      name: 'Telangana', color: '#33a02c', fillColor: '#b2df8a', 
      districts: ['Adilabad', 'Hyderabad', 'Jagtial', 'Jangaon', 'Mulugu', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Nagarkurnool', 'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri', 'Bhadradri Kothagudem', 'Jayashankar Bhupalapally', 'Narayanpet']
    },
    'tripura': { 
      name: 'Tripura', color: '#e31a1c', fillColor: '#fb9a99', 
      districts: ['North Tripura', 'Dhalai', 'Sipahijala', 'Gomati', 'Khowai', 'West Tripura', 'South Tripura', 'Unokoti']
    },
    'odisha': { 
      name: 'Odisha', color: '#ff7f00', fillColor: '#fdbf6f', 
      districts: ['Bhadrak', 'Dhenkanal', 'Jajpur', 'Subarnapur', 'Nuapada', 'Balangir', 'Boudh', 'Cuttack', 'Kandhamal', 'Nayagarh', 'Khordha', 'Kalahandi', 'Jagatsinghpur', 'Puri', 'Nabarangapur', 'Rayagada', 'Koraput', 'Malkangiri', 'Angul', 'Kendrapara', 'Ganjam', 'Gajapati', 'Mayurbhanj', 'Sundargarh', 'Kendujhar', 'Balasore', 'Jharsuguda', 'Bargarh', 'Deogarh', 'Sambalpur']
    }
  };
  
  const landUseStyles = {
    'forest': { color: '#006400', fillColor: '#388E3C', fillOpacity: 0.7, weight: 1, tags: 'leisure=forest or landuse=forest' },
    'agriculture': { color: '#D4AC0D', fillColor: '#F4D03F', fillOpacity: 0.7, weight: 1, tags: 'landuse=farmland or landuse=farmyard or landuse=allotments' }
  };


  // --- DOM Elements ---

  const stateDropdown = document.getElementById('state-dropdown');
  const districtDropdown = document.getElementById('district-dropdown');
  const statusMessageDiv = document.getElementById('status-message');
  const forestRadio = document.getElementById('forest-radio');
  const agriRadio = document.getElementById('agri-radio');
  const landuseForm = document.getElementById('landuse-form');

  // --- Helper: Toggle UI state during query ---
  function toggleQueryState(isQuerying) {
    document.body.style.cursor = isQuerying ? 'wait' : 'default';
    // Lock controls to prevent accidental double-clicks or reloads during a query
    forestRadio.disabled = isQuerying;
    agriRadio.disabled = isQuerying;
    stateDropdown.disabled = isQuerying;
    districtDropdown.disabled = isQuerying;
  }
  // ---------------------------------------------


  // --- Initialization: Populate State Dropdown ---

  Object.keys(stateData).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = stateData[key].name;
    stateDropdown.appendChild(option);
  });

  // --- Core Functions ---

  function clearLayer() {
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
      currentBounds = null; // Clear bounds as well
    }
    landUseLayer.clearLayers();
    // Reset land use radio buttons
    landuseForm.querySelector('input[value="none"]').checked = true;
    forestRadio.disabled = true;
    agriRadio.disabled = true;
  }

  function updateStatus(message, isError = false) {
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  // --- Overpass Query Functions (UPDATED) ---

  function queryOverpass(layerType) {
    // Check if the state/district controls are currently disabled (meaning nothing is selected)
    if (stateDropdown.disabled && districtDropdown.disabled) {
        updateStatus('Select a State or District first to query land use data.', true);
        return;
    }
    
    landUseLayer.clearLayers();
    const style = landUseStyles[layerType];
    
    // --- FIX 1: Use the current map viewport bounds for the query ---
    const mapBounds = map.getBounds();
    // Format: lat_min, lon_min, lat_max, lon_max
    const bounds = mapBounds.toBBoxString().split(',').reverse().join(','); 
    // -----------------------------------------------------------------

    // --- FIX 2: Set query state and display immediate feedback ---
    toggleQueryState(true);
    updateStatus(`Querying OpenStreetMap for ${layerType} within current view... (May take time)`);
    // -------------------------------------------------------------

    // Overpass Query Language (QL) to find areas within the bounds
    const overpassQL = `
        [out:json][timeout:60];
        (
          node[${style.tags}](${bounds});
          way[${style.tags}](${bounds});
          relation[${style.tags}](${bounds});
        );
        out geom;
    `;
    
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQL)}`;

    // Use leaflet-omnivore to handle the OSM XML/JSON response and convert to GeoJSON layers
    const omnivoreLayer = omnivore.overpass(overpassUrl, {
        onEachFeature: function(feature, layer) {
             // Optional: Bind popup with feature tags
        }
    }, L.geoJSON(null, {
        style: style // Apply the layer's dedicated style
    }));

    omnivoreLayer
        .on('ready', function() {
            landUseLayer.addLayer(this);
            updateStatus(`${layerType} layer loaded (visible in current view). Zoom in/out to query a different area.`);
            toggleQueryState(false); // End query state
        })
        .on('error', function(e) {
             console.error('Overpass API Error:', e);
             updateStatus(`Error: Query failed. Try zooming in to a smaller area.`, true);
             toggleQueryState(false); // End query state
        });
  }

  function handleStateSelection(stateKey) {
    clearLayer();
    
    districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
    districtDropdown.disabled = true;
    
    if (!stateKey) {
      updateStatus('Please select a State to begin.');
      return;
    }

    const config = stateData[stateKey];
    updateStatus(`State selected: ${config.name}. Loading state boundary...`);
    
    config.districts.forEach(distName => {
      const option = document.createElement('option');
      option.value = distName;
      option.textContent = distName;
      districtDropdown.appendChild(option);
    });
    districtDropdown.disabled = false;
    
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

        currentBounds = currentLayer.getBounds();
        map.fitBounds(currentBounds);
        
        forestRadio.disabled = false;
        agriRadio.disabled = false;
        updateStatus(`State layer for ${config.name} loaded. Select a district or land use layer.`);
      })
      .catch(err => {
        console.error(`Error loading state file ${stateFile}:`, err);
        updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
      });
  }

  function handleDistrictSelection(stateKey, districtName) {
    clearLayer(); 
    
    if (!districtName) return;

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
          // *** FINAL FIX: Using 'district' property ***
          const isSelected = feature.properties && feature.properties.district === districtName;

          if (isSelected) {
            // Save the bounds of the selected feature for map zoom
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
        
        // Use the calculated bounds to set global bounds and zoom
        if (selectedFeatureBounds) {
            currentBounds = selectedFeatureBounds;
            map.fitBounds(currentBounds);
        } else {
             // Fallback: zoom to the whole district file bounds (this shouldn't happen)
            currentBounds = currentLayer.getBounds();
            map.fitBounds(currentBounds);
        }

        forestRadio.disabled = false;
        agriRadio.disabled = false;
        updateStatus(`District layer for ${districtName} loaded. Select a land use layer.`);
      })
      .catch(err => {
        console.error(`Error loading district file ${distFile}:`, err);
        updateStatus(`Could not load district file for ${config.name}. Check the console.`, true);
      });
  }
  
  // --- Event Listeners ---

  // State Dropdown Change
  stateDropdown.addEventListener('change', (event) => {
    const stateKey = event.target.value;
    districtDropdown.value = ""; 
    handleStateSelection(stateKey);
  });

  // District Dropdown Change
  districtDropdown.addEventListener('change', (event) => {
    const districtName = event.target.value;
    const stateKey = stateDropdown.value; 
    
    // Only proceed if a state is selected and a district is chosen
    if (stateKey && districtName) {
      handleDistrictSelection(stateKey, districtName);
    } else {
        // If they select '-- Select a District --' after a State, revert to State view
        handleStateSelection(stateKey);
    }
  });

  // Land Use Radio Buttons Change
  landuseForm.addEventListener('change', (event) => {
      landUseLayer.clearLayers();
      const selectedValue = event.target.value;

      if (selectedValue === 'forest') {
          queryOverpass('forest');
      } else if (selectedValue === 'agriculture') {
          queryOverpass('agriculture');
      } else if (selectedValue === 'none') {
          updateStatus('Land use layer removed.');
      }
  });


  // Initial message
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
