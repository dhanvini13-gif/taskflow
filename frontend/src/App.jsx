import { useEffect, useState } from "react";

const API = window.API_URL || "http://localhost:8000";
const FILTERS = ["All", "Active", "Done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const call = async (path, method = "GET", body) => {
    try {
      const res = await fetch(API + path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error();
      setTasks(await res.json());
      setError("");
    } catch {
      setError("Cannot reach the backend. Check the API address and port 8000.");
    }
  };

  useEffect(() => { call("/api/tasks"); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await call("/api/tasks", "POST", { title, priority });
    setTitle("");
  };

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const shown = tasks.filter(
    (t) => filter === "All" || (filter === "Active" ? !t.done : t.done)
  );

  return (
    <div className="page">
      <header>
        <h1>Task<span>Flow</span></h1>
        <p>Plan your day. Finish what matters.</p>
      </header>

      <div className="stats">
        <div className="stat"><b>{tasks.length}</b><small>Total</small></div>
        <div className="stat"><b>{tasks.length - done}</b><small>Active</small></div>
        <div className="stat"><b>{done}</b><small>Completed</small></div>
      </div>

      <div className="card">
        <div className="progress-row"><span>Progress</span><span>{pct}%</span></div>
        <div className="bar"><div className="fill" style={{ width: pct + "%" }} /></div>

        <div className="add">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="What needs to be done?"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <button onClick={add}>Add</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="tabs">
          {FILTERS.map((f) => (
            <button key={f} className={f === filter ? "tab on" : "tab"} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <ul>
          {shown.map((t) => (
            <li key={t.id} className={t.done ? "task finished" : "task"}>
              <button className="check" onClick={() => call(`/api/tasks/${t.id}/toggle`, "PUT")}>
                {t.done ? "✓" : ""}
              </button>
              <span className="title">{t.title}</span>
              <span className={"badge " + t.priority}>{t.priority}</span>
              <button className="del" onClick={() => call(`/api/tasks/${t.id}`, "DELETE")}>✕</button>
            </li>
          ))}
          {shown.length === 0 && !error && <li className="empty">Nothing here yet. Add your first task!</li>}
        </ul>
      </div>
      <footer>React · FastAPI · SQLite · AWS EC2</footer>
    </div>
  );
}
