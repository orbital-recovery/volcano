document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([20, 0], 2); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('/api/volcanoes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(volcanoes => {
            if (!volcanoes || volcanoes.length === 0) {
                console.warn("No volcanoes data received from API or data is empty.");
                // Optionally display a message to the user on the map
                const mapDiv = document.getElementById('map');
                mapDiv.innerHTML += `<p style="color: orange; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 10px; border-radius: 5px;">No volcano data loaded. The API might be having issues or the CSV is not found.</p>`;
                return;
            }
            volcanoes.forEach(volcano => {
                if (volcano.lat !== undefined && volcano.lon !== undefined) {
                    var marker = L.marker([volcano.lat, volcano.lon]).addTo(map);
                    
                    let popupContent = `
                        <b>${volcano.name}</b><br>
                        Type: ${volcano.type}<br>
                        Last Eruption: ${volcano.last_eruption}<br>
                        Coords: ${volcano.lat.toFixed(3)}, ${volcano.lon.toFixed(3)}
                    `;
                    marker.bindPopup(popupContent);
                } else {
                    console.warn("Skipping volcano due to missing coordinates:", volcano);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching volcano data:', error);
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = `<p style="color: red; text-align: center;">Could not load volcano data. Please check the console for errors and ensure the backend server is running (if local) or deployment logs (if deployed).</p>`;
        });
});