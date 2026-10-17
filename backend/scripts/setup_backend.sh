#!/bin/bash
# Run on the BACKEND EC2 instance
set -e
cd "$(dirname "$0")/.."
BACKEND_DIR=$(pwd)

sudo dnf install -y python3.11 python3.11-pip
python3.11 -m venv venv
./venv/bin/pip install -r requirements.txt

sudo tee /etc/systemd/system/backend.service > /dev/null << SERVICE
[Unit]
Description=FastAPI backend
After=network.target

[Service]
WorkingDirectory=$BACKEND_DIR
ExecStart=$BACKEND_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable --now backend
sudo systemctl restart backend
echo "Backend running. Test: curl http://localhost:8000/api/health"
echo "Docs: http://<BACKEND_PUBLIC_IP>:8000/docs"
