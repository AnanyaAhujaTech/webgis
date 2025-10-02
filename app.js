document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---

  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; // State or District GeoJSON layer
  let claimsLayer = L.layerGroup().addTo(map); // Layer group for claims visualization
  
  // --- Configuration & Data ---
  
  // Statistical Data Structure
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

  // Hardcoded GeoJSON Polygons for Claims (Simplified small squares)
  // Each feature must have a 'district' property to enable filtering.
  const hardcodedClaimsData = [
    // Madhya Pradesh - Burhanpur (3 Claims) - Approx center 21.3° N, 76.2° E
    { district: 'Burhanpur', coords: [[[76.20, 21.30], [76.21, 21.30], [76.21, 21.31], [76.20, 21.31], [76.20, 21.30]]], claimId: 'MP-BH-001' },
    { district: 'Burhanpur', coords: [[[76.15, 21.25], [76.16, 21.25], [76.16, 21.26], [76.15, 21.26], [76.15, 21.25]]], claimId: 'MP-BH-002' },
    { district: 'Burhanpur', coords: [[[76.28, 21.40], [76.29, 21.40], [76.29, 21.41], [76.28, 21.41], [76.28, 21.40]]], claimId: 'MP-BH-003' },
    
    // Madhya Pradesh - Seoni (5 Claims) - Approx center 22.08° N, 79.5° E
    { district: 'Seoni', coords: [[[79.50, 22.08], [79.51, 22.08], [79.51, 22.09], [79.50, 22.09], [79.50, 22.08]]], claimId: 'MP-SE-001' },
    { district: 'Seoni', coords: [[[79.60, 22.15], [79.61, 22.15], [79.61, 22.16], [79.60, 22.16], [79.60, 22.15]]], claimId: 'MP-SE-002' },
    { district: 'Seoni', coords: [[[79.40, 21.90], [79.41, 21.90], [79.41, 21.91], [79.40, 21.91], [79.40, 21.90]]], claimId: 'MP-SE-003' },
    { district: 'Seoni', coords: [[[79.70, 22.00], [79.71, 22.00], [79.71, 22.01], [79.70, 22.01], [79.70, 22.00]]], claimId: 'MP-SE-004' },
    { district: 'Seoni', coords: [[[79.30, 22.20], [79.31, 22.20], [79.31, 22.21], [79.30, 22.21], [79.30, 22.20]]], claimId: 'MP-SE-005' },

    // Telangana - Adilabad (4 Claims) - Approx center 19.66° N, 78.53° E
    { district: 'Adilabad', coords: [[[78.50, 19.60], [78.51, 19.60], [78.51, 19.61], [78.50, 19.61], [78.50, 19.60]]], claimId: 'TL-AD-001' },
    { district: 'Adilabad', coords: [[[78.60, 19.70], [78.61, 19.70], [78.61, 19.71], [78.60, 19.71], [78.60, 19.70]]], claimId: 'TL-AD-002' },
    { district: 'Adilabad', coords: [[[78.45, 19.50], [78.46, 19.50], [78.46, 19.51], [78.45, 19.51], [78.45, 19.50]]], claimId: 'TL-AD-003' },
    { district: 'Adilabad', coords: [[[78.55, 19.80], [78.56, 19.80], [78.56, 19.81], [78.55, 19.81], [78.55, 19.80]]], claimId: 'TL-AD-004' },
    
    // Tripura - North Tripura (6 Claims) - Approx center 24.31° N, 92.01° E
    { district: 'North Tripura', coords: [[[92.00, 24.30], [92.01, 24.30], [92.01, 24.31], [92.00, 24.31], [92.00, 24.30]]], claimId: 'TR-NT-001' },
    { district: 'North Tripura', coords: [[[92.10, 24.35], [92.11, 24.35], [92.11, 24.36], [92.10, 24.36], [92.10, 24.35]]], claimId: 'TR-NT-002' },
    { district: 'North Tripura', coords: [[[91.90, 24.20], [91.91, 24.20], [91.91, 24.21], [91.90, 24.21], [91.90, 24.20]]], claimId: 'TR-NT-003' },
    { district: 'North Tripura', coords: [[[92.20, 24.40], [92.21, 24.40], [92.21, 24.41], [92.20, 24.41], [92.20, 24.40]]], claimId: 'TR-NT-004' },
    { district: 'North Tripura', coords: [[[91.80, 24.50], [91.81, 24.50], [91.81, 24.51], [91.80, 24.51], [91.80, 24.50]]], claimId: 'TR-NT-005' },
    { district: 'North Tripura', coords: [[[92.30, 24.60], [92.31, 24.60], [92.31, 24.61], [92.30, 24.61], [92.30, 24.60]]], claimId: 'TR-NT-006' },

    // Odisha - Bhadrak (7 Claims) - Approx center 21.05° N, 86.5° E
    { district: 'Bhadrak', coords: [[[86.50, 21.05], [86.51, 21.05], [86.51, 21.06], [86.50, 21.06], [86.50, 21.05]]], claimId: 'OD-BH-001' },
    { district: 'Bhadrak', coords: [[[86.40, 21.10], [86.41, 21.10], [86.41, 21.11], [86.40, 21.11], [86.40, 21.10]]], claimId: 'OD-BH-002' },
    { district: 'Bhadrak', coords: [[[86.60, 21.15], [86.61, 21.15], [86.61, 21.16], [86.60, 21.16], [86.60, 21.15]]], claimId: 'OD-BH-003' },
    { district: 'Bhadrak', coords: [[[86.30, 21.00], [86.31, 21.00], [86.31, 21.01], [86.30, 21.01], [86.30, 21.00]]], claimId: 'OD-BH-004' },
    { district: 'Bhadrak', coords: [[[86.70, 21.20], [86.71, 21.20], [86.71, 21.21], [86.70, 21.21], [86.70, 21.20]]], claimId: 'OD-BH-005' },
    { district: 'Bhadrak', coords: [[[86.20, 20.90], [86.21, 20.90], [86.21, 20.91], [86.20, 20.91], [86.20, 20.90]]], claimId: 'OD-BH-006' },
    { district: 'Bhadrak', coords: [[[86.80, 20.80], [86.81, 20.80], [86.81, 20.81], [86.80, 20.81], [86.80, 20.80]]], claimId: 'OD-BH-007' }
  ];


  // --- DOM Elements ---

  const stateDropdown = document.getElementById('state-dropdown');
  const districtDropdown = document.getElementById('district-dropdown');
  const statusMessageDiv = document.getElementById('status-message');
  const statisticsPanel = document.getElementById('statistics-panel');
  const stateNameHeader = document.getElementById('state-name-header');
  const statsSidebar = document.getElementById('stats-sidebar');
  const claimsCheckbox = document.getElementById('claims-checkbox');
  const claimDateField = document.getElementById('claim-date');

  // --- Helper Functions ---

  function clearLayer() {
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
    }
    claimsLayer.clearLayers();
    
    // Reset controls
    claimsCheckbox.checked = false;
    claimsCheckbox.disabled = true;
    claimDateField.disabled = true;
    
    // Clear sidebar stats
    statisticsPanel.innerHTML = '<p>Select a state to load data.</p>';
    statsSidebar.classList.add('hidden'); // Hide the entire stats panel
  }

  function updateStatus(message, isError = false) {
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  function renderStatistics(stateKey) {
    const stats = stateData[stateKey].stats;
    const stateName = stateData[stateKey].name;
    
    stateNameHeader.textContent = stateName;
    statsSidebar.classList.remove('hidden'); // Show the panel
    
    // Function to format the three-part stats (Individual, Community, Total)
    const formatThreePartStat = (title, data, unit = '') => `
      <strong>${title}</strong>
      <ul>
        <li><span>Individual:</span> <span>${data.Individual} ${unit}</span></li>
        <li><span>Community:</span> <span>${data.Community} ${unit}</span></li>
        <li><span>Total:</span> <span>${data.Total} ${unit}</span></li>
      </ul>
    `;
    
    statisticsPanel.innerHTML = `
      ${formatThreePartStat('No. of claims received', stats.claims_received)}
      ${formatThreePartStat('No. of titles distributed', stats.titles_distributed)}
      ${formatThreePartStat('Extent of forest land titles (in acres)', stats.land_distributed)}
      
      <strong>No. of claims rejected:</strong> <span>${stats.claims_rejected}</span><br>
      <strong>Total No. of Claims Disposed off:</strong> <span>${stats.claims_disposed}</span><br>
      
      <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 10px 0;">
      
      <strong>% of Claims disposed off w.r.t. claims received:</strong> <span>${stats.percent_disposed}</span><br>
      <strong>% of Titles distributed over number of claims received:</strong> <span>${stats.percent_titles}</span>
    `;
  }
  
  // --- Claim Generation/Filtering ---
  
  const claimPopupContent = (claim) => `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <h4 style="margin-top: 0; color: #006400;">FRA Claim ID: ${claim.claimId}</h4>
        <hr style="border-top: 1px solid #ccc;">
        <p><strong>Note:</strong> Data below is placeholder. Please add actual details in the source code.</p>
        <ul>
            <li><strong>1. Name(s) of holder(s):</strong> [Individual/Community Name]</li>
            <li><strong>2. Village/Gram Sabha:</strong> [Village Name]</li>
            <li><strong>3. Gram Panchayat:</strong> [GP Name]</li>
            <li><strong>4. Tehsil/Taluka:</strong> [Tehsil/Taluka Name]</li>
            <li><strong>5. District:</strong> ${claim.district}</li>
        </ul>
    </div>
  `;

  function filterAndDisplayClaims(stateKey, districtName = null) {
      claimsLayer.clearLayers();

      const filteredClaims = hardcodedClaimsData.filter(claim => {
          // Filter by state first (all districts belong to the state)
          const isStateMatch = stateData[stateKey].districts.includes(claim.district);

          if (districtName) {
              // If district is specified, only show claims in that district
              return isStateMatch && claim.district === districtName;
          } else {
              // If only state is selected, show claims across all its hardcoded districts
              return isStateMatch;
          }
      });
      
      if (filteredClaims.length === 0) {
          updateStatus('No hardcoded claims found for this selection.', true);
          return;
      }

      const features = filteredClaims.map(claim => ({
          type: 'Feature',
          geometry: {
              type: 'Polygon',
              coordinates: [claim.coords[0]]
          },
          properties: {
              district: claim.district,
              claimId: claim.claimId,
              popupContent: claimPopupContent(claim)
          }
      }));

      L.geoJSON(features, {
          style: {
              color: '#006400', 
              fillColor: '#90EE90',
              fillOpacity: 0.8,
              weight: 2
          },
          onEachFeature: (feature, layer) => {
              layer.bindPopup(feature.properties.popupContent);
          }
      }).addTo(claimsLayer);

      updateStatus(`Displayed ${claimsLayer.getLayers().length} sample FRA claim polygons.`);
  }

  // --- Event Handlers (Modified) ---

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
    renderStatistics(stateKey); // RENDER STATS PANEL

    config.districts.forEach(distName => {
      const option = document.createElement('option');
      option.value = distName;
      option.textContent = distName;
      districtDropdown.appendChild(option);
    });
    districtDropdown.disabled = false;
    
    // Enable claim controls
    claimsCheckbox.disabled = false;
    claimDateField.disabled = false;

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
        
        updateStatus(`State layer for ${config.name} loaded.`);
      })
      .catch(err => {
        console.error(`Error loading state file ${stateFile}:`, err);
        updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
      });
  }

  function handleDistrictSelection(stateKey, districtName) {
    // Keep stats panel visible by only calling clearLayer for layer removal
    if (currentLayer) map.removeLayer(currentLayer);
    claimsLayer.clearLayers();
    claimsCheckbox.checked = false; // Reset claims display

    renderStatistics(stateKey); 
    
    if (!districtName) {
        handleStateSelection(stateKey);
        return;
    }

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
          const isSelected = feature.properties && feature.properties.district === districtName;

          if (isSelected) {
            if (!selectedFeatureBounds) {
                const tempLayer = L.geoJSON(feature);
                selectedFeatureBounds = tempLayer.getBounds();
            }
            return { color: config.color, fillColor: config.fillColor, fillOpacity: 0.6, weight: 3 };
          }
          return { color: '#444', fillColor: '#888', fillOpacity: 0.1, weight: 1 };
        };

        currentLayer = L.geoJSON(data, { style: styleFeature }).addTo(map);
        
        if (selectedFeatureBounds) {
            map.fitBounds(selectedFeatureBounds);
        } else {
            map.fitBounds(currentLayer.getBounds());
        }

        updateStatus(`District layer for ${districtName} loaded. Check the 'Areas claimed' box to see sample claims.`);
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
    
    if (stateKey) {
        handleDistrictSelection(stateKey, districtName);
    }
  });

  // Claims Checkbox Toggle
  claimsCheckbox.addEventListener('change', (event) => {
      claimsLayer.clearLayers();
      
      const stateKey = stateDropdown.value;
      const districtName = districtDropdown.value || null;

      if (event.target.checked) {
          if (stateKey) {
              filterAndDisplayClaims(stateKey, districtName);
          } else {
              claimsCheckbox.checked = false;
              updateStatus('Please select a State first.', true);
          }
      } else {
          updateStatus('FRA claimed areas visualization removed.');
      }
  });


  // Initial message
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
