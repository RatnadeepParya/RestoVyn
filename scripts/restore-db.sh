#!/usr/bin/env bash
# =====================================================================
# RestoVyn Enterprise Database Disaster Recovery Restoration Script
# Checks SHA256 Integrity, Performs Decryption, and Replays Schema & Data
# =====================================================================

set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz[.gpg]>"
    exit 1
fi

INPUT_FILE="$1"
CONTAINER_NAME="${DB_CONTAINER:-restovyn-prod-postgres}"
DB_NAME="${POSTGRES_DB:-restovyn_db}"
DB_USER="${POSTGRES_USER:-restovyn}"

if [[ ! -f "${INPUT_FILE}" ]]; then
    echo "Error: Backup file not found: ${INPUT_FILE}"
    exit 1
fi

echo "====================================================================="
echo "   RestoVyn Enterprise Database Restoration                        "
echo "   Target File: ${INPUT_FILE}                                        "
echo "   Target DB:   ${DB_NAME}                                          "
echo "====================================================================="

# Check for checksum file
CHECKSUM_FILE="${INPUT_FILE}.sha256"
if [[ -f "${CHECKSUM_FILE}" ]]; then
    echo "==> Verifying SHA256 integrity hash..."
    shasum -a 256 -c "${CHECKSUM_FILE}"
    echo "    Integrity verification: PASS."
else
    echo "Warning: No checksum file found at ${CHECKSUM_FILE}. Continuing with caution."
fi

# Confirm destructive operation
read -rp "CAUTION: This will overwrite data in database '${DB_NAME}'. Proceed? (yes/no): " CONFIRM
if [[ "${CONFIRM}" != "yes" ]]; then
    echo "Restoration aborted by operator."
    exit 0
fi

# Decrypt if GPG encrypted
WORK_FILE="${INPUT_FILE}"
if [[ "${INPUT_FILE}" == *.gpg ]]; then
    echo "==> Decrypting GPG archive..."
    DECRYPTED_FILE="${INPUT_FILE%.gpg}"
    gpg --batch --yes --decrypt "${INPUT_FILE}" > "${DECRYPTED_FILE}"
    WORK_FILE="${DECRYPTED_FILE}"
fi

echo "==> Restoring database from archive..."
if command -v docker &> /dev/null && docker ps | grep -q "${CONTAINER_NAME}"; then
    gzip -dc "${WORK_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"
elif command -v psql &> /dev/null; then
    gzip -dc "${WORK_FILE}" | psql -U "${DB_USER}" -d "${DB_NAME}"
else
    echo "Error: Neither active Docker container '${CONTAINER_NAME}' nor local 'psql' found."
    exit 1
fi

# Cleanup temp file if decrypted
if [[ "${INPUT_FILE}" == *.gpg ]]; then
    rm -f "${WORK_FILE}"
fi

echo "====================================================================="
echo "==> Restoration Completed Successfully!                             "
echo "====================================================================="
