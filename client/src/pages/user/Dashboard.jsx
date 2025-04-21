import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/Routes/UserMenu";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import {
  FaShoppingBag,
  FaWallet,
  FaHeart,
  FaEye,
  FaStar,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";
import moment from "moment";

const Dashboard = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    recentViews: 0,
    favoriteCategory: "",
  });
  const navigate = useNavigate();

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8080/api/v1/auth/orders",
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );
        setOrders(data.orders);
        calculateStats(data.orders);
      } catch (error) {
        console.log(error);
      }
    };

    if (auth?.token) fetchOrders();
  }, [auth?.token]);

  const calculateStats = (orders) => {
    let totalSpent = 0;
    let totalOrders = 0;
    let categoryCount = {};

    orders.forEach((order) => {
      if (order.payment?.success) {
        totalOrders++;
        order.products.forEach((product) => {
          totalSpent += product.price;
          if (product.category?.name) {
            categoryCount[product.category.name] =
              (categoryCount[product.category.name] || 0) + 1;
          }
        });
      }
    });

    // Find favorite category
    let favoriteCategory = "";
    let maxCount = 0;
    for (const [category, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    }

    setStats((prev) => ({
      ...prev,
      totalOrders,
      totalSpent,
      favoriteCategory: favoriteCategory || "Not enough data",
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <FaCheckCircle className="text-success" />;
      case "Processing":
        return <FaClock className="text-warning" />;
      case "Shipped":
        return <FaTruck className="text-info" />;
      case "Cancelled":
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-warning" />;
    }
  };

  const statsData = [
    {
      icon: <FaShoppingBag />,
      value: stats.totalOrders,
      label: "Total Orders",
    },
    {
      icon: <FaWallet />,
      value: `Rs. ${stats.totalSpent.toFixed(2)}`,
      label: "Total Spent",
    },
    { icon: <FaHeart />, value: stats.wishlistCount, label: "Wishlist Items" },
    { icon: <FaEye />, value: stats.recentViews, label: "Recently Viewed" },
  ];

  const userInfo = [
    { icon: <FaUser />, label: "Name", value: auth?.user?.name },
    { icon: <FaEnvelope />, label: "Email", value: auth?.user?.email },
    { icon: <FaPhone />, label: "Phone", value: auth?.user?.phone },
    { icon: <FaMapMarkerAlt />, label: "Address", value: auth?.user?.address },
    {
      icon: <FaStar />,
      label: "Favorite Category",
      value: stats.favoriteCategory,
    },
  ];

  return (
    <Layout title="Dashboard - Ecommerce App">
      <div className="dashboard-container">
        <div className="row">
          <div className="col-md-3">
            <div className="menu-container">
              <div className="menu-header">User Panel</div>
              <UserMenu />
            </div>
          </div>
          <div className="col-md-9">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <h2 className="dashboard-title">
                  Welcome, {auth?.user?.name}!
                </h2>
                <p className="dashboard-subtitle">
                  Here's an overview of your activity
                </p>
              </div>

              <div className="stats-container">
                {statsData.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="user-info">
                <h3 className="mb-4">Personal Information</h3>
                {userInfo.map((info, index) => (
                  <div key={index} className="info-item">
                    <div className="info-icon">{info.icon}</div>
                    <div className="info-content">
                      <div className="info-label">{info.label}</div>
                      <div className="info-value">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="recent-orders mt-4">
                <h3 className="mb-4">Recent Orders</h3>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="order-row">
                          <td>{order._id.slice(-6)}</td>
                          <td>
                            {moment(order.createdAt).format("MMM Do YYYY")}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {getStatusIcon(order.status)}
                              <span className="ms-2">{order.status}</span>
                            </div>
                          </td>
                          <td>
                            Rs.{" "}
                            {order.products
                              .reduce(
                                (total, product) => total + product.price,
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td>
                            {order.payment?.success ? (
                              <span className="text-success">Success</span>
                            ) : (
                              <span className="text-danger">Failed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length > 5 && (
                  <div className="text-center mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/dashboard/user/orders")}
                    >
                      View All Orders
                    </button>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  className="action-button"
                  onClick={() => navigate("/dashboard/user/profile")}
                >
                  <FaUser /> Edit Profile
                </button>
                <button
                  className="action-button"
                  onClick={() => navigate("/dashboard/user/orders")}
                >
                  <FaShoppingBag /> View Orders
                </button>
                <button
                  className="action-button"
                  onClick={() => navigate("/dashboard/user/wishlist")}
                >
                  <FaHeart /> Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
