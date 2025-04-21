import React from "react";
import Layout from "./components/Layout/Layout";
import { useSearch } from "./context/Search";
import { useCart } from "./context/Cart";
import { useNavigate } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import "./styles/SearchResults.css";

const Search = () => {
  const [values] = useSearch();
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <Layout title={"Search Results - Ecommerce App"}>
      <div className="search-results-container">
        <h1 className="search-title">Search Results</h1>
        <p className="search-count">
          {values?.results.length < 1
            ? "No products found matching your search."
            : `Found ${values?.results.length} product(s)`}
        </p>

        <div className="search-results-grid">
          {values?.results?.map((item, index) => (
            <motion.div
              className="product-card-search"
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              <img
                className="product-image-search"
                src={`http://localhost:8080/api/v1/product/product-photo/${item?._id}`}
                alt={item.name}
                onClick={() => navigate(`/product/${item.slug}`)}
              />
              <div className="product-info-search">
                <h5 className="product-name-search">{item.name}</h5>
                <p className="product-description-search">
                  {item.description.substring(0, 60)}...
                </p>
                <p className="product-price-search">
                  {item.price.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>
                <div className="product-buttons-search">
                  <button
                    className="details-btn-search"
                    onClick={() => navigate(`/product/${item.slug}`)}
                  >
                    <CiSearch style={{ marginRight: "5px" }} /> View Details
                  </button>
                  <button
                    className="add-cart-btn-search"
                    onClick={() => addItem(item)}
                  >
                    <FaCartPlus style={{ marginRight: "5px" }} /> Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
