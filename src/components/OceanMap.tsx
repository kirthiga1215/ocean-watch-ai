import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDatasetDashboard } from "@/hooks/useDatasetDashboard";
import type { DatasetCluster } from "@/lib/api";

function getDensityColor(density: number): string {
  if (density > 0.7) return "#EF4444";
  if (density > 0.4) return "#FACC15";
  return "#3B82F6";
}

// Custom pulsing markers via DOM
const PulsingMarkers = ({ clusters }: { clusters: DatasetCluster[] }) => {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    clusters.forEach((cluster) => {
      const color = getDensityColor(cluster.density);
      const icon = L.divIcon({
        className: "pulse-marker",
        html: `<div style="
          width: 14px; height: 14px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 12px ${color}, 0 0 24px ${color}40;
          position: relative;
        "><div style="
          position: absolute; top: 50%; left: 50%;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 2px solid ${color};
          transform: translate(-50%, -50%);
          animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite;
        "></div></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="
            background: rgba(15,23,42,0.95);
            border: 1px solid rgba(34,211,238,0.3);
            border-radius: 8px;
            padding: 8px 12px;
            font-family: Inter, sans-serif;
            color: #F8FAFC;
            font-size: 11px;
            backdrop-filter: blur(10px);
          ">
            <strong style="color: #22D3EE;">${cluster.label}</strong><br/>
            <span style="font-family: Space Mono, monospace; font-size: 10px; color: #94A3B8;">
              Density: ${(cluster.density * 100).toFixed(0)}% · ${cluster.size_tons} tons
            </span>
          </div>`,
          { direction: "top", offset: [0, -10], className: "custom-tooltip" }
        );

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [map, clusters]);

  return null;
};

const OceanMap = () => {
  const { data, isLoading, isError, error } = useDatasetDashboard();

  if (isLoading) {
    return (
      <div className="h-full w-full rounded-xl border border-border/40 bg-secondary/20 flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">Loading MARIDA dataset...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-full w-full rounded-xl border border-destructive/40 bg-destructive/10 flex items-center justify-center px-4">
        <p className="text-sm font-mono text-destructive text-center">
          Dataset load failed{error instanceof Error ? `: ${error.message}` : "."}
        </p>
      </div>
    );
  }

  const clusters = data.clusters;
  const center: [number, number] = [data.summary.center_lat, data.summary.center_lng];

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="h-full w-full rounded-xl"
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Heatmap zones */}
      {clusters.slice(0, 30).map((cluster) => (
        <CircleMarker
          key={`zone-${cluster.id}-${cluster.lat}-${cluster.lng}`}
          center={[cluster.lat, cluster.lng]}
          radius={cluster.density * 22 + 10}
          pathOptions={{
            fillColor: getDensityColor(cluster.density),
            fillOpacity: 0.4,
            stroke: false,
          }}
        />
      ))}

      {/* Cluster circles with tooltips (backup for non-JS tooltip) */}
      {clusters.map((cluster) => (
        <CircleMarker
          key={cluster.id}
          center={[cluster.lat, cluster.lng]}
          radius={cluster.density * 18 + 4}
          pathOptions={{
            fillColor: getDensityColor(cluster.density),
            fillOpacity: 0.2,
            color: getDensityColor(cluster.density),
            weight: 1,
            opacity: 0.3,
          }}
        >
          <Tooltip>
            <span className="font-mono text-xs">{cluster.label}: {cluster.size_tons} tons</span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Trajectory line */}
      {data?.trajectory?.length ? (
        <Polyline
          positions={data.trajectory}
          pathOptions={{
            color: "#22D3EE",
            weight: 2,
            opacity: 0.7,
            dashArray: "8 6",
          }}
        />
      ) : null}

      <PulsingMarkers clusters={clusters} />
    </MapContainer>
  );
};

export default OceanMap;
