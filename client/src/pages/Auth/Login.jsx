import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/Auth.jsx";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import "../../styles/AuthStyles.css"; // Import the shared CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/v1/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        setAuth({
          ...auth,
          user: res?.data?.user,
          token: res?.data?.token,
        });
        localStorage.setItem("auth", JSON.stringify(res?.data));
        toast.success(`Welcome back, ${res?.data?.user?.name}!`);
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message); // Show server-side error message
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <Layout title={"Login - Ecommerce App"}>
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="auth-form-wrapper"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Access your account</p>
          <form onSubmit={handleSubmit}>
            <motion.div
              className="input-group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="Enter your email"
                required
              />
            </motion.div>
            <motion.div
              className="input-group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FaLock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Enter your password"
                required
              />
            </motion.div>

            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login <FaSignInAlt style={{ marginLeft: "8px" }} />
            </motion.button>
          </form>
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Login;
