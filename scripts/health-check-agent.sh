#!/usr/bin/env bash
# =====================================================================
# RestoVyn On-Premise Restaurant Health Check & Watchdog Daemon
# Monitors Local Services, Database, Cache, and Network Thermal Printers
# =====================================================================

set -u

API_URL="${API_URL:-http://localhost/api/health/live}"
DB_CONTAINER="${DB_CONTAINER:-restovyn-prod-postgres}"
REDIS_CONTAINER="${REDIS_CONTAINER:-restovyn-prod-redis}"
PRINTER_IPS="${PRINTER_IPS:-}" # Space-separated list of printer IPs, e.g. "192.168.1.150 192.168.1.151"

FAILED_CHECKS=0

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting RestoVyn Service Watchdog..."

# 1. Check API Health
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${API_URL}" || echo "000")
if [[ "${HTTP_STATUS}" =~ ^(200|204)$ ]]; then
    echo "  [PASS] API Gateway: Healthy (HTTP ${HTTP_STATUS})"
else
    echo "  [FAIL] API Gateway: Unhealthy (HTTP ${HTTP_STATUS})"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# 2. Check PostgreSQL Container
if command -v docker &> /dev/null; then
    if docker exec "${DB_CONTAINER}" pg_isready -U restovyn > /dev/null 2>&1; then
        echo "  [PASS] PostgreSQL Database: Accepting Connections"
    else
        echo "  [FAIL] PostgreSQL Database: Not Ready"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# 3. Check Redis Container
if command -v docker &> /dev/null; then
    if docker exec "${REDIS_CONTAINER}" redis-cli ping | grep -q "PONG"; then
        echo "  [PASS] Redis Cache: Responsive (PONG)"
    else
        echo "  [FAIL] Redis Cache: Unresponsive"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# 4. Check Network Thermal Printers (Port 9100)
if [[ -n "${PRINTER_IPS}" ]]; then
    for IP in ${PRINTER_IPS}; do
        if nc -z -w 2 "${IP}" 9100 2>/dev/null; then
            echo "  [PASS] Thermal Printer (${IP}:9100): Connected"
        else
            echo "  [WARN] Thermal Printer (${IP}:9100): Unreachable on LAN"
        fi
    done
fi

if [[ ${FAILED_CHECKS} -gt 0 ]]; then
    echo "ALERT: Watchdog detected ${FAILED_CHECKS} failing health check(s)."
    exit 1
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] All core systems operational."
    exit 0
fi
