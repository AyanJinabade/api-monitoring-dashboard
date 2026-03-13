-- Table to store API request logs

CREATE TABLE IF NOT EXISTS api_logs (
    id BIGSERIAL PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method VARCHAR(10),
    status_code INT,
    response_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Index for faster analytics queries

CREATE INDEX IF NOT EXISTS idx_endpoint
ON api_logs(endpoint);


CREATE INDEX IF NOT EXISTS idx_created_at
ON api_logs(created_at);


-- View for endpoint traffic analytics

CREATE VIEW endpoint_traffic AS
SELECT
    endpoint,
    COUNT(*) AS total_requests
FROM api_logs
GROUP BY endpoint;


-- View for slow API detection

CREATE VIEW slow_apis AS
SELECT
    endpoint,
    AVG(response_time) AS avg_response_time,
    COUNT(*) AS occurrences
FROM api_logs
WHERE response_time > 500
GROUP BY endpoint;


-- View for error rate monitoring

CREATE VIEW error_rates AS
SELECT
    endpoint,
    COUNT(*) FILTER (WHERE status_code >= 400) AS errors,
    COUNT(*) AS total_requests,
    ROUND(
        (COUNT(*) FILTER (WHERE status_code >= 400)::decimal /
        COUNT(*)) * 100, 2
    ) AS error_percentage
FROM api_logs
GROUP BY endpoint;