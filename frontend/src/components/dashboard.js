import React, { useEffect, useState } from "react";
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

function Dashboard(){

 const [traffic,setTraffic] = useState([]);
 const [logs,setLogs] = useState([]);
 const [slowApis,setSlowApis] = useState([]);

 const [latency,setLatency] = useState([]);
 const [rpm,setRpm] = useState([]);
 const [errors,setErrors] = useState({});

 useEffect(()=>{

  fetchTraffic();
  fetchLogs();
  fetchSlowApis();

  fetchLatency();
  fetchRPM();
  fetchErrors();

  const interval = setInterval(()=>{
    fetchTraffic();
    fetchLogs();
    fetchSlowApis();

    fetchLatency();
    fetchRPM();
    fetchErrors();
  },5000);

  return ()=>clearInterval(interval);

 },[]);


 const fetchTraffic = async()=>{
   const res = await API.get("/analytics/traffic");
   setTraffic(res.data);
 };

 const fetchLogs = async()=>{
   const res = await API.get("/logs");
   setLogs(res.data);
 };

 const fetchSlowApis = async()=>{
   const res = await API.get("/analytics/slow");
   setSlowApis(res.data);
 };

 const fetchLatency = async()=>{
   const res = await API.get("/analytics/latency");
   setLatency(res.data);
 };

 const fetchRPM = async()=>{
   const res = await API.get("/analytics/rpm");
   setRpm(res.data);
 };

 const fetchErrors = async()=>{
   const res = await API.get("/analytics/errors");
   setErrors(res.data);
 };


 const barData = {
  labels: traffic.map(x=>x.endpoint),
  datasets:[
   {
    label:"Requests",
    data: traffic.map(x=>x.requests),
    backgroundColor:"#3b82f6"
   }
  ]
 };


 const latencyTrend = {
  labels: logs.map(x=>x.endpoint),
  datasets:[
   {
    label:"Response Time (ms)",
    data: logs.map(x=>x.response_time),
    borderColor:"#10b981",
    backgroundColor:"#10b981"
   }
  ]
 };


 const avgLatencyChart = {
  labels: latency.map(x=>x.endpoint),
  datasets:[
   {
    label:"Avg Latency (ms)",
    data: latency.map(x=>x.latency),
    backgroundColor:"#f59e0b"
   }
  ]
 };


 const rpmChart = {
  labels: rpm.map(x=>x.time),
  datasets:[
   {
    label:"Requests Per Minute",
    data: rpm.map(x=>x.requests),
    borderColor:"#8b5cf6"
   }
  ]
 };


 const errorChart = {
  labels:["Success","Errors"],
  datasets:[
   {
    data:[
     errors.success || 0,
     errors.errors || 0
    ],
    backgroundColor:["#22c55e","#ef4444"]
   }
  ]
 };


 return(

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

  <div className="chart">
   <Bar data={barData}/>
  </div>


  <h2>Response Time Trend</h2>

  <div className="chart">
   <Line data={latencyTrend}/>
  </div>


  <h2>Average API Latency</h2>

  <div className="chart">
   <Bar data={avgLatencyChart}/>
  </div>


  <h2>Requests Per Minute</h2>

  <div className="chart">
   <Line data={rpmChart}/>
  </div>


  <h2>Error Rate</h2>

  <div className="chart">
   <Pie data={errorChart}/>
  </div>


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

   {logs.slice(0,10).map((log,i)=>(
    <tr key={i}>
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