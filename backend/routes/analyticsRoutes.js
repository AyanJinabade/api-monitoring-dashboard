const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

const safeQuery = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

router.get("/traffic", async (req, res) => {
  try {
    const data = await safeQuery(
      supabase.from("api_logs").select("endpoint")
    );

    const counts = {};

    data.forEach(({ endpoint }) => {
      if (!endpoint) return;
      counts[endpoint] = (counts[endpoint] || 0) + 1;
    });

    const result = Object.entries(counts).map(([endpoint, requests]) => ({
      endpoint,
      requests
    }));

    res.status(200).json(result);

  } catch (err) {
    console.error("Traffic error:", err.message);
    res.status(500).json({ error: "Failed to fetch traffic data" });
  }
});
router.get("/slow", async (req, res) => {
  try {
    const data = await safeQuery(
      supabase
        .from("api_logs")
        .select("*")
        .gt("response_time", 500)
        .order("response_time", { ascending: false })
        .limit(50)
    );

    res.status(200).json(data);

  } catch (err) {
    console.error("Slow API error:", err.message);
    res.status(500).json({ error: "Failed to fetch slow APIs" });
  }
});
router.get("/latency", async (req, res) => {
  try {
    const data = await safeQuery(
      supabase
        .from("api_logs")
        .select("endpoint,response_time")
    );

    const result = {};

    data.forEach(({ endpoint, response_time }) => {
      if (!endpoint || response_time == null) return;

      if (!result[endpoint]) {
        result[endpoint] = { total: 0, count: 0 };
      }

      result[endpoint].total += response_time;
      result[endpoint].count += 1;
    });

    const avgLatency = Object.entries(result).map(([endpoint, v]) => ({
      endpoint,
      latency: Math.round(v.total / v.count)
    }));

    res.status(200).json(avgLatency);

  } catch (err) {
    console.error("Latency error:", err.message);
    res.status(500).json({ error: "Failed to calculate latency" });
  }
});
router.get("/rpm", async (req, res) => {
  try {
    const data = await safeQuery(
      supabase
        .from("api_logs")
        .select("created_at")
    );

    const counts = {};

    data.forEach(({ created_at }) => {
      if (!created_at) return;

      const minute = new Date(created_at)
        .toISOString()
        .slice(0, 16);

      counts[minute] = (counts[minute] || 0) + 1;
    });

    const result = Object.entries(counts)
      .map(([time, requests]) => ({ time, requests }))
      .sort((a, b) => a.time.localeCompare(b.time)); // FIX: sorting

    res.status(200).json(result);

  } catch (err) {
    console.error("RPM error:", err.message);
    res.status(500).json({ error: "Failed to calculate RPM" });
  }
});
router.get("/errors", async (req, res) => {
  try {
    const data = await safeQuery(
      supabase
        .from("api_logs")
        .select("status_code")
    );

    let success = 0;
    let errors = 0;

    data.forEach(({ status_code }) => {
      if (status_code >= 200 && status_code < 400) success++;
      else if (status_code >= 400) errors++;
    });

    res.status(200).json({ success, errors });

  } catch (err) {
    console.error("Error rate error:", err.message);
    res.status(500).json({ error: "Failed to calculate error rate" });
  }
});

module.exports = router;
