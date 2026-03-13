#!/bin/bash
# install.sh
# Automated Installation Script for OpenClaw Mailchimp API on Ubuntu/Debian VPS (e.g., Hostinger)

set -e

# Define Colors for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  🚀 OpenClaw Mailchimp Integration Setup Script 🚀  ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo ""

# Get current directory and ensure we're in the right spot
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." &> /dev/null && pwd)
cd "$PROJECT_DIR"
echo -e "${GREEN}Running installation in: $PROJECT_DIR${NC}"

# 1. Ask for Mailchimp Credentials Interactively
echo -e "\n${YELLOW}▶ Step 1: Let's set up your Mailchimp Credentials${NC}"
echo "We need three things to connect this API to your Mailchimp account."
echo ""

read -p "Enter your Mailchimp API Key: " MC_API_KEY
read -p "Enter your Mailchimp Server Prefix (e.g., us14, us21 - found at the end of your API Key): " MC_PREFIX
read -p "Enter your Mailchimp Audience ID: " MC_AUDIENCE_ID

# Create the .env file in the scripts directory
cat > "$PROJECT_DIR/scripts/.env" << EOF
MAILCHIMP_API_KEY=$MC_API_KEY
MAILCHIMP_SERVER_PREFIX=$MC_PREFIX
MAILCHIMP_AUDIENCE_ID=$MC_AUDIENCE_ID
EOF

echo -e "${GREEN}✅ Credentials saved securely in $PROJECT_DIR/scripts/.env${NC}"

# 2. System Updates & Dependencies
echo -e "\n${YELLOW}▶ Step 2: Checking System Dependencies (Python, Git, venv)${NC}"
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip git

# 3. Setup Python Virtual Environment
echo -e "\n${YELLOW}▶ Step 3: Setting up the Python Virtual Environment${NC}"
if [ ! -d "$PROJECT_DIR/scripts/venv" ]; then
    python3 -m venv "$PROJECT_DIR/scripts/venv"
    echo -e "${GREEN}✅ Virtual environment created.${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists.${NC}"
fi

echo -e "\n${YELLOW}▶ Step 4: Installing required Python packages${NC}"
source "$PROJECT_DIR/scripts/venv/bin/activate"
pip install --upgrade pip
pip install -r "$PROJECT_DIR/scripts/requirements.txt"
deactivate
echo -e "${GREEN}✅ Python dependencies installed.${NC}"

# 4. Setup Systemd Service
echo -e "\n${YELLOW}▶ Step 5: Configuring Background Service (systemd)${NC}"
SERVICE_FILE="/etc/systemd/system/openclaw-mailchimp.service"

sudo bash -c "cat > $SERVICE_FILE" << EOF
[Unit]
Description=OpenClaw Mailchimp Webhook API
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/scripts
Environment="PATH=$PROJECT_DIR/scripts/venv/bin"
ExecStart=$PROJECT_DIR/scripts/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload and enable the service
sudo systemctl daemon-reload
sudo systemctl enable openclaw-mailchimp
sudo systemctl restart openclaw-mailchimp

echo -e "${GREEN}✅ Background service 'openclaw-mailchimp' created and started!${NC}"
sudo systemctl is-active --quiet openclaw-mailchimp && echo -e "   Status: ${GREEN}RUNNING${NC}" || echo -e "   Status: ${RED}FAILED TO START${NC} (Check logs with: sudo journalctl -u openclaw-mailchimp -n 50)"

# 5. Setup the Auto-Updater Cron Job
echo -e "\n${YELLOW}▶ Step 6: Setting up the Auto-Updater${NC}"
CRON_JOB="*/5 * * * * $PROJECT_DIR/deploy/update.sh >> $PROJECT_DIR/deploy/update.log 2>&1"
# Check if cron job already exists to avoid duplicates
(crontab -l 2>/dev/null | grep -Fv "$PROJECT_DIR/deploy/update.sh" ; echo "$CRON_JOB") | crontab -
chmod +x "$PROJECT_DIR/deploy/update.sh"
echo -e "${GREEN}✅ Auto-updater configured to check GitHub every 5 minutes.${NC}"

echo -e "\n${CYAN}======================================================${NC}"
echo -e "${GREEN}🎉 INSTALLATION COMPLETE! 🎉${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "Your API is now running on this server in the background."
echo -e "You can give the following OpenAPI Schema URL to OpenClaw or your AI Agent:"
echo ""
echo -e "   👉 ${YELLOW}http://$(curl -s ifconfig.me):8000/openapi.json${NC}"
echo ""
echo -e "To view live logs, run: ${YELLOW}sudo journalctl -u openclaw-mailchimp -f${NC}"
