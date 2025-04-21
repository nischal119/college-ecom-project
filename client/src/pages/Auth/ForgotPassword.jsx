import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaQuestionCircle,
  FaSyncAlt,
} from "react-icons/fa";
import "../../styles/AuthStyles.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/forgot-password",
        {
          email,
          newPassword,
          answer,
        }
      );

      if (res.data.success) {
        toast.success("Password Reset Successfully");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <Layout title={"Forgot Password - Ecommerce App"}>
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter details to reset your password</p>
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
              <FaQuestionCircle className="input-icon" />
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="auth-input"
                placeholder="Enter your security answer"
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
                placeholder="Enter your new password"
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset Password <FaSyncAlt style={{ marginLeft: "8px" }} />
            </motion.button>
          </form>
          <p className="auth-switch">
            Remembered your password?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ForgotPassword;
