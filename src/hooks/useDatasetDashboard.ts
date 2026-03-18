import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDashboard } from "@/lib/api";

export function useDatasetDashboard() {
  return useQuery({
    queryKey: ["dataset-dashboard"],
    queryFn: fetchDatasetDashboard,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
