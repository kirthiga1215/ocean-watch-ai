import { MapPin, ArrowRight, Clock } from "lucide-react";
import { useDatasetDashboard } from "@/hooks/useDatasetDashboard";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

const BottomPrediction = () => {
  const { data, isLoading, isError } = useDatasetDashboard();

  if (isLoading || isError || !data) {
    return (
      <div className="glass-card glow-border px-6 py-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-primary">
            Prediction (120 Minutes)
          </h2>
        </div>
        <p className="mt-3 text-sm font-mono text-muted-foreground">
          {isError ? "Dataset unavailable" : "Loading prediction from dataset..."}
        </p>
      </div>
    );
  }

  const currentLat = data.summary.center_lat;
  const currentLng = data.summary.center_lng;
  const predictedLat = data.trajectory.at(-1)?.[0] ?? currentLat;
  const predictedLng = data.trajectory.at(-1)?.[1] ?? currentLng;
  const distanceKm = haversineKm(currentLat, currentLng, predictedLat, predictedLng);
  const speedKmh = distanceKm / 2;
  const confidence = data?.clusters.length
    ? Math.round((data.clusters.reduce((sum, c) => sum + c.density, 0) / data.clusters.length) * 100)
    : 0;

  return (
    <div className="glass-card glow-border px-6 py-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-semibold tracking-widest uppercase text-primary">
          Prediction (120 Minutes)
        </h2>
      </div>

      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Current Location */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-heat-low/20 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-heat-low" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Current Location
            </p>
            <p className="font-mono text-sm text-foreground">
              <span className="text-primary">{currentLat.toFixed(4)}°N</span>,{" "}
              <span className="text-primary">{currentLng.toFixed(4)}°E</span>
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-heat-low to-heat-high" />
          <ArrowRight className="h-5 w-5 text-heat-medium animate-breathe" />
          <div className="h-px w-12 bg-gradient-to-r from-heat-medium to-heat-high" />
        </div>

        {/* Predicted Location */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-heat-high/20 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-heat-high" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Predicted Location
            </p>
            <p className="font-mono text-sm text-foreground">
              <span className="text-heat-high">{predictedLat.toFixed(4)}°N</span>,{" "}
              <span className="text-heat-high">{predictedLng.toFixed(4)}°E</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 ml-auto">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Distance
            </p>
            <p className="font-mono text-sm text-foreground">
              {distanceKm.toFixed(2)} <span className="text-muted-foreground">km</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Speed
            </p>
            <p className="font-mono text-sm text-foreground">
              {speedKmh.toFixed(2)} <span className="text-muted-foreground">km/h</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Confidence
            </p>
            <p className="font-mono text-sm text-primary">{confidence}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPrediction;
