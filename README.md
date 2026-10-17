# TaskFlow: React + FastAPI + SQLite (separate servers)

- `backend/`  FastAPI + SQLite, EC2 #1, port 8000
- `frontend/` React (Vite), `dist/` committed build, Apache on EC2 #2, port 80

Backend EC2:  `cd backend/scripts && chmod +x setup_backend.sh && ./setup_backend.sh`
Frontend EC2: `cd frontend/scripts && chmod +x setup_frontend.sh && ./setup_frontend.sh http://<BACKEND_PUBLIC_IP>:8000`
