
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Folder,
  LockKeyhole,
  LogOut,
  Menu,
  X,
  CheckSquare,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tasks",
    path: "/tasks",
    icon: ListTodo,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: Folder,
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fullName =
    user?.full_name ||
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <CheckSquare size={23} />
          </div>

          <div className="brand-text">
            <h2>TaskFlow</h2>
            <span>Personal workspace</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">
            WORKSPACE
          </span>

          <nav className="sidebar-navigation">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeSidebar}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  <ChevronRight
                    size={16}
                    className="sidebar-link-arrow"
                  />
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-section sidebar-account">
          <span className="sidebar-section-label">
            ACCOUNT
          </span>

          <NavLink
            to="/change-password"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <LockKeyhole size={19} />
            <span>Change Password</span>
            <ChevronRight
              size={16}
              className="sidebar-link-arrow"
            />
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {initials || <UserCircle size={22} />}
            </div>

            <div className="sidebar-user-info">
              <strong>{fullName}</strong>
              <span>{user?.email || "Account"}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="topbar-title">
              <span>MY WORKSPACE</span>
              <h2>Task Manager</h2>
            </div>
          </div>

          <div className="topbar-user">
            <div className="topbar-user-info">
              <strong>{fullName}</strong>
              <span>Personal account</span>
            </div>

            <div className="topbar-avatar">
              {initials || <UserCircle size={22} />}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>TaskFlow</span>
          <span>Stay organized. Get things done.</span>
        </footer>
      </div>
    </div>
  );
}
