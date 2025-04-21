import React from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import { useAuth } from "../../context/Auth";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
} from "react-icons/fa";
import "../../styles/Dashboard.css";

const AdminDashboard = () => {
  const [auth] = useAuth();

  // Example stats - you can replace these with real data from your backend
  const stats = [
    { icon: <FaBox />, value: "150", label: "Total Products" },
    { icon: <FaUsers />, value: "1,234", label: "Total Users" },
    { icon: <FaShoppingCart />, value: "89", label: "Total Orders" },
    { icon: <FaDollarSign />, value: "₹45,670", label: "Total Revenue" },
  ];

  return (
    <Layout title={"Admin Dashboard"}>
      <div className="dashboard-container">
        <div className="row">
          <div className="col-md-3">
            <div className="menu-container">
              <div className="menu-header">Admin Panel</div>
              <AdminMenu />
            </div>
          </div>
          <div className="col-md-9">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <h1 className="dashboard-title">
                  Welcome, {auth?.user?.name}!
                </h1>
                <p className="dashboard-subtitle">
                  Here's what's happening in your store today
                </p>
              </div>

              <div className="stats-container">
                {stats.map((stat, index) => (
                  <div className="stat-card" key={index}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="user-info">
                <h2 className="mb-4">Admin Information</h2>
                <div className="info-item">
                  <div className="info-icon">
                    <FaUser />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Name</div>
                    <div className="info-value">{auth?.user?.name}</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Email</div>
                    <div className="info-value">{auth?.user?.email}</div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Address</div>
                    <div className="info-value">
                      {auth?.user?.address || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="action-button">
                  <FaBox /> Manage Products
                </button>
                <button className="action-button">
                  <FaUsers /> Manage Users
                </button>
                <button className="action-button">
                  <FaShoppingCart /> View Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
