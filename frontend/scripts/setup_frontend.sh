#!/bin/bash
# Run on the FRONTEND EC2 instance
# Usage: ./setup_frontend.sh http://<BACKEND_PUBLIC_IP>:8000
set -e
if [ -z "$1" ]; then
  echo "Usage: ./setup_frontend.sh http://<BACKEND_PUBLIC_IP>:8000"
  exit 1
fi
API_URL="$1"
cd "$(dirname "$0")/.."

sudo dnf install -y httpd
sudo systemctl enable --now httpd

sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
echo "window.API_URL = \"$API_URL\";" | sudo tee /var/www/html/config.js > /dev/null

sudo systemctl restart httpd
echo "Frontend running. Open http://<FRONTEND_PUBLIC_IP>"
