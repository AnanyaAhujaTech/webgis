document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // State or District GeoJSON layer
  // landUseLayer removed

  // --- Configuration & Data ---
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
  const statisticsPanel = document.getElementById('statistics-panel');

  // --- Core Functions ---

  function clearLayer() {
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
    }
    // Clear sidebar stats when layer is cleared
    statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>';
  }

  function updateStatus(message, isError = false) {
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  function renderStatistics(stateKey) {
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
  }
  
  // --- Initialization: Populate State Dropdown ---

  Object.keys(stateData).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = stateData[key].name;
    stateDropdown.appendChild(option);
  });

  // --- Event Handlers ---

  function handleStateSelection(stateKey) {
    clearLayer();
    
    // Set current bounds for the state (even if not used for query, helpful for map state)
    let currentBounds = null;
    
    districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
    districtDropdown.disabled = true;
    
    if (!stateKey) {
      updateStatus('Please select a State to begin.');
      return;
    }

    const config = stateData[stateKey];
    updateStatus(`State selected: ${config.name}. Loading state boundary...`);
    
    // Render the statistics immediately
    renderStatistics(stateKey);

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

        map.fitBounds(currentLayer.getBounds());
        
        updateStatus(`State layer for ${config.name} loaded. Select a district.`);
      })
      .catch(err => {
        console.error(`Error loading state file ${stateFile}:`, err);
        updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
      });
  }

  function handleDistrictSelection(stateKey, districtName) {
    clearLayer(); // Clears state layer and stats panel
    renderStatistics(stateKey); // Re-render stats for context
    
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
    
    if (stateKey && districtName) {
      handleDistrictSelection(stateKey, districtName);
    } else {
        // If they select '-- Select a District --' after a State, reload the full state
        handleStateSelection(stateKey);
    }
  });

  // Initial message
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
