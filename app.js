document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // To hold the currently displayed GeoJSON layer (state or district)

  // --- Configuration ---

  const stateData = {
    'madhya-pradesh': { 
      name: 'Madhya Pradesh',
      color: '#1f78b4', // Primary color
      fillColor: '#a6cee3', // Fill color
      // Mock districts (ASSUMPTION: district features in the GeoJSON have a 'name' property matching these)
      districts: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Rewa', 'Sagar']
    },
    'telangana': { 
      name: 'Telangana',
      color: '#33a02c', 
      fillColor: '#b2df8a',
      districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar']
    },
    'tripura': { 
      name: 'Tripura',
      color: '#e31a1c', 
      fillColor: '#fb9a99',
      districts: ['West Tripura', 'Dhalai', 'Khowai', 'Gomati']
    },
    'odisha': { 
      name: 'Odisha',
      color: '#ff7f00', 
      fillColor: '#fdbf6f',
      districts: ['Cuttack', 'Bhubaneswar', 'Ganjam', 'Puri', 'Sambalpur']
    }
  };

  // --- DOM Elements ---

  const stateDropdown = document.getElementById('state-dropdown');
  const districtDropdown = document.getElementById('district-dropdown');
  const statusMessageDiv = document.getElementById('status-message');

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
    }
  }

  function updateStatus(message, isError = false) {
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  function handleStateSelection(stateKey) {
    clearLayer();
    
    // Reset district dropdown
    districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
    districtDropdown.disabled = true;
    
    if (!stateKey) {
      updateStatus('Please select a State to begin.');
      return;
    }

    const config = stateData[stateKey];
    updateStatus(`State selected: ${config.name}. Loading state boundary...`);
    
    // Populate District Dropdown
    config.districts.forEach(distName => {
      const option = document.createElement('option');
      option.value = distName;
      option.textContent = distName;
      districtDropdown.appendChild(option);
    });
    districtDropdown.disabled = false;
    
    // Load the State GeoJSON layer
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
        updateStatus(`State layer for ${config.name} loaded successfully. Now select a district.`);
      })
      .catch(err => {
        console.error(`Error loading state file ${stateFile}:`, err);
        updateStatus(`Could not load ${config.name} state file.`, true);
      });
  }

  function handleDistrictSelection(stateKey, districtName) {
    clearLayer(); // Remove the state layer
    
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
        
        // Define the style function to highlight the selected district
        const styleFeature = (feature) => {
          // ASSUMPTION: The district name is stored in feature.properties.name
          const isSelected = feature.properties && feature.properties.name === districtName;

          if (isSelected) {
            return {
              color: config.color, // State primary color
              fillColor: config.fillColor, // State fill color
              fillOpacity: 0.8, // High fill opacity for highlighting
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

        // Load the GeoJSON with conditional styling
        currentLayer = L.geoJSON(data, {
          style: styleFeature,
          // We can optionally filter to only show the selected district, 
          // but highlighting within the whole file is often clearer.
          // filter: (feature) => feature.properties.name === districtName // If only showing one boundary
        }).addTo(map);

        // Find the boundary of the selected district to zoom in
        const selectedFeature = data.features.find(f => f.properties.name === districtName);
        if (selectedFeature) {
          // Temporarily create a layer for the single feature to get its bounds
          const tempLayer = L.geoJSON(selectedFeature);
          map.fitBounds(tempLayer.getBounds());
          updateStatus(`Successfully loaded and highlighted ${districtName}.`);
        } else {
           // Fallback zoom to the whole district file bounds
          map.fitBounds(currentLayer.getBounds());
          updateStatus(`Successfully loaded district layer for ${config.name}, but could not find specific bounds for ${districtName}.`, true);
        }
      })
      .catch(err => {
        console.error(`Error loading district file ${distFile}:`, err);
        updateStatus(`Could not load district file for ${config.name}.`, true);
      });
  }
  
  // --- Event Listeners ---

  // State Dropdown Change
  stateDropdown.addEventListener('change', (event) => {
    const stateKey = event.target.value;
    // Ensure the district dropdown is reset when the state changes
    districtDropdown.value = ""; 
    handleStateSelection(stateKey);
  });

  // District Dropdown Change
  districtDropdown.addEventListener('change', (event) => {
    const districtName = event.target.value;
    const stateKey = stateDropdown.value; // Get the currently selected state
    
    if (stateKey && districtName) {
      handleDistrictSelection(stateKey, districtName);
    }
  });

  // Initial message
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
