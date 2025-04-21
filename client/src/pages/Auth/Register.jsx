import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaQuestionCircle,
  FaUserPlus,
} from "react-icons/fa";
import "../../styles/AuthStyles.css"; // Import the shared CSS

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/register",
        {
          name,
          email,
          phone,
          address,
          password,
          answer,
        }
      );

      if (res.data.success) {
        toast.success("Registration Successful! Please login.");
        navigate("/login");
      } else {
        toast.error(res.data.message); // Show server-side error message
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <Layout title={"Register - Ecommerce App"}>
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
          <h1 className="auth-title">Register</h1>
          <p className="auth-subtitle">Create your account</p>
          <form onSubmit={handleSubmit}>
            <motion.div
              className="input-group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FaUser className="input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="Enter your name"
                required
              />
            </motion.div>
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
            <motion.div
              className="input-group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FaPhone className="input-icon" />
              <input
                type="tel" // Use type='tel' for phone numbers
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-input"
                placeholder="Enter your phone number"
                required
              />
            </motion.div>
            <motion.div
              className="input-group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="auth-input"
                placeholder="Enter your address"
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
                placeholder="Security answer (e.g., favorite pet)"
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register <FaUserPlus style={{ marginLeft: "8px" }} />
            </motion.button>
          </form>
          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Register;
