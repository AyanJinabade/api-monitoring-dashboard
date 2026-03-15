const supabase = require("../supabaseClient");

const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const responseTime = Date.now() - start;

    try {
      const { error } = await supabase
        .from("api_logs")
        .insert({
          endpoint: req.originalUrl,
          method: req.method,
          status_code: res.statusCode,
          response_time: responseTime,
          ip_address: req.ip,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Supabase log error:", error.message);
      }

    } catch (err) {
      console.error("Logger middleware error:", err.message);
    }
  });

  next();
};

module.exports = logger;
