const supabase = require("../supabaseClient");
const crypto = require("crypto");

const logger = (req, res, next) => {
  const start = process.hrtime.bigint(); 
  const requestId = crypto.randomUUID();

  req.requestId = requestId;

  const logRequest = async () => {
    const end = process.hrtime.bigint();
    const responseTime = Number(end - start) / 1e6; 

    try {
      await supabase.from("api_logs").insert({
        request_id: requestId,
        endpoint: req.originalUrl,
        method: req.method,
        status_code: res.statusCode,
        response_time: Math.round(responseTime),
        ip_address:
          req.headers["x-forwarded-for"]?.split(",")[0] ||
          req.socket.remoteAddress,
        user_agent: req.headers["user-agent"],
        user_id: req.user?.id || null,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Logger error:", err.message);
    }
  };

  // Log on finish (normal response)
  res.on("finish", logRequest);

  res.on("close", logRequest);

  next();
};

module.exports = logger;
