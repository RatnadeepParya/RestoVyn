#!/usr/bin/env bash
# =====================================================================
# RestoVyn On-Premise Restaurant Edge Appliance Provisioning Script
# Prepares an Ubuntu/Debian Intel NUC or Mini PC for 24/7 Restaurant Ops
# =====================================================================

set -euo pipefail

RESTOVYN_DIR="/opt/restovyn"
SERVICE_NAME="restovyn"

echo "====================================================================="
echo "   RestoVyn Restaurant Edge Appliance Installer (Enterprise)       "
echo "====================================================================="

if [[ $EUID -ne 0 ]]; then
   echo "Error: This script must be run as root (sudo ./edge-setup.sh)" 
   exit 1
fi

echo "==> Step 1: Updating system packages and installing prerequisites..."
apt-get update -y
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    avahi-daemon \
    avahi-utils \
    jq \
    ca-certificates \
    gnupg \
    lsb-release \
    net-tools \
    htop \
    iotop

echo "==> Step 2: Configuring mDNS hostname (restovyn.local)..."
# Configure Avahi daemon so all tablets and POS machines resolve restovyn.local automatically
sed -i 's/^#host-name=.*/host-name=restovyn/' /etc/avahi/avahi-daemon.conf || true
systemctl restart avahi-daemon
echo "    mDNS configured: http://restovyn.local will resolve on local Wi-Fi / LAN."

echo "==> Step 3: Installing Docker Engine & Docker Compose plugin..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "    Docker installed successfully."
else
    echo "    Docker already installed."
fi

echo "==> Step 4: Configuring Enterprise Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Administration'
ufw allow 80/tcp comment 'RestoVyn HTTP Gateway'
ufw allow 443/tcp comment 'RestoVyn HTTPS Gateway'
ufw allow 9100/tcp comment 'Thermal ESC/POS Printer Network Port'
ufw allow 5353/udp comment 'mDNS Avahi Discovery'
echo "y" | ufw enable
echo "    Firewall configured."

echo "==> Step 5: Provisioning Directory Structure & Permissions..."
mkdir -p "${RESTOVYN_DIR}/backups"
mkdir -p "${RESTOVYN_DIR}/logs"
mkdir -p "${RESTOVYN_DIR}/certs"
chmod -R 750 "${RESTOVYN_DIR}"

echo "==> Step 6: Installing systemd Service Supervisor..."
cat <<EOF > /etc/systemd/system/${SERVICE_NAME}.service
[Unit]
Description=RestoVyn Restaurant Edge Appliance Daemon
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${RESTOVYN_DIR}
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
Restart=on-failure
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ${SERVICE_NAME}.service
echo "    systemd service registered and enabled for boot."

echo "==> Step 7: Configuring Automated Nightly Backup Cron..."
cat << 'EOF' > /etc/cron.d/restovyn-backup
# RestoVyn Automated Nightly Database Backup at 04:00 AM
0 4 * * * root /opt/restovyn/scripts/backup-db.sh >> /var/log/restovyn-backup.log 2>&1
EOF
chmod 644 /etc/cron.d/restovyn-backup

echo "====================================================================="
echo "   RestoVyn Edge Appliance Setup Complete!                          "
echo "   Local Hostname: http://restovyn.local                             "
echo "====================================================================="
