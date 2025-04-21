import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/Routes/UserMenu";
import { useAuth } from "../../context/Auth";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import "../../styles/Dashboard.css";

const Profile = () => {
  const [auth, setAuth] = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (auth?.user) {
      const { name, email, phone, address } = auth.user;
      setName(name || "");
      setEmail(email || "");
      setPhone(phone || "");
      setAddress(address || "");
    }
  }, [auth?.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "http://localhost:8080/api/v1/auth/update-profile",
        {
          name,
          email,
          password,
          phone,
          address,
        },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setAuth({ ...auth, user: data?.updatedUser });
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setPassword("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Your Profile"}>
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
                <div className="d-flex justify-content-between align-items-center">
                  <h1 className="dashboard-title">Profile Settings</h1>
                  <button
                    className="action-button"
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ width: "auto" }}
                  >
                    <FaEdit /> {isEditing ? "Cancel Edit" : "Edit Profile"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="user-info mt-4">
                <div className="info-item">
                  <div className="info-icon">
                    <FaUser />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Full Name</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="info-value">{name}</div>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Email Address</div>
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="info-value">{email}</div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="info-item">
                    <div className="info-icon">
                      <FaUser />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Password</div>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (leave empty to keep current)"
                      />
                    </div>
                  </div>
                )}

                <div className="info-item">
                  <div className="info-icon">
                    <FaPhone />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Phone Number</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="info-value">
                        {phone || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="info-content">
                    <div className="info-label">Address</div>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                        rows="3"
                      />
                    ) : (
                      <div className="info-value">
                        {address || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="action-buttons">
                    <button type="submit" className="action-button">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
