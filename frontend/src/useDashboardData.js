import { useEffect, useState } from "react";
import api from "./api";

const emptyData = {
  medications: [],
  symptoms: [],
  appointments: [],
  wellness: [],
  analytics: {},
};

function getList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

export function useDashboardData() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const endpoints = [
        ["medications", "/medications/"],
        ["symptoms", "/symptoms/"],
        ["appointments", "/appointments/"],
        ["wellness", "/wellness/"],
        ["analytics", "/analytics/dashboard/"],
      ];

      const results = await Promise.allSettled(
        endpoints.map(([, endpoint]) => api.get(endpoint))
      );

      if (!active) return;

      const updated = { ...emptyData };
      let failed = 0;

      results.forEach((result, index) => {
        const key = endpoints[index][0];

        if (result.status === "fulfilled") {
          if (key === "analytics") {
            updated.analytics = result.value.data || {};
          } else {
            updated[key] = getList(result.value);
          }
        } else {
          failed++;
          console.error(`Could not load ${key}:`, result.reason);
        }
      });

      setData(updated);

      if (failed === endpoints.length) {
        setError("Could not load dashboard data. Please check your connection.");
      } else if (failed > 0) {
        setError("Some dashboard information is temporarily unavailable.");
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
