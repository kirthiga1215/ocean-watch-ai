const BAY_OF_BENGAL = [15.0, 90.0];
const map = L.map('map').setView(BAY_OF_BENGAL, 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let selectedLat = BAY_OF_BENGAL[0];
let selectedLon = BAY_OF_BENGAL[1];

let currentMarker = L.marker(BAY_OF_BENGAL).addTo(map).bindPopup('Current location');
let predictedMarker = L.marker(BAY_OF_BENGAL).addTo(map).bindPopup('Predicted location (+120 min)');
let trajectoryLine = L.polyline([BAY_OF_BENGAL, BAY_OF_BENGAL], { color: '#18a6d9', weight: 3 }).addTo(map);
let heatLayer = L.heatLayer([[...BAY_OF_BENGAL, 0.3]], { radius: 35, blur: 20, maxZoom: 10 }).addTo(map);

map.on('click', (event) => {
  selectedLat = Number(event.latlng.lat.toFixed(6));
  selectedLon = Number(event.latlng.lng.toFixed(6));
  document.getElementById('selectedLat').textContent = selectedLat.toFixed(4);
  document.getElementById('selectedLon').textContent = selectedLon.toFixed(4);
  currentMarker.setLatLng([selectedLat, selectedLon]);
});

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

function updateUI(payload) {
  const current = payload.current_location;
  const predicted = payload.predicted_location;
  const wind = payload.wind;
  const ocean = payload.current;
  const detections = payload.detections || [];

  currentMarker.setLatLng([current.latitude, current.longitude]);
  predictedMarker.setLatLng([predicted.latitude, predicted.longitude]);
  trajectoryLine.setLatLngs([
    [current.latitude, current.longitude],
    [predicted.latitude, predicted.longitude],
  ]);

  const densityScore = detections.length > 0 ? Math.min(1, detections.length / 10) : 0.05;
  heatLayer.setLatLngs([[current.latitude, current.longitude, densityScore]]);

  document.getElementById('densityScore').textContent = densityScore.toFixed(2);
  document.getElementById('clusterCount').textContent = String(detections.length);
  document.getElementById('windSpeed').textContent = Number(wind.speed_mps).toFixed(2);
  document.getElementById('windDirection').textContent = Number(wind.direction_deg).toFixed(1);
  document.getElementById('windSource').textContent = wind.source || '-';

  document.getElementById('currentCoord').textContent = `${current.latitude.toFixed(4)}, ${current.longitude.toFixed(4)}`;
  document.getElementById('predictedCoord').textContent = `${predicted.latitude.toFixed(4)}, ${predicted.longitude.toFixed(4)}`;
  document.getElementById('uvComponents').textContent = `${Number(ocean.u_component_mps).toFixed(4)}, ${Number(ocean.v_component_mps).toFixed(4)}`;
  document.getElementById('currentSource').textContent = ocean.source || '-';
}

async function analyze() {
  const imageFile = document.getElementById('imageInput').files[0] || null;
  const imageBase64 = imageFile ? await fileToDataUrl(imageFile) : null;

  const payload = {
    latitude: selectedLat,
    longitude: selectedLon,
    image_base64: imageBase64,
  };

  setStatus('Analyzing...');
  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    updateUI(result);
    setStatus('Analysis complete');
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  }
}

document.getElementById('analyzeBtn').addEventListener('click', analyze);
