document.addEventListener('DOMContentLoaded', () => {
    // --- Global Setup ---

    const map = L.map('map').setView([22.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currentLayer = null; // State or District GeoJSON layer
    let fraClaimsLayer = null; // Layer for the small polygons

    // --- Configuration & Data (Unchanged for State Data) ---
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

    // GeoJSON for the dummy claims (Unchanged)
    const fraClaimsGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            // Madhya Pradesh - Burhanpur (3 Polygons)
            createDummyPolygon(21.28, 76.16, 'Madhya Pradesh', 'Burhanpur', 1),
            createDummyPolygon(21.29, 76.20, 'Madhya Pradesh', 'Burhanpur', 2),
            createDummyPolygon(21.27, 76.23, 'Madhya Pradesh', 'Burhanpur', 3),

            // Madhya Pradesh - Seoni (5 Polygons)
            createDummyPolygon(22.08, 79.54, 'Madhya Pradesh', 'Seoni', 4),
            createDummyPolygon(22.10, 79.50, 'Madhya Pradesh', 'Seoni', 5),
            createDummyPolygon(22.12, 79.46, 'Madhya Pradesh', 'Seoni', 6),
            createDummyPolygon(22.14, 79.42, 'Madhya Pradesh', 'Seoni', 7),
            createDummyPolygon(22.16, 79.38, 'Madhya Pradesh', 'Seoni', 8),

            // Telangana - Adilabad (4 Polygons)
            createDummyPolygon(19.66, 78.50, 'Telangana', 'Adilabad', 9),
            createDummyPolygon(19.68, 78.54, 'Telangana', 'Adilabad', 10),
            createDummyPolygon(19.70, 78.58, 'Telangana', 'Adilabad', 11),
            createDummyPolygon(19.72, 78.62, 'Telangana', 'Adilabad', 12),

            // Tripura - North Tripura (6 Polygons)
            createDummyPolygon(24.38, 92.00, 'Tripura', 'North Tripura', 13),
            createDummyPolygon(24.40, 92.04, 'Tripura', 'North Tripura', 14),
            createDummyPolygon(24.42, 92.08, 'Tripura', 'North Tripura', 15),
            createDummyPolygon(24.44, 92.12, 'Tripura', 'North Tripura', 16),
            createDummyPolygon(24.46, 92.16, 'Tripura', 'North Tripura', 17),
            createDummyPolygon(24.48, 92.20, 'Tripura', 'North Tripura', 18),

            // Odisha - Bhadrak (7 Polygons)
            createDummyPolygon(21.06, 86.84, 'Odisha', 'Bhadrak', 19),
            createDummyPolygon(21.08, 86.88, 'Odisha', 'Bhadrak', 20),
            createDummyPolygon(21.10, 86.92, 'Odisha', 'Bhadrak', 21),
            createDummyPolygon(21.12, 86.96, 'Odisha', 'Bhadrak', 22),
            createDummyPolygon(21.14, 87.00, 'Odisha', 'Bhadrak', 23),
            createDummyPolygon(21.16, 87.04, 'Odisha', 'Bhadrak', 24),
            createDummyPolygon(21.18, 87.08, 'Odisha', 'Bhadrak', 25)
        ]
    };

    // Function to create a small polygon feature for demonstration (Unchanged)
    function createDummyPolygon(lat, lon, state, district, id) {
        const size = 0.005; // Size in degrees
        return {
            "type": "Feature",
            "properties": {
                "id": id,
                "State": state,
                "District": district,
                "Name_Holders": `Holder A, B (ID: ${id})`,
                "Village": `Village ${id}`,
                "GP": `GP ${id}`,
                "Tehsil": `Tehsil ${id}`
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [[lon, lat], [lon + size, lat], [lon + size, lat + size], [lon, lat + size], [lon, lat]]
                ]
            }
        };
    }

    // --- DOM Elements ---
    const topBar = document.getElementById('top-bar');
    const collapseButton = document.getElementById('collapse-button');
    const stateDropdown = document.getElementById('state-dropdown');
    const districtDropdown = document.getElementById('district-dropdown');
    const statusMessageDiv = document.getElementById('status-message');
    const statisticsPanel = document.getElementById('statistics-panel');
    const fraClaimsRadio = document.getElementById('fra-claims-radio');
    const statsSidebar = document.getElementById('stats-sidebar');

    // --- Core Functions ---

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
    
    // Function to show/hide the statistics sidebar
    function toggleStatsSidebar(show) {
        document.body.classList.toggle('stats-open', show);
        statsSidebar.classList.toggle('hidden', !show);
        // Important: Invalidate map size after showing/hiding the sidebar
        setTimeout(() => map.invalidateSize(), 300);
    }

    function renderStatistics(stateKey) {
        if (!stateKey) {
            statisticsPanel.innerHTML = '<p>Select a state to view statistics.</p>';
            toggleStatsSidebar(false);
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
            ${formatThreePartStat('Claims received', stats.claims_received)}
            ${formatThreePartStat('Titles distributed', stats.titles_distributed)}
            ${formatThreePartStat('Land distributed', stats.land_distributed, 'acres')}

            <strong>Claims rejected:</strong> ${stats.claims_rejected}<br>
            <strong>Claims Disposed off:</strong> ${stats.claims_disposed}<br>

            <hr style="border-color: rgba(255, 255, 255, 0.5); margin: 8px 0;">

            <strong>% Claims disposed:</strong> ${stats.percent_disposed}<br>
            <strong>% Titles distributed:</strong> ${stats.percent_titles}
        `;
        
        // Show the sidebar when stats are rendered
        toggleStatsSidebar(true);
    }

    function renderFraClaims(stateKey, districtName) {
        clearLayer('fra-claims'); // Clear previous claims layer
        
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
                    <strong>Claim Details (Dummy Data)</strong><br>
                    <hr style="margin: 5px 0; border-color: #ddd;">
                    1. Name(s) of the holder(s) of community forest right: <strong>${props.Name_Holders || 'N/A'}</strong><br>
                    2. Village/Gram Sabha: <strong>${props.Village || 'N/A'}</strong><br>
                    3. Gram Panchayat: <strong>${props.GP || 'N/A'}</strong><br>
                    4. Tehsil/Taluka: <strong>${props.Tehsil || 'N/A'}</strong><br>
                    5. District: <strong>${props.District || 'N/A'}</strong>
                `;
                layer.bindPopup(popupContent);
            }
        };

        fraClaimsLayer = L.geoJSON(claimsGeoJSON, {
            style: {
                color: '#FFFF00', // Yellow outline for claims
                fillColor: '#FFD700', // Gold fill
                fillOpacity: 0.8,
                weight: 2
            },
            onEachFeature: onEachFeature
        }).addTo(map);

        updateStatus(`Displaying ${filteredClaims.length} FRA claim polygons for ${districtName || stateName}.`, false);
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
        renderStatistics(stateKey); // Show statistics in the new sidebar
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
                        fillOpacity: 0.3,
                        weight: 2
                    }
                }).addTo(map);

                map.fitBounds(currentLayer.getBounds());

                // Conditionally render FRA claims based on radio button
                if (fraClaimsRadio.checked) {
                    renderFraClaims(stateKey);
                }

                updateStatus(`State layer for ${config.name} loaded. Select a district or view FRA claims.`);
            })
            .catch(err => {
                console.error(`Error loading state file ${stateFile}:`, err);
                updateStatus(`Could not load ${config.name} state file. Check the console.`, true);
            });
    }

    function handleDistrictSelection(stateKey, districtName) {
        renderStatistics(stateKey); // Re-render stats (keeps them visible)

        if (!districtName) {
            handleStateSelection(stateKey);
            return;
        }

        clearLayer('current'); // Clear state/district layer

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
                        return {
                            color: config.color,
                            fillColor: config.fillColor,
                            fillOpacity: 0.6,
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

                // Conditionally render FRA claims based on radio button, filtered by district
                if (fraClaimsRadio.checked) {
                    renderFraClaims(stateKey, districtName);
                }

                updateStatus(`District layer for ${districtName} loaded.`);
            })
            .catch(err => {
                console.error(`Error loading district file ${distFile}:`, err);
                updateStatus(`Could not load district file for ${config.name}. Check the console.`, true);
            });
    }


    // --- Initialization: Populate State Dropdown ---

    Object.keys(stateData).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = stateData[key].name;
        stateDropdown.appendChild(option);
    });

    // --- Event Listeners ---

    // Top Bar Collapse Toggle
    collapseButton.addEventListener('click', () => {
        const isCollapsed = topBar.classList.toggle('collapsed');
        collapseButton.setAttribute('aria-expanded', !isCollapsed);
        // Invalidate map size to correct potential layout issues after CSS transition
        setTimeout(() => {
            map.invalidateSize();
        }, 300); // Match CSS transition duration
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

    // FRA Claims Radio Button Change
    fraClaimsRadio.addEventListener('change', () => {
        const stateKey = stateDropdown.value;
        const districtName = districtDropdown.value;

        if (fraClaimsRadio.checked && stateKey) {
            renderFraClaims(stateKey, districtName || null);
        } else {
            clearLayer('fra-claims');
        }
    });

    // Initial message
    updateStatus('Welcome to the WebGIS system. Select a state to begin.');
});
