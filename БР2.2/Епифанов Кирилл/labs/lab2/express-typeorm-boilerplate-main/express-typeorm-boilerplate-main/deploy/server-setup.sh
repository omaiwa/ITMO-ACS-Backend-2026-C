#!/usr/bin/env bash
# Initial VPS setup for Lab 4 — Ubuntu 22.04/24.04 LTS
# Run as root or with sudo: bash deploy/server-setup.sh

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Run as root: sudo bash deploy/server-setup.sh"
    exit 1
fi

DEPLOY_USER="${SUDO_USER:-${USER}}"
if [[ "$DEPLOY_USER" == "root" ]]; then
    DEPLOY_USER="${1:-ubuntu}"
fi

echo "==> Updating system packages"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Installing base packages"
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates \
    curl \
    git \
    gnupg \
    nginx \
    ufw

echo "==> Installing Docker Engine"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

source /etc/os-release
echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

echo "==> Adding user '$DEPLOY_USER' to docker group"
usermod -aG docker "$DEPLOY_USER"

echo "==> Enabling services"
systemctl enable docker
systemctl enable nginx
systemctl start docker
systemctl start nginx

echo "==> Configuring firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable

echo "==> Done. Log out and back in (or run: newgrp docker) so docker group applies."
echo "    Next: follow deploy/DEPLOY.md to clone the app and start the stack."
