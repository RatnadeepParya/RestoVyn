#!/usr/bin/env bash
# =====================================================================
# RestoVyn Enterprise Database Backup & Offsite Replication Script
# Supports Gzip Compression, SHA256 Verification, GPG Encryption & S3/GCS Sync
# =====================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/restovyn/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="${DB_CONTAINER:-restovyn-prod-postgres}"
DB_NAME="${POSTGRES_DB:-restovyn_db}"
DB_USER="${POSTGRES_USER:-restovyn}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
GCS_BUCKET="${BACKUP_GCS_BUCKET:-}"

mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/restovyn_backup_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

echo "====================================================================="
echo "==> Starting RestoVyn Database Backup: ${TIMESTAMP}"
echo "====================================================================="

# 1. Execute compressed PostgreSQL dump via running container or local binary
if command -v docker &> /dev/null && docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "==> Performing pg_dump via Docker container: ${CONTAINER_NAME}..."
    docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"
elif command -v pg_dump &> /dev/null; then
    echo "==> Performing local pg_dump..."
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"
else
    echo "Error: Neither active Docker container '${CONTAINER_NAME}' nor local 'pg_dump' found."
    exit 1
fi

# 2. Generate cryptographic SHA256 integrity verification hash
echo "==> Generating SHA256 integrity checksum..."
shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
echo "    Checksum: $(cat "${CHECKSUM_FILE}")"

# 3. Optional GPG Symmetric Encryption
if [[ -n "${GPG_PASSPHRASE:-}" ]]; then
    echo "==> Encrypting backup with GPG AES-256..."
    echo "${GPG_PASSPHRASE}" | gpg --batch --yes --passphrase-fd 0 --symmetric --cipher-algo AES256 "${BACKUP_FILE}"
    rm -f "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gpg"
    shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
fi

# 4. Offsite Cloud Synchronization (AWS S3)
if [[ -n "${S3_BUCKET}" ]] && command -v aws &> /dev/null; then
    echo "==> Syncing backup to AWS S3: s3://${S3_BUCKET}/backups/..."
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/backups/"
    aws s3 cp "${CHECKSUM_FILE}" "s3://${S3_BUCKET}/backups/"
    echo "    S3 upload complete."
fi

# 5. Offsite Cloud Synchronization (Google Cloud Storage)
if [[ -n "${GCS_BUCKET}" ]] && command -v gcloud &> /dev/null; then
    echo "==> Syncing backup to Google Cloud Storage: gs://${GCS_BUCKET}/backups/..."
    gcloud storage cp "${BACKUP_FILE}" "gs://${GCS_BUCKET}/backups/"
    gcloud storage cp "${CHECKSUM_FILE}" "gs://${GCS_BUCKET}/backups/"
    echo "    GCS upload complete."
fi

# 6. Retention Pruning (Remove local archives older than retention threshold)
echo "==> Pruning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "restovyn_backup_*" -mtime +"${RETENTION_DAYS}" -delete

echo "====================================================================="
echo "==> Backup Successfully Completed: ${BACKUP_FILE}"
echo "====================================================================="
