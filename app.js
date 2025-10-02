document.addEventListener('DOMContentLoaded', () => {
  // --- Global Setup ---
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null; 
  let fraClaimsLayer = null; 

  // --- State Data (Placeholder, unchanged) ---
  const stateData = { /* ... your stateData object ... */ 
      'madhya-pradesh': {
          name: 'Madhya Pradesh', color: '#1f78b4', fillColor: '#a6cee3',
          districts: ['Burhanpur', 'Seoni', 'Alirajpur', /* ... */],
          stats: { claims_received: { Individual: '585,326', Community: '42,187', Total: '627,513' }, titles_distributed: { Individual: '266,901', Community: '27,976', Total: '294,877' }, land_distributed: { Individual: '903,533.06', Community: '1,463,614.46', Total: '2,367,147.52' }, claims_rejected: '322,407', claims_disposed: '617,284', percent_disposed: '98.37%', percent_titles: '46.99%' }
      },
      'telangana': {
          name: 'Telangana', color: '#33a02c', fillColor: '#b2df8a',
          districts: ['Adilabad', 'Hyderabad', 'Jagtial', /* ... */],
          stats: { claims_received: { Individual: '651,822', Community: '3,427', Total: '655,249' }, titles_distributed: { Individual: '230,735', Community: '721', Total: '231,456' }, land_distributed: { Individual: '669,689.14', Community: '457,663.17', Total: '1,127,352.32' }, claims_rejected: '94,426', claims_disposed: '325,882', percent_disposed: '49.73%', percent_titles: '35.32%' }
      },
      'tripura': {
          name: 'Tripura', color: '#e31a1c', fillColor: '#fb9a99',
          districts: ['North Tripura', 'Dhalai', 'Sipahijala', /* ... */],
          stats: { claims_received: { Individual: '200,557', Community: '164', Total: '200,721' }, titles_distributed: { Individual: '127,931', Community: '101', Total: '128,032' }, land_distributed: { Individual: '465,192.88', Community: '552.40', Total: '465,745.28' }, claims_rejected: '68,848', claims_disposed: '196,880', percent_disposed: '98.09%', percent_titles: '63.79%' }
      },
      'odisha': {
          name: 'Odisha', color: '#ff7f00', fillColor: '#fdbf6f',
          districts: ['Bhadrak', 'Dhenkanal', 'Jajpur', /* ... */],
          stats: { claims_received: { Individual: '732,530', Community: '35,843', Total: '768,373' }, titles_distributed: { Individual: '463,129', Community: '8,990', Total: '472,119' }, land_distributed: { Individual: '676,078.86', Community: '763,729.00', Total: '1,439,807.86' }, claims_rejected: '146,340', claims_disposed: '618,429', percent_disposed: '80.49%', percent_titles: '61.44%' }
      }
  };
  
  // --- FRA Polygons Data (Placeholder, unchanged) ---
  const fraClaimsGeoJSON = { /* ... your fraClaimsGeoJSON object ... */ 
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { district: "Burhanpur", state: "Madhya Pradesh", count: 1 }, geometry: { type: "Polygon", coordinates: [[[76.22, 21.32], [76.24, 21.32], [76.24, 21.30], [76.22, 21.30], [76.22, 21.32]]] }},
      // ... (24 more features) ...
      { type: "Feature", properties: { district: "Bhadrak", state: "Odisha", count: 25 }, geometry: { type: "Polygon", coordinates: [[[87.10, 21.05], [87.12, 21.05], [87.12, 21.03], [87.10, 21.03], [87.10, 21.05]]] }}
    ]
  };

  // --- DOM Elements ---
  const stateDropdown = document.getElementById('state-dropdown');
  const districtDropdown = document.getElementById('district-dropdown');
  const statisticsSidebar = document.getElementById('statistics-sidebar');
  const statisticsPanel = document.getElementById('statistics-panel');
  const statusMessageDiv = document.getElementById('status-message');
  const mapElement = document.getElementById('map');
  const fraClaimsRadio = document.getElementById('fra-claims-radio');
  const stateDistrictRadio = document.getElementById('state-district-radio');
  
  // New Collapsible elements
  const collapseToggle = document.getElementById('collapse-toggle');
  const topbarContent = document.getElementById('topbar-content');
  const topbar = document.getElementById('topbar');


  // --- Helper to synchronize layout ---
  function synchronizeLayout() {
      // Small delay to allow CSS transitions to complete
      setTimeout(() => {
          const isCollapsed = topbarContent.classList.contains('collapsed');
          const topbarHeight = topbar.offsetHeight;
          
          // Adjust map position
          mapElement.style.top = `${topbarHeight}px`;
          mapElement.style.height = `calc(100% - ${topbarHeight}px)`;

          // Adjust sidebar position
          statisticsSidebar.style.top = `${topbarHeight}px`;
          statisticsSidebar.style.height = `calc(100% - ${topbarHeight}px)`;

          // Invalidate map size to fix display issues after layout change
          map.invalidateSize();
      }, 350); 
  }


  // --- Collapsible Logic ---
  collapseToggle.addEventListener('click', () => {
      const isExpanded = topbarContent.classList.contains('expanded');
      
      if (isExpanded) {
          topbarContent.classList.remove('expanded');
          topbarContent.classList.add('collapsed');
          collapseToggle.classList.add('collapsed');
          collapseToggle.innerHTML = '&#9660;'; // Down Arrow
          collapseToggle.setAttribute('aria-expanded', 'false');
      } else {
          topbarContent.classList.remove('collapsed');
          topbarContent.classList.add('expanded');
          collapseToggle.classList.remove('collapsed');
          collapseToggle.innerHTML = '&#9650;'; // Up Arrow
          collapseToggle.setAttribute('aria-expanded', 'true');
      }
      
      // Update map and sidebar position after the collapse animation
      synchronizeLayout();
  });


  // --- Core Functions (Adjusted for Layout Sync) ---

  function clearLayer() { /* ... unchanged ... */
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
    }
  }

  function clearFraLayer() { /* ... unchanged ... */
    if (fraClaimsLayer) {
      map.removeLayer(fraClaimsLayer);
      fraClaimsLayer = null;
    }
  }

  function updateStatus(message, isError = false) { /* ... unchanged ... */
    statusMessageDiv.innerHTML = message;
    statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
    statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
  }

  function renderStatistics(stateKey) {
    if (!stateKey || !stateData[stateKey]) {
      statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>';
      statisticsSidebar.classList.add('hidden');
      mapElement.classList.remove('stats-visible');
      synchronizeLayout(); // Resync map position
      return;
    }
    
    // ... (Stats rendering logic is the same) ...
    const stats = stateData[stateKey].stats;
    const formatThreePartStat = (title, data, unit = '') => `
      <strong>${title}</strong>
      <ul>
        <li>Individual: ${data.Individual} ${unit}</li>
        <li>Community: ${data.Community} ${unit}</li>
        <li>Total: ${data.Total} ${unit}</li>
      </ul>
    `;
    statisticsPanel.innerHTML = `
      ${formatThreePartStat('Claims received', stats.claims_received)}
      ${formatThreePartStat('Titles distributed', stats.titles_distributed)}
      ${formatThreePartStat('Land distributed', stats.land_distributed, 'acres')}
      <strong>Rejected Claims:</strong> ${stats.claims_rejected}<br>
      <strong>Total Disposed:</strong> ${stats.claims_disposed}<br>
      <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 10px 0;">
      <strong>% Disposed:</strong> ${stats.percent_disposed}<br>
      <strong>% Titles over Claims:</strong> ${stats.percent_titles}
    `;
    
    statisticsSidebar.classList.remove('hidden');
    mapElement.classList.add('stats-visible');
    synchronizeLayout(); // Show sidebar and resync layout
  }

  // --- Initialization and Event Listeners (Use new handle functions) ---

  // Populate State Dropdown (unchanged)
  Object.keys(stateData).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = stateData[key].name;
    stateDropdown.appendChild(option);
  });

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
  
  // Layer Radio Button Listener
  document.querySelectorAll('input[name="map-layer"]').forEach(radio => {
      radio.addEventListener('change', (event) => {
          const selectedLayer = event.target.value;
          const stateKey = stateDropdown.value;
          const districtName = districtDropdown.value;
          
          if (!stateKey) {
              updateStatus('Please select a State before choosing a layer.', true);
              stateDistrictRadio.checked = true;
              return;
          }
          
          if (selectedLayer === 'fra-claims') {
              clearLayer();
              toggleFraLayer(stateKey, true);
          } else if (selectedLayer === 'state-district') {
              clearFraLayer();
              if (districtName && districtName !== "-- Select a District --") {
                  handleDistrictSelection(stateKey, districtName);
              } else {
                  loadStateBoundary(stateKey);
              }
          }
      });
  });

  // Call the initial layout setup
  renderStatistics(null); 
  synchronizeLayout(); 
  updateStatus('Welcome to the WebGIS system. Select a state to begin.');

  // Bind to window resize to ensure map and sidebars resize correctly
  window.addEventListener('resize', synchronizeLayout);
});
