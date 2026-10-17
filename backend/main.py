import sqlite3
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_FILE = Path(__file__).resolve().parent / "app.db"
app = FastAPI(title="TaskFlow API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


with get_conn() as conn:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "title TEXT NOT NULL, "
        "priority TEXT NOT NULL DEFAULT 'Medium', "
        "done INTEGER NOT NULL DEFAULT 0)"
    )


class Task(BaseModel):
    title: str
    priority: Literal["High", "Medium", "Low"] = "Medium"


def all_tasks():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, title, priority, done FROM tasks ORDER BY done, "
            "CASE priority WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END, id DESC"
        ).fetchall()
    return [{**dict(r), "done": bool(r["done"])} for r in rows]


@app.get("/")
def root():
    return {"message": "TaskFlow API is running. See /docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/tasks")
def list_tasks():
    return all_tasks()


@app.post("/api/tasks")
def add_task(task: Task):
    if not task.title.strip():
        raise HTTPException(status_code=400, detail="Title is empty")
    with get_conn() as conn:
        conn.execute("INSERT INTO tasks (title, priority) VALUES (?, ?)", (task.title.strip(), task.priority))
    return all_tasks()


@app.put("/api/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    with get_conn() as conn:
        conn.execute("UPDATE tasks SET done = 1 - done WHERE id = ?", (task_id,))
    return all_tasks()


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    return all_tasks()
