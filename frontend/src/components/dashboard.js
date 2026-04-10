import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { Bar, Line, Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {

  const [data, setData] = useState({
    traffic: [],
    logs: [],
    slowApis: [],
    latency: [],
    rpm: [],
    errors: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async (isMounted) => {
    try {
      const [
        trafficRes,
        logsRes,
        slowRes,
        latencyRes,
        rpmRes,
        errorRes
      ] = await Promise.all([
        API.get("/analytics/traffic"),
        API.get("/logs"),
        API.get("/analytics/slow"),
        API.get("/analytics/latency"),
        API.get("/analytics/rpm"),
        API.get("/analytics/errors")
      ]);

      if (!isMounted.current) return;

      setData({
        traffic: trafficRes.data || [],
        logs: logsRes.data || [],
        slowApis: slowRes.data || [],
        latency: latencyRes.data || [],
        rpm: rpmRes.data || [],
        errors: errorRes.data || {}
      });

      setError(null);

    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load dashboard data");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    const isMounted = { current: true };

    fetchAll(isMounted);

    const interval = setInterval(() => {
      fetchAll(isMounted);
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const { traffic, logs, slowApis, latency, rpm, errors } = data;

  const barData = useMemo(() => ({
    labels: traffic.map(x => x.endpoint),
    datasets: [{
      label: "Requests",
      data: traffic.map(x => x.requests),
      backgroundColor: "#3b82f6"
    }]
  }), [traffic]);

  const latencyTrend = useMemo(() => ({
    labels: logs.map((_, i) => i), 
    datasets: [{
      label: "Response Time (ms)",
      data: logs.map(x => x.response_time),
      borderColor: "#10b981",
      fill: false
    }]
  }), [logs]);

  const avgLatencyChart = useMemo(() => ({
    labels: latency.map(x => x.endpoint),
    datasets: [{
      label: "Avg Latency (ms)",
      data: latency.map(x => x.latency),
      backgroundColor: "#f59e0b"
    }]
  }), [latency]);

  const rpmChart = useMemo(() => ({
    labels: rpm.map(x => x.time),
    datasets: [{
      label: "Requests Per Minute",
      data: rpm.map(x => x.requests),
      borderColor: "#8b5cf6",
      fill: false
    }]
  }), [rpm]);

  const errorChart = useMemo(() => ({
    labels: ["Success", "Errors"],
    datasets: [{
      data: [errors.success || 0, errors.errors || 0],
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  }), [errors]);

  if (loading) return <h2>Loading dashboard...</h2>;

  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className="dashboard">

      <h1>API Monitoring Dashboard</h1>

      <div className="stats">

        <div className="card">
          <h3>Total Endpoints</h3>
          <h2>{traffic.length}</h2>
        </div>

        <div className="card">
          <h3>Total Requests</h3>
          <h2>{logs.length}</h2>
        </div>

        <div className="card">
          <h3>Slow APIs</h3>
          <h2>{slowApis.length}</h2>
        </div>

      </div>

      <h2>API Traffic</h2>
      <Bar data={barData} />

      <h2>Response Time Trend</h2>
      <Line data={latencyTrend} />

      <h2>Average API Latency</h2>
      <Bar data={avgLatencyChart} />

      <h2>Requests Per Minute</h2>
      <Line data={rpmChart} />

      <h2>Error Rate</h2>
      <Pie data={errorChart} />

      <h2>Recent Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Status</th>
            <th>Response Time</th>
          </tr>
        </thead>

        <tbody>
          {logs.slice(0, 10).map((log, i) => (
            <tr key={log.request_id || i}>
              <td>{log.endpoint}</td>
              <td>{log.method}</td>
              <td>{log.status_code}</td>
              <td>{log.response_time} ms</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Dashboard;
