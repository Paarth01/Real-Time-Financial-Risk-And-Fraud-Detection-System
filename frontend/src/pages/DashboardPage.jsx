import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  LogOut,
  MapPin,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial transactions
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/v1/transactions/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch initial transactions", err);
      }
    };
    fetchTransactions();

    // 2. Connect WebSocket for Real-Time Feed
    const token = localStorage.getItem("token");
    if (token) {
      const wsUrl = `ws://localhost:8000/api/v1/transactions/ws?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const newTx = JSON.parse(event.data);
          setTransactions((prev) => [newTx, ...prev].slice(0, 50)); // Keep latest 50
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
      };
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const suspiciousCount = transactions.filter(t => t.status === "suspicious").length;

  const stats = [
    {
      label: "Transactions",
      value: transactions.length,
      change: "Live Feed Connected",
      icon: <Activity size={20} />,
      color: "purple",
    },
    {
      label: "Risk Score",
      value: suspiciousCount > 5 ? "High Risk" : suspiciousCount > 0 ? "Medium Risk" : "Low Risk",
      change: "Based on real-time data",
      icon: <TrendingUp size={20} />,
      color: suspiciousCount > 0 ? "amber" : "blue",
    },
    {
      label: "Flagged",
      value: suspiciousCount.toString(),
      change: "Require immediate review",
      icon: <AlertTriangle size={20} />,
      color: suspiciousCount > 0 ? "error-icon" : "amber",
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

        {/* Two-Column Layout */}
        <div className="dashboard-columns">
          {/* Profile Column */}
          <div className="column-left">
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
          </div>

          {/* Feed Column */}
          <div className="column-right">
            <div className="feed-card card">
              <div className="feed-header">
                <div className="feed-title">
                  <h3>Live Transactions</h3>
                  <div className="live-indicator">
                    <span className="pulse"></span>
                    Live
                  </div>
                </div>
              </div>

              <div className="feed-list">
                {transactions.length === 0 ? (
                  <div className="empty-state">No transactions yet...</div>
                ) : (
                  transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className={`feed-item ${tx.status === "suspicious" ? "suspicious-item" : "normal-item"}`}
                    >
                      <div className="feed-item-icon">
                        <Activity size={16} />
                      </div>
                      <div className="feed-item-details">
                        <div className="feed-item-top">
                          <span className="tx-amount">
                            {tx.transaction_type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                          </span>
                          <span className={`tx-status badge-${tx.status}`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="feed-item-bottom">
                          <span className="tx-location">
                            <MapPin size={12} /> {tx.location || "Unknown"}
                          </span>
                          <span className="tx-time">
                            <Clock size={12} /> {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
