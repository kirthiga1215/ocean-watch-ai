import { Wind, Navigation, Waves } from "lucide-react";
import { useDatasetDashboard } from "@/hooks/useDatasetDashboard";

function averageDensityToDirection(density: number): number {
  return Math.round(45 + density * 180);
}

function directionToLabel(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

const RightPanel = () => {
  const { data, isLoading, isError } = useDatasetDashboard();

  if (isLoading || isError || !data) {
    return (
      <div className="glass-card glow-border p-5 w-64 flex flex-col gap-5 animate-fade-in">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-primary">
          Wind & Ocean Data
        </h2>
        <p className="text-sm font-mono text-muted-foreground">
          {isError ? "Dataset unavailable" : "Loading from dataset..."}
        </p>
      </div>
    );
  }

  const avgDensity = data.clusters.length
    ? data.clusters.reduce((sum, c) => sum + c.density, 0) / data.clusters.length
    : 0;
  const directionDeg = averageDensityToDirection(avgDensity);
  const directionLabel = directionToLabel(directionDeg);
  const speedKnots = (avgDensity * 20).toFixed(1);
  const speedWidth = `${Math.max(5, Math.min(100, avgDensity * 100))}%`;
  const currentMps = (avgDensity * 1.5).toFixed(2);

  return (
    <div className="glass-card glow-border p-5 w-64 flex flex-col gap-5 animate-fade-in">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-primary">
        Wind & Ocean Data
      </h2>

      {/* Wind Direction */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Wind Direction
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Navigation
            className="h-10 w-10 text-primary animate-breathe"
            style={{ transform: `rotate(${directionDeg}deg)` }}
          />
          <div className="text-right">
            <p className="text-2xl font-semibold font-mono text-foreground">
              {directionLabel}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {directionDeg}°
            </p>
          </div>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Wind Speed
          </span>
        </div>
        <p className="text-3xl font-semibold font-mono text-foreground">
          {speedKnots} <span className="text-sm text-muted-foreground">knots</span>
        </p>
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: speedWidth }}
          />
        </div>
      </div>

      {/* Ocean Current */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ocean Current
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <Waves
                key={i}
                className="h-6 w-6 text-primary"
                style={{
                  opacity: 0.4 + i * 0.3,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold font-mono text-foreground">
              {currentMps} <span className="text-xs text-muted-foreground">m/s</span>
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {directionLabel} Direction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
