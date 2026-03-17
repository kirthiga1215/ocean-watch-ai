# AI Ocean Plastic Monitoring System (Bay of Bengal)

This workspace now includes a complete full-stack implementation:

- FastAPI backend in `backend/`
- Static frontend dashboard in `frontend-static/`

## Backend (FastAPI)

### Structure

- `backend/detection/` YOLOv8 image detection
- `backend/data/` wind + ocean current API services
- `backend/prediction/` physics-based movement model
- `backend/utils/` config + schemas

### Install

```bash
cd backend
pip install -r requirements.txt
```

Optional environment variables (`backend/.env.example`):

- `OPENWEATHER_API_KEY` (if absent, wind uses real Open-Meteo fallback)
- `REQUEST_TIMEOUT_SECONDS`
- `WIND_DRAG_FACTOR`

### Run

```bash
cd backend
uvicorn app:app --reload
```

API endpoint:

- `POST /analyze`

Request JSON:

```json
{
	"latitude": 15.0,
	"longitude": 90.0,
	"image_base64": "data:image/jpeg;base64,..."
}
```

Response JSON:

```json
{
	"current_location": {"latitude": 15.0, "longitude": 90.0},
	"predicted_location": {"latitude": 15.001, "longitude": 89.999, "eta_minutes": 120},
	"wind": {"speed_mps": 2.3, "direction_deg": 95.0, "source": "openweather"},
	"current": {"u_component_mps": -0.03, "v_component_mps": 0.02, "source": "noaa-erddap:erdQMekm1day"},
	"detections": []
}
```

## Frontend (Static)

Uses HTML/CSS/JavaScript + Leaflet map.

### Run

- Open `frontend-static/` using VS Code Live Server, or
- Run:

```bash
cd frontend-static
python -m http.server 5500
```

Open:

- `http://localhost:5500`

The dashboard sends:

- `fetch("http://localhost:8000/analyze", { method: "POST" })`

and visualizes:

- Current location marker
- Predicted location marker
- Predicted trajectory polyline
- Heatmap (plastic density proxy)
- Left/right/bottom panel metrics
