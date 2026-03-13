const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// API Traffic
router.get("/traffic", async (req,res)=>{

 const { data } = await supabase
   .from("api_logs")
   .select("endpoint");

 const counts = {};

 data.forEach(row=>{
   counts[row.endpoint] = (counts[row.endpoint] || 0) + 1;
 });

 const result = Object.keys(counts).map(key=>({
   endpoint:key,
   requests:counts[key]
 }));

 res.json(result);

});


// Slow APIs
router.get("/slow", async (req,res)=>{

 const { data } = await supabase
   .from("api_logs")
   .select("*")
   .gt("response_time",500);

 res.json(data);

});


// API Latency (Average Response Time)
router.get("/latency", async (req,res)=>{

 const { data, error } = await supabase
   .from("api_logs")
   .select("endpoint,response_time");

 if(error) return res.status(500).json(error);

 const result = {};

 data.forEach(row=>{
   if(!result[row.endpoint]){
     result[row.endpoint] = [];
   }
   result[row.endpoint].push(row.response_time);
 });

 const avgLatency = Object.keys(result).map(endpoint=>{
   const avg =
     result[endpoint].reduce((a,b)=>a+b,0) / result[endpoint].length;

   return {
     endpoint,
     latency: Math.round(avg)
   };
 });

 res.json(avgLatency);

});


// Requests Per Minute
router.get("/rpm", async (req,res)=>{

 const { data, error } = await supabase
   .from("api_logs")
   .select("created_at");

 if(error) return res.status(500).json(error);

 const counts = {};

 data.forEach(row=>{
   const minute = new Date(row.created_at)
     .toISOString()
     .slice(0,16);

   counts[minute] = (counts[minute] || 0) + 1;
 });

 const result = Object.keys(counts).map(time=>({
   time,
   requests:counts[time]
 }));

 res.json(result);

});


// Error Rate
router.get("/errors", async (req,res)=>{

 const { data, error } = await supabase
   .from("api_logs")
   .select("status_code");

 if(error) return res.status(500).json(error);

 let success = 0;
 let errors = 0;

 data.forEach(row=>{

   if(row.status_code >= 200 && row.status_code < 400){
     success++;
   }

   else if(row.status_code >= 400){
     errors++;
   }

 });

 res.json({
   success,
   errors
 });

});


module.exports = router;