document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // To hold the currently displayed GeoJSON layer (state or district)

  // --- Configuration ---
  // NOTE: The 'key' (e.g., 'madhya-pradesh') is used to construct filenames: key + '.geojson' and key + 'Dist.geojson'
  const stateData = {
    'madhya-pradesh': { 
      name: 'Madhya Pradesh',
      color: '#1f78b4', // Primary color
      fillColor: '#a6cee3', // Fill color
      districts: [
        'Burhanpur', 'Seoni', 'Alirajpur', 'Chhindwara', 'Harda', 'Khargone', 'Khandwa', 
        'Balaghat', 'Barwani', 'Betul', 'Morena', 'Bhind', 'Gwalior', 'Sheopur', 
        'Shivpuri', 'Tikamgarh', 'Neemuch', 'Rewa', 'Satna', 'Guna', 'Ashoknagar', 
        'Mandsaur', 'Singrauli', 'Sidhi', 'Sagar', 'Damoh', 'Shajapur', 'Vidisha', 
        'Rajgarh', 'Shahdol', 'Katni', 'Umaria', 'Ratlam', 'Bhopal', 'Ujjain', 
        'Raisen', 'Sehore', 'Jabalpur', 'Dewas', 'Anuppur', 'Jhabua', 'Dindori', 
        'Narsinghpur', 'Dhar', 'Indore', 'Mandla', 'Hoshangabad', 'Agar Malwa', 
        'Datia', 'Chhatarpur', 'Panna', 'Niwari'
      ]
    },
    'telangana': { 
      name: 'Telangana',
      color: '#33a02c', 
      fillColor: '#b2df8a',
      districts: [
        'Adilabad', 'Hyderabad', 'Jagtial', 'Jangaon', 'Mulugu', 'Jogulamba Gadwal', 
        'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad', 
        'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Nagarkurnool', 
        'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 
        'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 
        'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri',
        'Bhadradri Kothagudem', 'Jayashankar Bhupalapally', 'Narayanpet'
      ]
    },
    'tripura': { 
      name: 'Tripura',
      color: '#e31a1c', 
      fillColor: '#fb9a99',
      districts: [
        'North Tripura', 'Dhalai', 'Sipahijala', 'Gomati', 'Khowai', 
        'West Tripura', 'South Tripura', 'Unokoti'
      ]
    },
    'odisha': { 
      name: 'Odisha',
      color: '#ff7f00', 
      fillColor: '#fdbf6f',
      districts: [
        'Bhadrak', 'Dhenkanal', 'Jajpur', 'Subarnapur', 'Nuapada', 'Balangir', 
        'Boudh', 'Cuttack', 'Kandhamal', 'Nayagarh', 'Khordha', 'Kalahandi', 
        'Jagatsinghpur', 'Puri', 'Nabarangapur', 'Rayagada', 'Koraput', 
        'Malkangiri', 'Angul', 'Kendrapara', 'Ganjam', 'Gajapati', 'Mayurbhanj', 
        'Sundargarh', 'Kendujhar', 'Balasore', 'Jharsuguda', 'Bargarh', 
        'Deogarh', 'Sambalpur'
      ]
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
        updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
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
          // *** FIX APPLIED: Using 'district' property ***
          const isSelected = feature.properties && feature.properties.district === districtName;

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
          style: styleFeature
        }).addTo(map);

        // Find the boundary of the selected district to zoom in
        // *** FIX APPLIED: Using 'district' property ***
        const selectedFeature = data.features.find(f => f.properties.district === districtName);
        if (selectedFeature) {
          // Temporarily create a layer for the single feature to get its bounds
          const tempLayer = L.geoJSON(selectedFeature);
          map.fitBounds(tempLayer.getBounds());
          updateStatus(`Successfully loaded and highlighted ${districtName}.`);
        } else {
          // Fallback zoom to the whole district file bounds
          map.fitBounds(currentLayer.getBounds());
          updateStatus(`Successfully loaded district layer for ${config.name}, but could not find specific bounds for ${districtName}. Check GeoJSON 'district' property.`, true);
        }
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
