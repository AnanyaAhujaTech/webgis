document.addEventListener('DOMContentLoaded', () => {
  // Initialize map
  const map = L.map('map').setView([22.5937, 78.9629], 5);

  // Base map layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  let currentLayer = null;

  // Leaflet control for state selection
  const StateControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function(map) {
      const container = L.DomUtil.create('div', 'leaflet-bar');
      container.style.background = 'white';
      container.style.padding = '10px';
      container.style.borderRadius = '6px';
      container.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      container.style.fontSize = '14px';
      container.style.zIndex = '9999';

      container.innerHTML = `
        <form>
          <label><input type="radio" name="state" value="madhya-pradesh.geojson"> Madhya Pradesh</label><br>
          <label><input type="radio" name="state" value="telangana.geojson"> Telangana</label><br>
          <label><input type="radio" name="state" value="tripura.geojson"> Tripura</label><br>
          <label><input type="radio" name="state" value="odisha.geojson"> Odisha</label>
        </form>
      `;

      // Stop map from reacting to clicks inside the control
      L.DomEvent.disableClickPropagation(container);

      return container;
    }
  });

  map.addControl(new StateControl());

  // Wait until control is added to attach event listeners
  setTimeout(() => {
    const radios = document.querySelectorAll('input[name="state"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const file = radio.value;

        // Remove previous layer
        if (currentLayer) map.removeLayer(currentLayer);

        // Fetch selected state GeoJSON
        fetch(file)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then(data => {
            currentLayer = L.geoJSON(data, {
              style: { color: 'darkred', weight: 2, fillColor: 'orange', fillOpacity: 0.3 }
            }).addTo(map);
            map.fitBounds(currentLayer.getBounds());
          })
          .catch(err => {
            console.error('Error loading file:', err);
            alert('Could not load ' + file + '. Check console for details.');
          });
      });
    });
  }, 100); // small delay to ensure DOM exists
});
