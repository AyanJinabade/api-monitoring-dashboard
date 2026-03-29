const supabase = require("../supabaseClient");
const crypto = require("crypto");

const logger = (req, res, next) => {
  const start = process.hrtime.bigint();

  // Safe UUID fallback
  const requestId = crypto.randomUUID
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString("hex");

  req.requestId = requestId;

  let logged = false; // ✅ prevent duplicate logging

  const logRequest = async () => {
    if (logged) return; // 🚨 FIX: avoid double logging
    logged = true;

    try {
      const end = process.hrtime.bigint();
      const responseTime = Number(end - start) / 1e6;

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        null;

      const userAgent = req.headers["user-agent"] || "unknown";

      // Fire-and-forget (non-blocking)
      supabase
        .from("api_logs")
        .insert({
          request_id: requestId,
          endpoint: req.originalUrl,
          method: req.method,
          status_code: res.statusCode,
          response_time: Math.round(responseTime),
          ip_address: ip,
          user_agent: userAgent,
          user_id: req.user?.id || null,
          created_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) {
            console.error("Supabase log error:", error.message);
          }
        })
        .catch((err) => {
          console.error("Logger error:", err.message);
        });

    } catch (err) {
      console.error("Logger crash:", err.message);
    }
  };

  // ✅ Use only ONE reliable event
  res.on("finish", logRequest);

  next();
};

module.exports = logger;
