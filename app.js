document.addEventListener('DOMContentLoaded', () => {
    // --- Global Setup ---

    const map = L.map('map').setView([22.5937, 78.9629], 5);

    // --- Base Layers ---
    // Administrative Base Layer (OpenStreetMap)
    const administrativeBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Satellite Layer (ESRI World Imagery for rugged look)
    const satelliteBaseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    });

    // --- Overlay Groups ---
    // Use a FeatureGroup to manage all dynamic overlays (boundaries, claims, thematic)
    const overlayGroup = L.featureGroup().addTo(map);

    let currentLayer = null; // State or District GeoJSON layer (Boundaries)
    let fraClaimsLayer = null; // Layer for the small polygons (FRA Claims)
    let thematicLayer = null; // Tracks all grouped thematic layers

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
    
    // Custom name list for popups
    const holderNames = [
        "Sunder Das Ahuja", "Harvardhan Kumar", "Rajesh Gupta", "Arth Goyal", "Dinesh Ghai", 
        "Tripti Rao", "Ramesh Shankar", "Manoj Roy", "Ridhi Kumari", "Radha Rani", 
        "Kareena Kumari", "Vivek Rao", "Akshay Soni", "Atharv Verma", "Dilip Sharma",  
        "Nitin Jhangra", "Pankaj Choudhari", "Pooja Tripathi", "Preet Bajpayee"
    ];

    // List of village names
    const villageNamesMP = [
        "Tikamgarh", "Lalitpur", "Talbehat", "Prithvipur", "Mauranipur", "Mahoba", "Panna", 
        "Karrera", "Datia", "Maudaha", "Rath", "Banda", "Hamirpur", "Kalpi", "Auraiya", 
        "Jalaun", "Bhind", "Konch", "Kailaras", "Shivpuri", "Dabra", "Narwar"
    ];

    // Placeholder coordinates for MP districts (approximate centers for scattering)
    const mpDistrictCoords = {
        'Burhanpur': [21.3, 76.2], 'Seoni': [22.0, 79.5], 'Alirajpur': [22.3, 74.3], 
        'Chhindwara': [22.0, 78.9], 'Harda': [22.4, 77.1], 'Khargone': [21.8, 75.6], 
        'Khandwa': [21.8, 76.4], 'Balaghat': [21.8, 80.3], 'Barwani': [22.0, 74.8], 
        'Betul': [22.0, 77.9], 'Morena': [26.5, 78.0], 'Bhind': [26.5, 78.7], 
        'Gwalior': [26.2, 78.1], 'Sheopur': [25.6, 76.7], 'Shivpuri': [25.5, 77.7], 
        'Tikamgarh': [24.7, 79.0], 'Neemuch': [24.4, 74.8], 'Rewa': [24.5, 81.3], 
        'Satna': [24.5, 80.8], 'Guna': [24.4, 77.3], 'Ashoknagar': [24.5, 77.7], 
        'Mandsaur': [24.1, 75.1], 'Singrauli': [24.2, 82.6], 'Sidhi': [24.3, 81.9], 
        'Sagar': [23.8, 78.7], 'Damoh': [23.8, 79.4], 'Shajapur': [23.4, 76.8], 
        'Vidisha': [23.5, 77.8], 'Rajgarh': [24.0, 76.9], 'Shahdol': [23.3, 81.4], 
        'Katni': [23.8, 80.4], 'Umaria': [23.3, 80.8], 'Ratlam': [23.3, 75.0], 
        'Bhopal': [23.2, 77.4], 'Ujjain': [23.2, 75.7], 'Raisen': [23.3, 77.7], 
        'Sehore': [23.2, 77.0], 'Jabalpur': [23.1, 79.9], 'Dewas': [23.2, 76.1], 
        'Anuppur': [23.1, 81.7], 'Jhabua': [22.7, 74.6], 'Dindori': [22.9, 81.0], 
        'Narsinghpur': [22.9, 79.2], 'Dhar': [22.6, 75.3], 'Indore': [22.7, 75.8], 
        'Mandla': [22.5, 80.3], 'Hoshangabad': [22.7, 77.7], 'Agar Malwa': [23.7, 76.0], 
        'Datia': [25.6, 78.4], 'Chhatarpur': [24.9, 79.6], 'Panna': [24.7, 80.1], 
        'Niwari': [25.3, 78.8]
    };
    
    /**
     * Helper function to get a random item from an array.
     */
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /**
     * Generates a square GeoJSON polygon feature centered at [lat, lon].
     */
    function createDummySquarePolygon(lat, lon, state, district, id, claimTypeOverride = null) {
        // Base size for the claim area (in degrees, slightly smaller than old)
        const size = 0.005; 
        const halfSize = size / 2;
        
        const vertices = [
            [lon - halfSize, lat - halfSize], // SW
            [lon + halfSize, lat - halfSize], // SE
            [lon + halfSize, lat + halfSize], // NE
            [lon - halfSize, lat + halfSize], // NW
            [lon - halfSize, lat - halfSize]  // Close the loop
        ];
        
        // Use a random value to determine if it's Individual or Community, unless overridden
        const claimType = claimTypeOverride || (Math.random() < 0.6 ? 'Individual' : 'Community');
        
        const areaHectares = (Math.random() * (10.0 - 0.5) + 0.5).toFixed(2); // 0.5 to 10.0 hectares
        
        // Use a random village name for the location
        const randomVillageName = getRandomElement(villageNamesMP);
        
        let nameHolder;
        if (claimType === 'Individual') {
            nameHolder = getRandomElement(holderNames);
        } else {
            // Include random village name for better context in community claims
            nameHolder = `Gram Sabha - ${randomVillageName} Village Cluster ${Math.floor(id / 5) + 1}`;
        }
        
        const status = (Math.random() < 0.7) ? 'Approved' : 'Claimed/Pending'; // 70% chance of being approved for diversity

        return {
            "type": "Feature",
            "properties": {
                "id": id,
                "State": state,
                "District": district,
                "Claim_Type": claimType, // Individual (Yellow) or Community (Orange)
                "Status": status,
                "Area_Hectares": `${areaHectares}`,
                "Title_No": status === 'Approved' ? `TN-${id}` : 'N/A',
                "Name_Holders": nameHolder,
                // Using the random village name
                "Village": randomVillageName, 
                "GP": `Gram Panchayat ${Math.floor(id / 10) + 1}`,
                "Tehsil": `Tehsil ${Math.floor(id / 20) + 1}`
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [vertices] // GeoJSON expects an array of rings
            }
        };
    }

    /**
     * Generates claims for a single district with a specific count.
     * MODIFIED: Removed special spread for Burhanpur
     */
    function generateDistrictClaims(district, countIndividual, countCommunity, startId, baseId) {
        const claims = [];
        let id = startId;
        const center = mpDistrictCoords[district];
        if (!center) return claims;

        const [lat, lon] = center;
        const spread = 0.3; // Tighter spread for better containment
        
        // Generate Individual Claims
        for (let i = 0; i < countIndividual; i++) {
            claims.push(createDummySquarePolygon(
                lat + (Math.random() * spread - spread / 2),
                lon + (Math.random() * spread - spread / 2),
                'Madhya Pradesh', 
                district, 
                baseId + id++, 
                'Individual'
            ));
        }

        // Generate Community Claims
        for (let i = 0; i < countCommunity; i++) {
            claims.push(createDummySquarePolygon(
                lat + (Math.random() * spread - spread / 2),
                lon + (Math.random() * spread - spread / 2),
                'Madhya Pradesh', 
                district, 
                baseId + id++, 
                'Community'
            ));
        }
        return claims;
    }

    /**
     * Generates scattered claims across all MP districts listed in stateData, excluding Burhanpur.
     */
    function generateScatteredClaims(districts, startId) {
        const claims = [];
        let id = startId;
        
        const excludedDistrict = 'Burhanpur';

        districts.forEach(district => {
            if (district === excludedDistrict) return;

            // Generate 3 Individual Claims and 2 Community Claims per other District
            claims.push(...generateDistrictClaims(district, 3, 2, id, 1000)); 
            id += 5;
        });
        return claims;
    }

    // --- FRA Claims Data ---
    // Start ID for scattered claims will be around 1000, leaving 101-999 for Burhanpur and other blocks
    let startIdCounter = 101;
    const burhanpurCenterLat = 21.3;
    const burhanpurCenterLon = 76.2;
    const burhanpurDistrictName = 'Burhanpur';

    // MODIFIED: Manually defined Burhanpur claims (20 total) to ensure they are inside the boundary.
    const burhanpurClaims = [
        // Individual Claims (IDs 101-110, excluding 101 and 102)
        createDummySquarePolygon(burhanpurCenterLat + 0.15, burhanpurCenterLon + 0.05, 'Madhya Pradesh', burhanpurDistrictName, 103, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat + 0.05, burhanpurCenterLon + 0.1, 'Madhya Pradesh', burhanpurDistrictName, 104, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat - 0.05, burhanpurCenterLon - 0.05, 'Madhya Pradesh', burhanpurDistrictName, 105, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat + 0.0, burhanpurCenterLon + 0.0, 'Madhya Pradesh', burhanpurDistrictName, 106, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat + 0.08, burhanpurCenterLon + 0.12, 'Madhya Pradesh', burhanpurDistrictName, 107, 'Individual'), // Adjusted 107
        createDummySquarePolygon(burhanpurCenterLat - 0.1, burhanpurCenterLon + 0.03, 'Madhya Pradesh', burhanpurDistrictName, 108, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat + 0.1, burhanpurCenterLon - 0.05, 'Madhya Pradesh', burhanpurDistrictName, 109, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat - 0.15, burhanpurCenterLon - 0.1, 'Madhya Pradesh', burhanpurDistrictName, 110, 'Individual'),
        
        // Community Claims (IDs 111-120, excluding 112)
        createDummySquarePolygon(burhanpurCenterLat + 0.1, burhanpurCenterLon + 0.1, 'Madhya Pradesh', burhanpurDistrictName, 111, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat - 0.08, burhanpurCenterLon - 0.12, 'Madhya Pradesh', burhanpurDistrictName, 113, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat + 0.03, burhanpurCenterLon - 0.15, 'Madhya Pradesh', burhanpurDistrictName, 114, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat - 0.0, burhanpurCenterLon + 0.15, 'Madhya Pradesh', burhanpurDistrictName, 115, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat - 0.12, burhanpurCenterLon + 0.08, 'Madhya Pradesh', burhanpurDistrictName, 116, 'Community'), // Adjusted 116
        createDummySquarePolygon(burhanpurCenterLat + 0.05, burhanpurCenterLon - 0.0, 'Madhya Pradesh', burhanpurDistrictName, 117, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat - 0.15, burhanpurCenterLon + 0.15, 'Madhya Pradesh', burhanpurDistrictName, 118, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat + 0.12, burhanpurCenterLon + 0.02, 'Madhya Pradesh', burhanpurDistrictName, 119, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat - 0.0, burhanpurCenterLon - 0.08, 'Madhya Pradesh', burhanpurDistrictName, 120, 'Community'),
        
        // Add back the required number of claims to reach 20 total, using new IDs 121, 122, 123
        createDummySquarePolygon(burhanpurCenterLat + 0.02, burhanpurCenterLon - 0.02, 'Madhya Pradesh', burhanpurDistrictName, 121, 'Individual'),
        createDummySquarePolygon(burhanpurCenterLat - 0.02, burhanpurCenterLon + 0.02, 'Madhya Pradesh', burhanpurDistrictName, 122, 'Community'),
        createDummySquarePolygon(burhanpurCenterLat + 0.18, burhanpurCenterLon + 0.18, 'Madhya Pradesh', burhanpurDistrictName, 123, 'Community'),
    ];
    // Filter out the claims explicitly excluded in the last step (which are now missing from the list above)
    // NOTE: IDs 101, 102, 112 are implicitly removed as they are not generated in the new manual list.

    startIdCounter = 124; // Update counter past manual block

    const mpScatteredClaims = generateScatteredClaims(stateData['madhya-pradesh'].districts, startIdCounter);
    startIdCounter += mpScatteredClaims.length;

    // Remaining non-MP claims use a fixed base ID (e.g., 3000 series)
    const nonMpClaimsBaseId = 3000;

    const fraClaimsGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            // Burhanpur claims (now 20 total, manually fixed coordinates)
            ...burhanpurClaims,
            
            // Scattered claims across the rest of MP
            ...mpScatteredClaims,
            
            // Telangana - Adilabad (4 Polygons)
            createDummySquarePolygon(19.40, 78.40, 'Telangana', 'Adilabad', nonMpClaimsBaseId + 1),
            createDummySquarePolygon(19.70, 78.65, 'Telangana', 'Adilabad', nonMpClaimsBaseId + 2),
            createDummySquarePolygon(19.55, 78.90, 'Telangana', 'Adilabad', nonMpClaimsBaseId + 3),
            createDummySquarePolygon(19.85, 78.75, 'Telangana', 'Adilabad', nonMpClaimsBaseId + 4),

            // Tripura - North Tripura (6 Polygons)
            createDummySquarePolygon(24.30, 91.80, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 10),
            createDummySquarePolygon(24.45, 92.10, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 11),
            createDummySquarePolygon(24.20, 92.25, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 12),
            createDummySquarePolygon(24.50, 91.95, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 13),
            createDummySquarePolygon(24.35, 92.30, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 14),
            createDummySquarePolygon(24.55, 92.15, 'Tripura', 'North Tripura', nonMpClaimsBaseId + 15),

            // Odisha - Bhadrak (7 Polygons)
            createDummySquarePolygon(21.10, 86.60, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 20),
            createDummySquarePolygon(20.95, 86.85, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 21),
            createDummySquarePolygon(21.25, 87.00, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 22),
            createDummySquarePolygon(21.05, 87.20, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 23),
            createDummySquarePolygon(21.30, 86.75, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 24),
            createDummySquarePolygon(20.90, 87.05, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 25),
            createDummySquarePolygon(21.15, 86.95, 'Odisha', 'Bhadrak', nonMpClaimsBaseId + 26)
        ]
        // Note: The filter for [101, 102, 112] is no longer needed here as they are not generated above, but keeping it clean:
        .filter(f => ![101, 102, 112].includes(f.properties.id))
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
    const cropLandRadio = document.getElementById('crop-land-radio'); 
    const waterBodiesRadio = document.getElementById('water-bodies-radio'); 
    const homesteadsRadio = document.getElementById('homesteads-radio'); 
    const forestsRadio = document.getElementById('forests-radio'); 
    const statsSidebar = document.getElementById('stats-sidebar');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button'); 
    // NEW: Base Layer Radio Buttons
    const adminViewRadio = document.getElementById('admin-view-radio');
    const satViewRadio = document.getElementById('sat-view-radio');

    // --- Core Functions ---

    /**
     * Calculates the dynamic top padding for Leaflet's fitBounds function.
     */
    function getFitBoundsPadding() {
        const sidebarWidth = statsSidebar.classList.contains('hidden') ? 0 : 260;
        return [topBar.offsetHeight + 10, sidebarWidth]; // [Y offset, X offset]
    }
    

    function clearLayer(layerName = 'all') {
        if (layerName === 'current' || layerName === 'all') {
            if (currentLayer) {
                overlayGroup.removeLayer(currentLayer); // Use overlayGroup
                currentLayer = null;
            }
        }
        if (layerName === 'fra-claims' || layerName === 'all') {
            if (fraClaimsLayer) {
                overlayGroup.removeLayer(fraClaimsLayer); // Use overlayGroup
                fraClaimsLayer = null;
            }
        }
        // Clear Thematic Layer
        if (layerName === 'thematic' || layerName === 'all') {
            if (thematicLayer) {
                overlayGroup.removeLayer(thematicLayer); // Use overlayGroup
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
                // MODIFIED: GP and Tehsil removed from popup
                const popupContent = `
                    <strong>FRA Claim/Title Details</strong>
                    <hr style="margin: 5px 0; border-color: #ddd;">
                    1. Claim ID: ${props.id}<br>
                    2. Claim/Title Type: <strong>${props.Claim_Type}</strong><br>
                    3. Status: ${props.Status}<br>
                    4. Name(s) of Holder(s): ${props.Name_Holders || 'N/A'}<br>
                    5. Area (Hectares): ${props.Area_Hectares}<br>
                    6. Title No.: ${props.Title_No}<br>
                    7. Village/Gram Sabha: <strong>${props.Village || 'N/A'}</strong><br>
                    <hr style="margin: 5px 0; border-color: #ddd;">
                    <a href="#" class="dss-button" data-claim-id="${props.id}">
                        <button style="background-color: #f0ad4e; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-weight: bold;">Run DSS Engine</button>
                    </a>
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
        });
        
        // Add to the overlay group, not directly to the map
        overlayGroup.addLayer(fraClaimsLayer);

        updateStatus(`Displaying ${filteredClaims.length} FRA claim polygons for ${districtName || stateName}.`, false);
        
        // Fit bounds to the new layer
        map.fitBounds(fraClaimsLayer.getBounds(), {
            paddingTopLeft: getFitBoundsPadding(),
            maxZoom: 14 
        });

        // Add event listener for the DSS button after the layer is added
        fraClaimsLayer.on('popupopen', (e) => {
            const popup = e.popup.getElement();
            const dssButton = popup.querySelector('.dss-button button');
            if (dssButton) {
                dssButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    // Placeholder action: Replace '#' with the actual DSS engine URL when ready
                    const claimId = event.target.closest('.dss-button').getAttribute('data-claim-id');
                    alert(`Redirecting to DSS Engine for Claim ID: ${claimId}. (Placeholder action)`);
                    // window.location.href = `https://your-dss-engine.com/dss?claim_id=${claimId}`;
                });
            }
        });
    }


    function renderBoundaries(stateKey, districtName) {
        clearLayer('fra-claims'); 
        clearLayer('thematic'); 
        clearLayer('current'); 

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
                let targetBounds = null; // Will hold the bounds of the state OR selected district

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

                currentLayer = L.geoJSON(data, { style: styleFeature });
                overlayGroup.addLayer(currentLayer); // Add to the overlay group

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
     * Renders thematic layers (Agricultural Land, Water Bodies, Homesteads, Forests).
     */
    function renderThematicLayer(stateKey, layerType) {
        clearLayer('fra-claims');
        clearLayer('thematic');

        // Rule: Only allow thematic layers for Madhya Pradesh
        if (stateKey !== 'madhya-pradesh') {
            updateStatus('Thematic layers (Crop Land, Water, Homesteads, Forests) are only available for **Madhya Pradesh**.', true);
            boundariesRadio.checked = true;
            renderBoundaries(stateKey, districtDropdown.value || null);
            return;
        }

        let fileNames = [];
        let layerName = '';
        let baseStyle = {};
        
        // Define layer configurations
        switch (layerType) {
            case 'crop-land':
                fileNames = ['yellow_crop_land.geojson'];
                layerName = 'Agricultural Land';
                baseStyle = { color: '#FFD700', fillColor: '#FFD700', fillOpacity: 0.5, weight: 1.5 };
                break;
            case 'water-bodies':
                fileNames = ['blue_finally.geojson']; 
                layerName = 'Water Bodies';
                baseStyle = { color: '#00BFFF', fillColor: '#00BFFF', fillOpacity: 0.8, weight: 1.5 };
                break;
            case 'homesteads':
                fileNames = ['red_finally.geojson'];
                layerName = 'Homesteads';
                baseStyle = { color: '#FF4500', fillColor: '#FF4500', fillOpacity: 0.7, weight: 1.5 };
                break;
            case 'forests':
                // Load two files in the specified order (land_use first)
                fileNames = ['land_use.geojson', 'green_finally.geojson']; 
                layerName = 'Forest Cover & Land Use';
                baseStyle = { color: '#006400', fillColor: '#38761d', fillOpacity: 0.6, weight: 1.5 }; 
                break;
            default:
                return;
        }

        updateStatus(`Loading thematic layer: ${layerName}...`);

        // Keep the State boundary layer on the map, but remove district highlight
        if (currentLayer) {
            clearLayer('current');
            renderBoundaries(stateKey, null); 
        }

        const fetchPromises = fileNames.map(fileName => 
            fetch(fileName)
                .then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status} for ${fileName}`);
                    return r.json();
                })
        );
        
        Promise.all(fetchPromises)
            .then(dataArray => {
                // Create a feature group to hold all layers for this thematic selection
                const featureGroup = L.featureGroup();
                let bounds = null;

                dataArray.forEach((data, index) => {
                    const layerOptions = {
                        style: (feature) => {
                            // Use a consistent style for simplicity unless more advanced logic is added later
                            return baseStyle; 
                        },
                        onEachFeature: (feature, layer) => {
                            // Simple popup showing just the layer type name
                            const fileTag = fileNames.length > 1 ? ` (File: ${fileNames[index]})` : '';
                            layer.bindPopup(`<strong>Layer:</strong> ${layerName}${fileTag}`);
                        }
                    };

                    const layer = L.geoJSON(data, layerOptions);
                    featureGroup.addLayer(layer);
                    
                    // Combine bounds
                    if (bounds) {
                        bounds.extend(layer.getBounds());
                    } else {
                        bounds = layer.getBounds();
                    }
                });

                thematicLayer = featureGroup;
                overlayGroup.addLayer(thematicLayer); // Add to the overlay group

                // Fit bounds to the combined thematic layers
                if (bounds) {
                    map.fitBounds(bounds, {
                        paddingTopLeft: getFitBoundsPadding()
                    });
                }

                updateStatus(`Displaying ${layerName} for Madhya Pradesh. (${fileNames.length} layer${fileNames.length > 1 ? 's' : ''} loaded).`);
            })
            .catch(err => {
                console.error(`Error loading thematic files:`, err);
                updateStatus(`Could not load thematic file(s) for ${layerName}. Check the console for details.`, true);
            });
    }

    /**
     * Function to switch between administrative and satellite base layers.
     * It also manages the visibility of all dynamic overlays.
     */
    function switchBaseLayer(layerType) {
        if (layerType === 'satellite') {
            if (map.hasLayer(administrativeBaseLayer)) {
                map.removeLayer(administrativeBaseLayer);
            }
            if (!map.hasLayer(satelliteBaseLayer)) {
                satelliteBaseLayer.addTo(map);
            }
            // Hide all dynamic overlays
            overlayGroup.remove();
            updateStatus('Switched to Satellite View. Overlays hidden.');
        } else { // administrative
            if (map.hasLayer(satelliteBaseLayer)) {
                map.removeLayer(satelliteBaseLayer);
            }
            if (!map.hasLayer(administrativeBaseLayer)) {
                administrativeBaseLayer.addTo(map);
            }
            // Show dynamic overlays
            overlayGroup.addTo(map);
            updateStatus('Switched to Administrative View. Dynamic layers visible.');
            // Re-run the current layer if one is selected
            if (stateDropdown.value) {
                const layerType = document.querySelector('input[name="layer-type"]:checked').value;
                const stateKey = stateDropdown.value;
                const districtName = districtDropdown.value;
                
                if (layerType === 'boundaries') {
                    renderBoundaries(stateKey, districtName || null);
                } else if (layerType === 'fra-claims') {
                    renderFraClaims(stateKey, districtName || null);
                } else {
                    renderThematicLayer(stateKey, layerType);
                }
            }
        }
    }


    // --- State and District Logic ---

    function handleStateSelection(stateKey) {
        // Clear all overlays, not the base map
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
        
        // Render the default layer (boundaries) only if in administrative view
        if (adminViewRadio.checked) {
            renderBoundaries(stateKey, null); 
        } else {
            updateStatus(`State ${config.name} selected. Switch to Administrative View to see boundaries or claims.`);
        }
        
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
        
        if (adminViewRadio.checked) {
            const layerType = document.querySelector('input[name="layer-type"]:checked').value;
            if (boundariesRadio.checked) {
                renderBoundaries(stateKey, districtName);
            } else if (fraClaimsRadio.checked) {
                renderFraClaims(stateKey, districtName);
            } else {
                // If a thematic layer is selected, revert to boundaries when district changes
                boundariesRadio.checked = true;
                renderBoundaries(stateKey, districtName);
            }
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
            // Only try to fit bounds if administrative view is active
            if (adminViewRadio.checked) {
                const layerToFit = thematicLayer || fraClaimsLayer || currentLayer; 
                if (layerToFit) {
                     map.fitBounds(layerToFit.getBounds(), {
                         paddingTopLeft: getFitBoundsPadding(),
                         animate: true 
                     });
                }
            }
        }, 300); 
    });

    // NEW: Base Layer Radio Button Change
    adminViewRadio.addEventListener('change', () => switchBaseLayer('administrative'));
    satViewRadio.addEventListener('change', () => switchBaseLayer('satellite'));


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
                boundariesRadio.checked = true;
                return;
            }
            
            // If satellite view is active, switch to administrative first
            if (satViewRadio.checked) {
                adminViewRadio.checked = true;
                switchBaseLayer('administrative');
            }


            const thematicLayers = ['crop-land', 'water-bodies', 'homesteads', 'forests']; 

            // If a thematic layer is selected, and a district is selected, clear district
            if (thematicLayers.includes(layerType) && districtName) {
                districtDropdown.value = "";
                handleStateSelection(stateKey);
            }

            // Hide sidebar and render the selected layer
            if (thematicLayers.includes(layerType)) {
                toggleStatsSidebar(false);
                renderThematicLayer(stateKey, layerType);
            } else if (boundariesRadio.checked) {
                renderBoundaries(stateKey, districtDropdown.value || null); 
            } else if (fraClaimsRadio.checked) {
                renderFraClaims(stateKey, districtDropdown.value || null);
            }
        });
    });
    
    // Initial message
    updateStatus('Welcome to the FRA Atlas. Select a state to begin.');
});
