export type DatasetCluster = {
  id: number;
  lat: number;
  lng: number;
  density: number;
  size_tons: number;
  label: string;
  confidence: number;
  report: number;
};

export type DatasetSummary = {
  cluster_count: number;
  density_level: string;
  last_scan: string;
  center_lat: number;
  center_lng: number;
  total_area_km2: number;
};

export type DatasetDashboardResponse = {
  dataset: string;
  summary: DatasetSummary;
  clusters: DatasetCluster[];
  trajectory: [number, number][];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchDatasetDashboard(): Promise<DatasetDashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/dataset/dashboard`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to fetch dataset dashboard: ${response.status} ${detail}`);
  }

  return (await response.json()) as DatasetDashboardResponse;
}
