document.addEventListener('DOMContentLoaded', () => {
    // --- Global Setup ---

    const map = L.map('map').setView([22.5937, 78.9629], 5);

    // Initial Base Layer (OpenStreetMap standard tiles)
    const openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    let currentLayer = null; // State or District GeoJSON layer (Boundaries)
    let fraClaimsLayer = null; // Layer for the small polygons (FRA Claims)
    
    // --- Configuration & Data (remains the same) ---
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
    
    // Custom name list for popups (remains the same)
    const holderNames = [
        "Sunder Das Ahuja", "Harvardhan Kumar", "Rajesh Gupta", "Arth Goyal", "Dinesh Ghai", 
        "Tripti Rao", "Ramesh Shankar", "Manoj Roy", "Ridhi Kumari", "Radha Rani", 
        "Kareena Kumari", "Vivek Rao", "Akshay Soni", "Atharv Verma", "Dilip Sharma",  
        "Nitin Jhangra", "Pankaj Choudhari", "Pooja Tripathi", "Preet Bajpayee"
    ];

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function createDummySquarePolygon(lat, lon, state, district, id) {
        const size = 0.005; 
        const halfSize = size / 2;
        
        const vertices = [
            [lon - halfSize, lat - halfSize], [lon + halfSize, lat - halfSize], 
            [lon + halfSize, lat + halfSize], [lon - halfSize, lat + halfSize], 
            [lon - halfSize, lat - halfSize] 
        ];
        
        const isIndividual = Math.random() < 0.6; 
        const claimType = isIndividual ? 'Individual' : 'Community';
        const areaHectares = (Math.random() * (10.0 - 0.5) + 0.5).toFixed(2); 
        
        let nameHolder;
        if (claimType === 'Individual') {
            nameHolder = getRandomElement(holderNames);
        } else {
            nameHolder = `Gram Sabha - ${district} Village Cluster ${Math.floor(id / 5) + 1}`;
        }
        
        const status = (Math.random() < 0.7) ? 'Approved' : 'Claimed/Pending'; 

        return {
            "type": "Feature",
            "properties": {
                "id": id,
                "State": state,
                "District": district,
                "Claim_Type": claimType, 
                "Status": status,
                "Area_Hectares": `${areaHectares}`,
                "Title_No": status === 'Approved' ? `TN-${id}` : 'N/A',
                "Name_Holders": nameHolder,
                "Village": `Village ${Math.floor(id / 3) + 1}`,
                "GP": `Gram Panchayat ${Math.floor(id / 10) + 1}`,
                "Tehsil": `Tehsil ${Math.floor(id / 20) + 1}`
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [vertices]
            }
        };
    }

    const fraClaimsGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            createDummySquarePolygon(21.28, 76.30, 'Madhya Pradesh', 'Burhanpur', 101),
            createDummySquarePolygon(21.35, 76.30, 'Madhya Pradesh', 'Burhanpur', 102),
            createDummySquarePolygon(21.15, 76.45, 'Madhya Pradesh', 'Burhanpur', 103),
            createDummySquarePolygon(22.05, 79.20, 'Madhya Pradesh', 'Seoni', 201),
            createDummySquarePolygon(22.15, 79.50, 'Madhya Pradesh', 'Seoni', 202),
            createDummySquarePolygon(21.90, 79.70, 'Madhya Pradesh', 'Seoni', 203),
            createDummySquarePolygon(22.25, 79.35, 'Madhya Pradesh', 'Seoni', 204),
            createDummySquarePolygon(22.00, 79.85, 'Madhya Pradesh', 'Seoni', 205),
            createDummySquarePolygon(19.40, 78.40, 'Telangana', 'Adilabad', 301),
            createDummySquarePolygon(19.70, 78.65, 'Telangana', 'Adilabad', 302),
            createDummySquarePolygon(19.55, 78.90, 'Telangana', 'Adilabad', 303),
            createDummySquarePolygon(19.85, 78.75, 'Telangana', 'Adilabad', 304),
            createDummySquarePolygon(24.30, 91.80, 'Tripura', 'North Tripura', 401),
            createDummySquarePolygon(24.45, 92.10, 'Tripura', 'North Tripura', 402),
            createDummySquarePolygon(24.20, 92.25, 'Tripura', 'North Tripura', 403),
            createDummySquarePolygon(24.50, 91.95, 'Tripura', 'North Tripura', 404),
            createDummySquarePolygon(24.35, 92.30, 'Tripura', 'North Tripura', 405),
            createDummySquarePolygon(24.55, 92.15, 'Tripura', 'North Tripura', 406),
            createDummySquarePolygon(21.10, 86.60, 'Odisha', 'Bhadrak', 501),
            createDummySquarePolygon(20.95, 86.85, 'Odisha', 'Bhadrak', 502),
            createDummySquarePolygon(21.25, 87.00, 'Odisha', 'Bhadrak', 503),
            createDummySquarePolygon(21.05, 87.20, 'Odisha', 'Bhadrak', 504),
            createDummySquarePolygon(21.30, 86.75, 'Odisha', 'Bhadrak', 505),
            createDummySquarePolygon(20.90, 87.05, 'Odisha', 'Bhadrak', 506),
            createDummySquarePolygon(21.15, 86.95, 'Odisha', 'Bhadrak', 507)
        ]
    };

    // --- DOM Elements ---
    const topBar = document.getElementById('top-bar');
    const collapseButton = document.getElementById('collapse-button');
    const stateDropdown = document.getElementById('state-dropdown');
    const districtDropdown = document.getElementById('district-dropdown');
    const statusMessageDiv = document.getElementById('status-message');
    const statisticsPanel = document.getElementById('statistics-panel');
    const fraClaimsRadio = document.getElementById('fra-claims-radio');
    const boundariesRadio = document.getElementById('boundaries-radio'); 
    const statsSidebar = document.getElementById('stats-sidebar');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button'); 
    const forestCoverRadio = document.getElementById('forest-cover-radio');


    // --- Core Functions ---

    /**
     * Calculates the dynamic top padding for Leaflet's fitBounds function.
     */
    function getFitBoundsPadding() {
        const sidebarWidth = statsSidebar.classList.contains('hidden') ? 0 : 260;
        return [topBar.offsetHeight + 10, sidebarWidth]; 
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
    }

    function updateStatus(message, isError = false) {
        statusMessageDiv.innerHTML = message;
        statusMessageDiv.style.color = isError ? '#ffdddd' : '#c8e6c9';
        statusMessageDiv.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    }

    /**
     * Toggles the visibility of the statistics sidebar and invalidates the map size.
     * @param {boolean} show - The desired state of the sidebar (true to show, false to hide).
     */
    function toggleStatsSidebar(show) {
        const stateSelected = stateDropdown.value !== "";
        const districtSelected = districtDropdown.value !== "";
        
        // Final Rule: Only show if 'show' is true AND a state is selected AND NO district is selected.
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

            <strong>Claims rejected:</strong> ${stats.claims_rejected}<br>
            <strong>Claims Disposed off:</strong> ${stats.claims_disposed}<br>

            <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 8px 0;">

            <strong>% Claims disposed:</strong> ${stats.percent_disposed}<br>
            <strong>% Titles distributed:</strong> ${stats.percent_titles}
        `;
    }

    function renderFraClaims(stateKey, districtName) {
        clearLayer('all'); 
        openStreetMapLayer.addTo(map); // Add default base layer

        if (!stateKey) return;

        const stateName = stateData[stateKey].name;

        // Filter claims based on selection
        const filteredClaims = fraClaimsGeoJSON.features.filter(f => {
            const isStateMatch = f.properties.State === stateName;
            const isDistrictMatch = districtName ? f.properties.District === districtName : true;
            return isStateMatch && isDistrictMatch;
        });

        if (filteredClaims.length === 0) {
            updateStatus(`No FRA claim polygons found for ${districtName || stateName}.`, false);
            return;
        }

        const claimsGeoJSON = {
            "type": "FeatureCollection",
            "features": filteredClaims
        };

        const onEachFeature = (feature, layer) => {
            if (feature.properties) {
                const props = feature.properties;
                const popupContent = `
                    <strong>FRA Claim/Title Details</strong><br>
                    <hr style="margin: 5px 0; border-color: #ddd;">
                    1. Claim ID: ${props.id}<br>
                    2. Claim/Title Type: <strong>${props.Claim_Type}</strong><br>
                    3. Status: ${props.Status}<br>
                    4. Name(s) of Holder(s)**: ${props.Name_Holders || 'N/A'}<br>
                    5. Area (Hectares): ${props.Area_Hectares}<br>
                    6. Title No.: ${props.Title_No}<br>
                    7. Village/Gram Sabha: ${props.Village || 'N/A'}<br>
                    8. Gram Panchayat: ${props.GP || 'N/A'}<br>
                    9. Tehsil/Taluka: ${props.Tehsil || 'N/A'}
                `;
                layer.bindPopup(popupContent);
            }
        };

        fraClaimsLayer = L.geoJSON(claimsGeoJSON, {
            style: (feature) => {
                // Individual (Yellow) vs Community (Orange)
                const isIndividual = feature.properties.Claim_Type === 'Individual';
                return {
                    color: isIndividual ? '#DAA520' : '#FF4500', 
                    fillColor: isIndividual ? '#FFD700' : '#FFA500', 
                    fillOpacity: 0.8,
                    weight: 1.5
                };
            },
            onEachFeature: onEachFeature
        }).addTo(map);

        updateStatus(`Displaying ${filteredClaims.length} FRA claim polygons for ${districtName || stateName}.`, false);
        
        // Fit bounds to the new layer
        map.fitBounds(fraClaimsLayer.getBounds(), {
            paddingTopLeft: getFitBoundsPadding(),
            maxZoom: 14 
        });
    }

    function renderBoundaries(stateKey, districtName) {
        clearLayer('all'); 
        openStreetMapLayer.addTo(map); // Add default base layer

        if (!stateKey) return;

        const config = stateData[stateKey];
        let fileToLoad = `${stateKey}.geojson`;
        let statusMessage = `State layer for ${config.name} loaded. Select a district or view FRA claims.`;

        if (districtName) {
            fileToLoad = `${stateKey}Dist.geojson`;
            statusMessage = `District selected: ${districtName}. Loading district layer...`;
        }

        updateStatus(`Loading boundary layer: ${fileToLoad}...`);

        fetch(fileToLoad)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                let targetBounds = null; 

                if (districtName) {
                    const selectedFeature = data.features.find(f => 
                        f.properties && f.properties.district === districtName
                    );

                    if (selectedFeature) {
                        const tempLayer = L.geoJSON(selectedFeature);
                        targetBounds = tempLayer.getBounds();
                    } else {
                        console.warn(`District feature for ${districtName} not found.`);
                    }
                }
                
                const styleFeature = (feature) => {
                    const isSelected = districtName 
                        ? (feature.properties && feature.properties.district === districtName) 
                        : true; 
                    
                    return {
                        color: isSelected ? config.color : '#444',
                        fillColor: isSelected ? config.fillColor : '#888',
                        fillOpacity: isSelected && districtName ? 0.6 : 0.3,
                        weight: isSelected && districtName ? 3 : 1
                    };
                };

                currentLayer = L.geoJSON(data, { style: styleFeature }).addTo(map);

                const bounds = targetBounds || currentLayer.getBounds();
                
                map.fitBounds(bounds, {
                    paddingTopLeft: getFitBoundsPadding()
                });

                updateStatus(statusMessage);
            })
            .catch(err => {
                console.error(`Error loading file ${fileToLoad}:`, err);
                updateStatus(`Could not load boundary file for ${config.name}. Check the console.`, true);
            });
    }

    /**
     * NEW: Renders the Simulated Forest Cover layer by applying a semi-transparent green 
     * fill over the selected state/district boundary.
     */
    function renderForestCover() {
        clearLayer('all'); 
        openStreetMapLayer.addTo(map); // Keep OSM base layer for context

        const stateKey = stateDropdown.value;
        const districtName = districtDropdown.value;
        
        if (!stateKey) {
            updateStatus('Select a state to view forest cover simulation.');
            return;
        }

        const config = stateData[stateKey];
        let fileToLoad = `${stateKey}.geojson`;
        let statusMessage = `Simulating Forest Cover for ${config.name}.`;

        if (districtName) {
            fileToLoad = `${stateKey}Dist.geojson`;
            statusMessage = `Simulating Forest Cover for ${districtName}.`;
        }

        updateStatus(`Loading boundary layer for forest simulation: ${fileToLoad}...`);

        fetch(fileToLoad)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                let targetBounds = null; 
                let targetFeature = null;

                // Find the specific feature if a district is selected
                if (districtName) {
                     targetFeature = data.features.find(f => 
                        f.properties && f.properties.district === districtName
                    );
                }
                
                // If a district is selected, use only that feature. Otherwise, use all features (state view).
                const geoJsonData = targetFeature ? {
                    "type": "FeatureCollection",
                    "features": [targetFeature]
                } : data;

                // Style: Solid semi-transparent green fill over the area
                const styleFeature = (feature) => {
                    // For district view, we highlight only the target feature. For state view, all features get the style.
                    const isTarget = !districtName || (feature.properties && feature.properties.district === districtName);
                    
                    if (isTarget) {
                        return {
                            color: '#006400', // Dark green border
                            fillColor: '#228B22', // Forest Green fill
                            fillOpacity: 0.5, // Semi-transparent
                            weight: 2
                        };
                    }
                    
                    // Keep non-target districts hidden/dimmed if viewing multiple districts
                    return { weight: 0, fillOpacity: 0 };
                };

                currentLayer = L.geoJSON(geoJsonData, { style: styleFeature }).addTo(map);
                
                // Calculate bounds (either the single district or the whole state layer)
                const bounds = currentLayer.getBounds();
                
                map.fitBounds(bounds, {
                    paddingTopLeft: getFitBoundsPadding()
                });

                updateStatus(statusMessage);
            })
            .catch(err => {
                console.error(`Error loading boundary file for forest simulation:`, err);
                updateStatus(`Could not load boundary file for forest simulation.`, true);
            });
    }


    // --- State and District Logic ---

    function handleStateSelection(stateKey) {
        clearLayer('all');
        districtDropdown.innerHTML = '<option value="" disabled selected>-- Select a District --</option>';
        districtDropdown.value = "";
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
        
        // When district is selected, render the currently active layer type, filtered by district.
        if (boundariesRadio.checked) {
            renderBoundaries(stateKey, districtName);
        } else if (fraClaimsRadio.checked) {
            renderFraClaims(stateKey, districtName);
        } else if (forestCoverRadio.checked) {
            // Rerender the forest layer, now filtered by district
            renderForestCover();
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
        
        // 1. If the top bar collapses, try to show the sidebar.
        toggleStatsSidebar(isCollapsed);

        // 2. Invalidate map size and re-fit after the transition
        setTimeout(() => {
            map.invalidateSize();
            // Try to fit the currently active layer, if any
            const layerToFit = fraClaimsLayer || currentLayer;
            if (layerToFit) {
                 map.fitBounds(layerToFit.getBounds(), {
                     paddingTopLeft: getFitBoundsPadding(),
                     animate: true 
                 });
            }
        }, 300); 
    });

    // Sidebar Manual Toggle Button
    sidebarToggleButton.addEventListener('click', () => {
        // We invert the current visibility status. The function then checks if the rules allow the new state.
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

    // Layer Radio Button Change (Handles all three layers)
    document.querySelectorAll('input[name="layer-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const stateKey = stateDropdown.value;
            const districtName = districtDropdown.value;
            const layerType = radio.value;

            // Clear all dynamic layers before rendering the selected one
            clearLayer('all'); 

            if (layerType === 'boundaries') {
                if (!stateKey) { updateStatus('Select a state to view boundaries.'); return; }
                renderBoundaries(stateKey, districtName || null);

            } else if (layerType === 'fra-claims') {
                 if (!stateKey) { updateStatus('Select a state to view FRA claims.'); return; }
                renderFraClaims(stateKey, districtName || null);

            } else if (layerType === 'forest-cover') {
                // The forest layer itself handles the state/district filtering inside renderForestCover
                renderForestCover();
            }
        });
    });
    
    // Initial message
    updateStatus('Welcome to the FRA Atlas. Select a state to begin.');
});
