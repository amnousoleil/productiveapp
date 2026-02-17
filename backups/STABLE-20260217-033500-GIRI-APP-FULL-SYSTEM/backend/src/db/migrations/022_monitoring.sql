-- =====================================================
-- MIGRATION 022: MONITORING & ERROR TRACKING
-- Système de health checks et logging d'erreurs
-- =====================================================

-- Table error_logs : stockage des erreurs frontend/backend
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Error details
    message TEXT NOT NULL,
    stack TEXT,
    error_type VARCHAR(100),

    -- Context
    url TEXT,
    user_agent TEXT,
    member_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

    -- Request details
    ip_address INET,
    http_method VARCHAR(10),
    request_path TEXT,
    request_body JSONB,

    -- Browser/Environment
    browser_info JSONB,
    screen_resolution VARCHAR(50),
    viewport_size VARCHAR(50),

    -- Severity
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),

    -- Additional metadata
    metadata JSONB,

    -- Timestamps
    error_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_member_id ON error_logs(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_workspace_id ON error_logs(workspace_id) WHERE workspace_id IS NOT NULL;

-- Table health_checks : historique des checks
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),

    -- Component checks
    database_status VARCHAR(20) CHECK (database_status IN ('ok', 'slow', 'error')),
    database_response_time_ms INTEGER,

    redis_status VARCHAR(20) CHECK (redis_status IN ('ok', 'error', 'disabled')),
    redis_response_time_ms INTEGER,

    -- System metrics
    memory_used_mb INTEGER,
    memory_total_mb INTEGER,
    memory_percent DECIMAL(5,2),

    cpu_percent DECIMAL(5,2),

    uptime_seconds BIGINT,

    -- Additional checks
    active_connections INTEGER,
    disk_usage_percent DECIMAL(5,2),

    -- Metadata
    metadata JSONB,

    -- Timestamps
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recent health checks
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);
CREATE INDEX idx_health_checks_status ON health_checks(status);

-- Table system_alerts : alertes système
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Alert details
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Severity
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,

    -- Metadata
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for alerts
CREATE INDEX idx_system_alerts_status ON system_alerts(status);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_created_at ON system_alerts(created_at DESC);

-- Function to auto-cleanup old error logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM error_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to auto-cleanup old health checks (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_checks()
RETURNS void AS $$
BEGIN
    DELETE FROM health_checks
    WHERE checked_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create view for error stats
CREATE OR REPLACE VIEW error_stats AS
SELECT
    DATE_TRUNC('hour', created_at) as hour,
    severity,
    error_type,
    COUNT(*) as error_count,
    COUNT(DISTINCT member_id) as affected_users,
    COUNT(DISTINCT ip_address) as affected_ips
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), severity, error_type
ORDER BY hour DESC;

-- Create view for recent errors (last 100)
CREATE OR REPLACE VIEW recent_errors AS
SELECT
    id,
    message,
    error_type,
    severity,
    url,
    member_id,
    ip_address,
    created_at
FROM error_logs
ORDER BY created_at DESC
LIMIT 100;

-- Grant permissions
GRANT SELECT, INSERT ON error_logs TO productive_user;
GRANT SELECT, INSERT ON health_checks TO productive_user;
GRANT SELECT, INSERT, UPDATE ON system_alerts TO productive_user;
GRANT SELECT ON error_stats TO productive_user;
GRANT SELECT ON recent_errors TO productive_user;

-- Comments for documentation
COMMENT ON TABLE error_logs IS 'Stockage centralisé des erreurs frontend et backend';
COMMENT ON TABLE health_checks IS 'Historique des health checks système';
COMMENT ON TABLE system_alerts IS 'Alertes système pour les admins';
COMMENT ON FUNCTION cleanup_old_error_logs() IS 'Nettoie les logs d''erreur de plus de 30 jours';
COMMENT ON FUNCTION cleanup_old_health_checks() IS 'Nettoie les health checks de plus de 7 jours';
