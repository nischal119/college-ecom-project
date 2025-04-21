import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaCartPlus, FaShippingFast } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdCategory } from "react-icons/md";
import "../styles/ProductDetails.css";
import { useCart } from "../context/Cart";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [role, setRole] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parseData = JSON.parse(data);
      setRole(parseData.user.role);
    }
  }, []);

  const getProducts = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/single-product/${params.slug}`
      );
      setProduct(data?.product);
      getRelatedProducts(data.product._id, data.product.category._id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.slug) getProducts();
  }, [params.slug]);

  const getRelatedProducts = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/similar-products/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = (productToAdd) => {
    addItem(productToAdd);
  };

  return (
    <Layout title={"Product Details"}>
      <div className="container">
        <div className="product-details">
          <div className="row">
            <div className="col-md-6">
              <div className="product-image-container">
                <img
                  className="product-image"
                  src={`http://localhost:8080/api/v1/product/product-photo/${product?._id}`}
                  alt={product?.name}
                />
              </div>
            </div>
            <div className="col-md-6 product-details-info">
              <h1 className="product-title">{product?.name}</h1>
              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="d-flex align-items-center gap-2">
                    <MdCategory /> {product?.category?.name}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Availability:</span>
                  <span
                    className={`badge ${
                      product?.quantity > 0 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {product?.quantity > 0
                      ? `In Stock (${product.quantity})`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Shipping:</span>
                  <span className="d-flex align-items-center gap-2">
                    <FaShippingFast />{" "}
                    {product?.shipping ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>

              <p className="product-description">{product?.description}</p>

              <div className="price">
                {product?.price?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </div>

              {role === 0 && product?.quantity > 0 && (
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart <FaCartPlus className="cart-icon" />
                </button>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="similar-products">
            <h2 className="section-title">Similar Products</h2>
            <div className="row">
              {relatedProducts?.map((item) => (
                <div className="col-md-4 col-lg-3 mb-4" key={item._id}>
                  <div className="similar-product-card">
                    <img
                      className="similar-product-image"
                      src={`http://localhost:8080/api/v1/product/product-photo/${item?._id}`}
                      alt={item?.name}
                    />
                    <div className="similar-product-info">
                      <h3 className="similar-product-title">{item?.name}</h3>
                      <p className="similar-product-description">
                        {item?.description.substring(0, 60)}...
                      </p>
                      <p className="similar-product-price">
                        {item?.price?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/product/${item?.slug}`)}
                        >
                          <CiSearch />
                        </button>
                        {role === 0 && item?.quantity > 0 && (
                          <button
                            className="add-btn"
                            onClick={() => handleAddToCart(item)}
                          >
                            <FaCartPlus />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;
