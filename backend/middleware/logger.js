const supabase = require("../supabaseClient");

const logger = (req, res, next) => {

  console.log("Logger middleware triggered");

  const start = Date.now();

  res.on("finish", async () => {

    const responseTime = Date.now() - start;

    console.log("Attempting to insert log...");

    const { data, error } = await supabase
      .from("api_logs")
      .insert([
        {
          endpoint: req.originalUrl,
          method: req.method,
          status_code: res.statusCode,
          response_time: responseTime
        }
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.log("Log inserted successfully");
    }

  });

  next();
};

module.exports = logger;