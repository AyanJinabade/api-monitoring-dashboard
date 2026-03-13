const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");
const supabase = require("./supabaseClient");

const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// logger middleware
app.use(logger);

// test endpoint
app.get("/api/test", (req,res)=>{
 res.json({message:"API working"});
});

// analytics routes
app.use("/analytics", analyticsRoutes);

// logs endpoint
app.get("/logs", async (req,res)=>{

 const { data, error } = await supabase
   .from("api_logs")
   .select("*")
   .order("id",{ascending:false});

 if(error){
   return res.status(500).json(error);
 }

 res.json(data);

});

app.listen(5000,()=>{
 console.log("Server running on port 5000");
});