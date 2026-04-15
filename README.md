API Monitoring Dashboard

A real-time API monitoring and analytics dashboard built to track performance, detect slow endpoints, and analyze system health using logs.

Overview

This project provides a complete monitoring solution for backend APIs by collecting request logs and visualizing key metrics such as:

API traffic
Response time trends
Error rates
Slow endpoints
Requests per minute (RPM)

It helps developers and teams identify bottlenecks, debug issues, and improve system performance.

 Features
 Real-time API analytics dashboard
 Response time and latency tracking
 Slow API detection (>500ms)
 Requests per minute (RPM) monitoring
 Error rate analysis
 Recent API request logs
 Automatic refresh every 5 seconds

System Architecture
Client Requests
      
Express Middleware (Logger)
      
Supabase Database (api_logs)
      
Backend APIs (Analytics Routes)
      
React Dashboard (Charts & Tables)


Tech Stack
Backend
Node.js
Express.js
Supabase (Database)
Frontend
React.js
Chart.js (react-chartjs-2)
Other Tools
REST APIs
Middleware Logging
Async Data Fetching


API Endpoints
Endpoint	Description
/analytics/traffic	API request count per endpoint
/analytics/slow	Slow APIs (>500ms)
/analytics/latency	Average response time
/analytics/rpm	Requests per minute
/analytics/errors	Error vs success rate
/logs	Recent API logs

Dashboard Preview

The dashboard includes:

Bar chart → API traffic
Line chart → Response time trends
Bar chart → Average latency
Line chart → Requests per minute
Pie chart → Error rate
Table → Recent API logs


Key Metrics Explained
Latency → Time taken for API response
RPM → Requests handled per minute
Error Rate → Failed vs successful requests
Slow APIs → Endpoints exceeding threshold


Use Cases
Backend performance monitoring
Debugging slow APIs
Production health tracking
System optimization
