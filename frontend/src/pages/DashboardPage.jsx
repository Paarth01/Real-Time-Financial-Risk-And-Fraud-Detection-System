import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const stats = [
    {
      label: "Transactions",
      value: "12,847",
      change: "+12.5% from last month",
      icon: <Activity size={20} />,
      color: "purple",
    },
    {
      label: "Risk Score",
      value: "94.2%",
      change: "Low risk detected",
      icon: <TrendingUp size={20} />,
      color: "blue",
    },
    {
      label: "Flagged",
      value: "23",
      change: "3 require review",
      icon: <AlertTriangle size={20} />,
      color: "amber",
    },
    {
      label: "Active Users",
      value: "1,204",
      change: "+8.1% this week",
      icon: <Users size={20} />,
      color: "green",
    },
  ];

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <Shield size={18} />
            </div>
            <span>FinShield</span>
          </div>

          <div className="nav-user">
            <div className="nav-user-info">
              <div className="name">{user?.username}</div>
              <div className="role">{user?.role}</div>
            </div>
            <button
              className="btn-logout"
              onClick={handleLogout}
              id="logout-btn"
            >
              <LogOut size={14} style={{ marginRight: 4 }} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Welcome */}
        <div className="welcome-section">
          <h2>
            Welcome back, <span>{user?.username}</span>
          </h2>
          <p>Here&apos;s your financial risk overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-header">
                <span className="stat-label">{stat.label}</span>
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="card">
            <div className="profile-header">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-header-text">
                <h3>Account Details</h3>
                <p>Your profile information</p>
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-field">
                <label>Username</label>
                <p>{user?.username}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Role</label>
                <p style={{ textTransform: "capitalize" }}>{user?.role}</p>
              </div>
              <div className="profile-field">
                <label>Member Since</label>
                <p>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
