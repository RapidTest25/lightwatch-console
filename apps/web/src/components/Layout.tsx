import { NavLink, Outlet } from "react-router-dom";
import "../styles/layout.css";

const NAV_ITEMS = [
  { to: "/", label: "Services" },
  { to: "/logs", label: "Logs" },
  { to: "/metrics", label: "Metrics" },
  { to: "/security", label: "Security" },
  { to: "/alerts", label: "Alerts" },
] as const;

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__logo">Lightwatch</div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
