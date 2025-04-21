import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaOpencart,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaHome,
  FaList,
  FaShoppingCart,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/Auth.jsx";
import toast from "react-hot-toast";
import SearchInput from "../Form/SearchInput.jsx";
import useCategory from "../../hooks/useCategory.js";
import { useCart } from "../../context/Cart.jsx";
import { Badge } from "antd";
import "../../styles/Header.css";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const categories = useCategory();
  const { cart, clearCartLocally } = useCart();

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    clearCartLocally();
    toast.success("Logout Successfully");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-gradient">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <FaOpencart className="brand-icon" />
            <span className="brand-text">E-commerce</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo01"
            aria-controls="navbarTogglerDemo01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <SearchInput />
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  <FaHome className="nav-icon" />
                  <span>Home</span>
                </NavLink>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  to={"/categories"}
                  data-bs-toggle="dropdown"
                >
                  <FaList style={{ marginRight: "5px" }} /> Categories
                </Link>
                <ul className="dropdown-menu dropdown-menu-scrollable">
                  {categories?.map((item) => (
                    <Link
                      key={item?._id}
                      className="dropdown-item"
                      to={`/category/${item.slug}`}
                    >
                      <li key={item?._id}>{item?.name}</li>
                    </Link>
                  ))}
                </ul>
              </li>

              {!auth.user ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/register">
                      <FaUserPlus className="nav-icon" />
                      <span>Register</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login">
                      <FaSignInAlt className="nav-icon" />
                      <span>Login</span>
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item dropdown">
                    <NavLink
                      className="nav-link dropdown-toggle d-flex align-items-center"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaUser style={{ marginRight: "5px" }} /> {auth.user.name}
                    </NavLink>
                    <ul className="dropdown-menu">
                      <li>
                        <NavLink
                          to={`/dashboard/${
                            auth?.user?.role === 1 ? "admin" : "user"
                          }`}
                          className="dropdown-item"
                        >
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          onClick={handleLogout}
                          to="/login"
                          className="dropdown-item"
                        >
                          <FaSignOutAlt style={{ marginRight: "5px" }} /> Logout
                        </NavLink>
                      </li>
                      {auth?.user?.role !== 1 && (
                        <li className="nav-item">
                          <NavLink
                            className="dropdown-item"
                            to={"/become-seller"}
                          >
                            <FaOpencart className="nav-icon" />
                            Become a Seller
                          </NavLink>
                        </li>
                      )}
                    </ul>
                  </li>
                </>
              )}

              <li className="nav-item">
                <Badge count={cart?.length} showZero offset={[10, -5]}>
                  <NavLink
                    to="/cart"
                    className="nav-link d-flex align-items-center"
                  >
                    <FaShoppingCart style={{ marginRight: "5px" }} /> Cart
                  </NavLink>
                </Badge>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
