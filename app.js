document.addEventListener('DOMContentLoaded', () => {
    // --- Global Setup ---

    const map = L.map('map').setView([22.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currentLayer = null; // State or District GeoJSON layer (Boundaries)
    let fraClaimsLayer = null; // Layer for the small polygons (FRA Claims)
    // UPDATED: thematicLayer now includes Forests
    let thematicLayer = null; 

    // --- Configuration & Data ---
    // ... (stateData remains the same) ...
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
    
    // GeoJSON for the dummy claims (Coordinates are the center points)
    // ... (fraClaimsGeoJSON remains the same) ...

    // --- DOM Elements ---
    const topBar = document.getElementById('top-bar');
    const collapseButton = document.getElementById('collapse-button');
    const stateDropdown = document.getElementById('state-dropdown');
    const districtDropdown = document.getElementById('district-dropdown');
    const statusMessageDiv = document.getElementById('status-message');
    const statisticsPanel = document.getElementById('statistics-panel');
    const fraClaimsRadio = document.getElementById('fra-claims-radio');
    const boundariesRadio = document.getElementById('boundaries-radio'); 
    const cropLandRadio = document.getElementById('crop-land-radio');
    const waterBodiesRadio = document.getElementById('water-bodies-radio');
    const homesteadsRadio = document.getElementById('homesteads-radio'); 
    // NEW: DOM element for the forests radio button
    const forestsRadio = document.getElementById('forests-radio'); 
    const statsSidebar = document.getElementById('stats-sidebar');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button'); 

    // --- Core Functions ---

    /**
     * Calculates the dynamic top padding for Leaflet's fitBounds function.
     */
    function getFitBoundsPadding() {
        // topBar.offsetHeight will be approx 38px or 270px
        const sidebarWidth = statsSidebar.classList.contains('hidden') ? 0 : 260;
        return [topBar.offsetHeight + 10, sidebarWidth]; // [Y offset, X offset]
    }
    

    function clearLayer(layerName = 'all') {
        if (layerName === 'current' || layerName === 'all') {
            if (currentLayer) {
                map.removeLayer(currentLayer);
                currentLayer = null;
            }
        }
        if (layerName === 'fra-claims' || layerName === 'all') {
            if (fraClaimsLayer) {
                map.removeLayer(fraClaimsLayer);
                fraClaimsLayer = null;
            }
        }
        // Clear Thematic Layer
        if (layerName === 'thematic' || layerName === 'all') {
            if (thematicLayer) {
                map.removeLayer(thematicLayer);
                thematicLayer = null;
            }
        }
    }

    function updateStatus(message, isError = false) {
        statusMessageDiv.innerHTML = message;
        statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
        statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    }

    /**
     * Toggles the visibility of the statistics sidebar and invalidates the map size.
     */
    function toggleStatsSidebar(show) {
        const stateSelected = stateDropdown.value !== "";
        const districtSelected = districtDropdown.value !== "";
        
        const showSidebar = show && stateSelected && !districtSelected; 

        document.body.classList.toggle('stats-open', showSidebar);
        statsSidebar.classList.toggle('hidden', !showSidebar);

        if (sidebarToggleButton) {
            sidebarToggleButton.setAttribute('aria-expanded', showSidebar);
        }
        
        setTimeout(() => map.invalidateSize(), 300);
    }

    /**
     * Renders the statistics content.
     */
    function renderStatistics(stateKey) {
        if (!stateKey) {
            statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>';
            toggleStatsSidebar(false); 
            return;
        }

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

            <strong>Claims rejected:</strong> ${stats.claims_rejected}<br><br>

            <strong>Claims Disposed off:</strong> ${stats.claims_disposed}<br><br>

            <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 8px 0;">

            <strong>% Claims disposed:</strong> ${stats.percent_disposed}<br><br>

            <strong>% Titles distributed:</strong> ${stats.percent_titles}<br>
        `;
    }

    function renderFraClaims(stateKey, districtName) {
        clearLayer('fra-claims'); 
        clearLayer('thematic');

        if (!stateKey) return;
        // ... (renderFraClaims logic remains the same) ...
    }


    function renderBoundaries(stateKey, districtName) {
        clearLayer('fra-claims'); 
        clearLayer('thematic');
        clearLayer('current'); 

        if (!stateKey) return;
        // ... (renderBoundaries logic remains the same) ...
    }

    /**
     * Renders thematic layers (Agricultural Land, Water Bodies, Homesteads, Forests).
     */
    function renderThematicLayer(stateKey, layerType) {
        clearLayer('fra-claims');
        clearLayer('thematic');

        // Rule: Only allow thematic layers for Madhya Pradesh
        if (stateKey !== 'madhya-pradesh') {
            updateStatus('Thematic layers (Crop Land, Water, Homesteads, Forests) are only available for **Madhya Pradesh**.', true);
            // Revert to boundaries radio button
            boundariesRadio.checked = true;
            renderBoundaries(stateKey, districtDropdown.value || null);
            return;
        }

        let fileName = '';
        let layerName = '';
        let style = {};

        switch (layerType) {
            case 'crop-land':
                fileName = 'yellow_crop_land.geojson';
                layerName = 'Agricultural Land';
                style = { color: '#FFD700', fillColor: '#FFD700', fillOpacity: 0.5, weight: 1.5 };
                break;
            case 'water-bodies':
                fileName = 'blue_finally.geojson'; 
                layerName = 'Water Bodies';
                style = { color: '#00BFFF', fillColor: '#00BFFF', fillOpacity: 0.8, weight: 1.5 };
                break;
            case 'homesteads':
                fileName = 'red_finally.geojson';
                layerName = 'Homesteads';
                style = { color: '#FF4500', fillColor: '#FF4500', fillOpacity: 0.7, weight: 1.5 };
                break;
            // NEW CASE: Forest Cover Layer
            case 'forests':
                fileName = 'land_use.geojson';
                layerName = 'Forest Cover';
                // Using a suitable green color for forests
                style = { color: '#006400', fillColor: '#38761d', fillOpacity: 0.6, weight: 1.5 }; 
                break;
            default:
                return;
        }

        updateStatus(`Loading thematic layer: ${layerName}...`);

        // IMPORTANT: We keep the State/District boundary layer ('currentLayer') on the map, 
        // but we remove the district highlight to avoid visual clutter.
        if (currentLayer) {
            clearLayer('current');
            renderBoundaries(stateKey, null); // Re-render state boundary without district highlight
        }

        fetch(fileName)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                thematicLayer = L.geoJSON(data, {
                    style: style,
                    onEachFeature: (feature, layer) => {
                         // Simple popup showing just the layer type name
                        layer.bindPopup(`<strong>Layer:</strong> ${layerName}`);
                    }
                }).addTo(map);

                // Fit bounds to the new thematic layer
                map.fitBounds(thematicLayer.getBounds(), {
                    paddingTopLeft: getFitBoundsPadding()
                });

                updateStatus(`Displaying ${layerName} for Madhya Pradesh.`);
            })
            .catch(err => {
                console.error(`Error loading file ${fileName}:`, err);
                updateStatus(`Could not load ${layerName} file. Please ensure the file is named '${fileName}' and is in the correct directory. Check the console for details.`, true);
            });
    }


    // --- State and District Logic ---

    function handleStateSelection(stateKey) {
        clearLayer();
        districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
        districtDropdown.disabled = true;

        if (!stateKey) {
            updateStatus('Please select a State to begin.');
            renderStatistics(null);
            return;
        }

        const config = stateData[stateKey];
        renderStatistics(stateKey); 
        
        // Populate districts
        config.districts.forEach(distName => {
            const option = document.createElement('option');
            option.value = distName;
            option.textContent = distName;
            districtDropdown.appendChild(option);
        });
        districtDropdown.disabled = false;
        
        // Render the default layer (boundaries)
        renderBoundaries(stateKey, null); 
        
        // Set sidebar state: If top bar is collapsed, the sidebar should open now (State-only view).
        const topBarCollapsed = topBar.classList.contains('collapsed');
        toggleStatsSidebar(topBarCollapsed);
    }

    function handleDistrictSelection(stateKey, districtName) {
        renderStatistics(stateKey); 
        
        if (!districtName) {
            handleStateSelection(stateKey);
            return;
        }
        
        // Only render boundaries or FRA claims on district selection.
        if (boundariesRadio.checked) {
            renderBoundaries(stateKey, districtName);
        } else if (fraClaimsRadio.checked) {
            renderFraClaims(stateKey, districtName);
        } else {
             // If a thematic layer is selected, revert to boundaries when district changes
            boundariesRadio.checked = true;
            renderBoundaries(stateKey, districtName);
        }

        // Rule: When a district is selected, hide the sidebar.
        toggleStatsSidebar(false); 
    }


    // --- Initialization: Populate State Dropdown ---

    Object.keys(stateData).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = stateData[key].name;
        stateDropdown.appendChild(option);
    });

    // --- Event Listeners ---

    // Top Bar Collapse Toggle (Controls control panel and sidebar visibility based on rules)
    collapseButton.addEventListener('click', () => {
        const isCollapsed = topBar.classList.toggle('collapsed');
        collapseButton.setAttribute('aria-expanded', !isCollapsed);
        
        toggleStatsSidebar(isCollapsed);

        setTimeout(() => {
            map.invalidateSize();
            const layerToFit = thematicLayer || fraClaimsLayer || currentLayer; 
            if (layerToFit) {
                 map.fitBounds(layerToFit.getBounds(), {
                     paddingTopLeft: getFitBoundsPadding(),
                     animate: true 
                 });
            }
        }, 300); 
    });

    // NEW: Sidebar Manual Toggle Button
    sidebarToggleButton.addEventListener('click', () => {
        const isCurrentlyHidden = statsSidebar.classList.contains('hidden');
        toggleStatsSidebar(isCurrentlyHidden); 
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

    // Layer Radio Button Change
    document.querySelectorAll('input[name="layer-type"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            const stateKey = stateDropdown.value;
            const districtName = districtDropdown.value;
            const layerType = event.target.value;

            if (!stateKey) {
                updateStatus('Select a state before changing the layer view.');
                // Revert to boundaries radio
                boundariesRadio.checked = true;
                return;
            }

            // UPDATED LIST: Include 'forests'
            const thematicLayers = ['crop-land', 'water-bodies', 'homesteads', 'forests']; 

            // If a thematic layer is selected, and a district is selected, clear district
            if (thematicLayers.includes(layerType) && districtName) {
                districtDropdown.value = "";
                // Re-call handleStateSelection to re-render boundaries without district highlight
                handleStateSelection(stateKey);
                // After re-rendering boundaries, proceed to load thematic layer
            }

            // Hide sidebar if a thematic layer is chosen
            if (thematicLayers.includes(layerType)) {
                toggleStatsSidebar(false);
                renderThematicLayer(stateKey, layerType);
            } else if (boundariesRadio.checked) {
                // District will be null if a thematic layer was previously selected and cleared it.
                renderBoundaries(stateKey, districtDropdown.value || null); 
            } else if (fraClaimsRadio.checked) {
                renderFraClaims(stateKey, districtDropdown.value || null);
            }
        });
    });
    
    // Initial message
    updateStatus('Welcome to the FRA Atlas. Select a state to begin.');
});
