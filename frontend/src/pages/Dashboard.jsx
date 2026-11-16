
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/");
        setStats(response.data);
      } catch {
        setError("Unable to load dashboard information.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      label: "Total Tasks",
      value: stats.total_tasks,
      icon: ListTodo,
      color: "blue",
    },
    {
      label: "Pending",
      value: stats.pending_tasks,
      icon: Clock3,
      color: "orange",
    },
    {
      label: "In Progress",
      value: stats.in_progress_tasks,
      icon: AlertTriangle,
      color: "purple",
    },
    {
      label: "Completed",
      value: stats.completed_tasks,
      icon: CheckCircle2,
      color: "green",
    },
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Here's an overview of your tasks and progress.</p>
        </div>

        <Link to="/tasks" className="primary-button">
          View tasks <ArrowRight size={18} />
        </Link>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="stat-card" key={card.label}>
                  <div className={`stat-icon ${card.color}`}>
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="stat-label">{card.label}</p>
                    <h2>{card.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-bottom">
            <div className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Overdue tasks</h2>
                  <p>Tasks that need your attention</p>
                </div>
                <AlertTriangle size={21} />
              </div>

              <div className="overdue-count">
                <strong>{stats.overdue_tasks}</strong>
                <span>
                  {stats.overdue_tasks === 1
                    ? "overdue task"
                    : "overdue tasks"}
                </span>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Keep moving forward</h2>
                  <p>Stay organized and make progress every day.</p>
                </div>
                <CheckCircle2 size={21} />
              </div>

              <Link to="/tasks" className="text-link">
                Manage your tasks <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
