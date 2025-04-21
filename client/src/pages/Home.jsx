import { Carousel, Checkbox, Radio, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { Prices } from "../components/Prices.js";
import { useCart } from "../context/Cart.jsx";
import MyCarousel from "../components/MyCarousel.jsx";
import Skeleton from "../components/Skeleton.jsx";

// Add animation styles
const styles = {
  productCard: {
    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
    opacity: 1,
    transform: "translateY(0)",
  },
  productCardHidden: {
    opacity: 0,
    transform: "scale(0.95)",
    position: "absolute",
    pointerEvents: "none",
  },
  productCardVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cart, addItem } = useCart();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [priceRange, setPriceRange] = useState(1000000);
  const [debouncedPrice, setDebouncedPrice] = useState(1000000);
  const [currentProducts, setCurrentProducts] = useState([]);

  const getProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/products-list/${page}`
      );
      setLoading(false);
      setProducts(data?.products);
      setCurrentProducts(data?.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const getAllCategories = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8080/api/v1/category/get-category"
      );

      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading categories");
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleCategoryFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((item) => item !== id);
    }
    setChecked(all);
  };

  const handlePriceChange = (e) => {
    setPriceRange(parseInt(e.target.value));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
    }, 300);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const applyFilters = useCallback(async () => {
    try {
      setIsFiltering(true);
      const { data } = await axios.post(
        "http://localhost:8080/api/v1/product/products-filter",
        {
          checked,
          radio: [0, debouncedPrice],
        }
      );
      setCurrentProducts(data?.products || []);
      setIsFiltering(false);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      setIsFiltering(false);
    }
  }, [checked, debouncedPrice]);

  useEffect(() => {
    if (checked.length > 0 || debouncedPrice !== 1000000) {
      applyFilters();
    } else {
      setCurrentProducts(products);
    }
  }, [checked, debouncedPrice, products, applyFilters]);

  const getTotalCount = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/products-count`
      );
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    getTotalCount();
  }, []);

  const clearFilters = () => {
    setChecked([]);
    setRadio([]);
    setPriceRange(1000000);
    setDebouncedPrice(1000000);
    getProducts();
  };

  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:8080/api/v1/product/products-list/${page}`
      );
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  //carousel Images

  const images = [
    "../../public/Images/banner6.jpg",
    "../../public/Images/banner1.jpg",
    "../../public/Images/banner2.jpg",
    "../../public/Images/banner3.jpg",

    "../../public/Images/banner5.jpg",
  ];
  return (
    <Layout title={"All products - Best offers"}>
      <div className="row">
        <div className="col-md-12">
          <h1 className="text-center mt-3">Hot Offers Just For You</h1>
          <MyCarousel images={images} />
        </div>
      </div>
      <div className="row mt-3 px-1">
        <div className="col-md-3">
          <h4 className="text-center">Filter by category</h4>
          <hr />
          <div className="d-flex flex-column px-3">
            {categories?.map((item) => (
              <Checkbox
                key={item._id}
                checked={checked.includes(item._id)}
                onChange={(e) =>
                  handleCategoryFilter(e.target.checked, item._id)
                }
              >
                {item.name}
              </Checkbox>
            ))}
          </div>
          <div className="">
            <h4 className="text-center mt-4">Filter by Price</h4>
            <hr />
            <div className="d-flex flex-column px-3">
              <div className="mb-3">
                <label className="form-label">
                  Price Range: Rs.0 - Rs.{priceRange}
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={priceRange}
                  onChange={handlePriceChange}
                />
                <div className="d-flex justify-content-between">
                  <span>Rs.0</span>
                  <span>Rs.{priceRange}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="btn btn-danger mt-4 mx-3" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        <div className="col-md-9">
          {currentProducts?.length > 0 && (
            <h1 className="text-center">All Products</h1>
          )}
          <div className="d-flex justify-content-center align-items-center flex-column">
            <div className="d-flex flex-wrap justify-content-center align-items-center position-relative">
              {loading && <Skeleton />}

              {currentProducts?.length > 0
                ? currentProducts?.map((item) => (
                    <div
                      className="card m-3 p-3"
                      key={item._id}
                      style={{
                        ...styles.productCard,
                        ...styles.productCardVisible,
                      }}
                    >
                      <div className="card product-card">
                        <img
                          className="card-img-top hover-effect"
                          src={`http://localhost:8080/api/v1/product/product-photo/${item?._id}`}
                          alt="Card image cap"
                          style={{
                            maxHeight: "300px",
                            minHeight: "300px",
                            padding: "10px",
                            maxWidth: "100%",
                            minWidth: "250px",
                            objectFit: "contain",
                          }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">
                            {item?.name.substring(0, 20)}...
                          </h5>
                          <p className="card-text">
                            {item?.description.substring(0, 50)}...
                          </p>
                          <h5 className="card-text">Rs.{item?.price}</h5>
                          <button
                            className="btn btn-success w-100 mb-3"
                            onClick={() => navigate(`/product/${item?.slug}`)}
                          >
                            <CiSearch />
                          </button>
                          <button
                            className="add-to-cart-btn w-100"
                            onClick={() => addItem(item)}
                          >
                            <FaCartPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                : !loading && (
                    <div className="text-center">
                      <h1>No products found in the filter window</h1>
                      <h3>Try a different filter</h3>
                    </div>
                  )}
            </div>
            <div className="m-2 p-3 ">
              {products && products.length < total && products?.length > 0 && (
                <button
                  className="btn btn-primary w-100 mb-3"
                  onClick={(e) => {
                    e.preventDefault();
                    // setLoading(true);
                    setPage(page + 1);
                  }}
                >
                  {loading ? <Spin /> : "Load More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
