import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/Auth";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/Cart";
import { FaTrash, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../styles/CartPage.css";

const stripePromise = loadStripe(
  "pk_test_51RFqPdJ8Iu3wp7tOl9XO3lgpgTzFoAxwQbqxyAjtufkv2Uvv23giA1YhkpkTUN9RRhYbsoG32mG7L5mg5BTblOhH00flzLswxl"
);

const CheckoutForm = ({ totalAmount, cart, setCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      toast.error("Stripe is not initialized");
      return;
    }

    try {
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
            name: cardholderName,
          },
        });

      if (paymentMethodError) {
        toast.error(paymentMethodError.message);
        return;
      }

      const { id } = paymentMethod;
      const amount = Math.round(totalAmount * 100);

      const { data } = await axios.post(
        "http://localhost:8080/api/v1/payment/create-payment-intent",
        {
          paymentMethodId: id,
          amount: amount,
          cart: cart,
        }
      );

      if (data.success) {
        localStorage.removeItem("cart");
        setCart([]);
        toast.success("Payment Successful");
        navigate("/dashboard/user/orders");
      } else if (data.requires_action) {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(data.payment_intent_client_secret);

        if (confirmError) {
          toast.error(confirmError.message || "Payment authentication failed");
        } else {
          localStorage.removeItem("cart");
          setCart([]);
          toast.success("Payment Successful");
          navigate("/dashboard/user/orders");
        }
      } else {
        toast.error(data.message || "Payment failed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div className="form-group">
          <label>Card Information</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>

        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Full name on card"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="checkout-button"
        >
          {loading
            ? "Processing..."
            : `Pay ${totalAmount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}`}
        </button>
      </form>
    </div>
  );
};

const CartPage = () => {
  const [auth] = useAuth();
  const { cart, removeItem } = useCart();
  const navigate = useNavigate();

  // Calculate total price
  const calculateTotal = () => {
    try {
      let total = 0;
      cart?.forEach((item) => {
        total = total + item.price;
      });
      return total;
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  // Remove item from cart
  const handleRemoveItem = (pid) => {
    removeItem(pid);
  };

  return (
    <Layout title={"Cart - Ecommerce App"}>
      <div className="cart-container">
        <div className="cart-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="cart-title">Your Shopping Cart</h1>
        </div>

        <AnimatePresence>
          {cart?.length > 0 ? (
            <motion.div
              className="cart-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="cart-items">
                {cart?.map((p) => (
                  <motion.div
                    key={p._id}
                    className="cart-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="item-content">
                      <div className="item-image">
                        <img
                          src={`http://localhost:8080/api/v1/product/product-photo/${p._id}`}
                          alt={p.name}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <div className="item-details">
                        <h3 className="item-name">{p.name}</h3>
                        <p className="item-description">{p.description}</p>
                        <div className="item-price">
                          {p.price.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </div>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveItem(p._id)}
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="summary-item">
                  <span>Subtotal</span>
                  <span>
                    {calculateTotal().toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-item total">
                  <span>Total</span>
                  <span>
                    {calculateTotal().toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </span>
                </div>

                {auth?.user?.address ? (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm totalAmount={calculateTotal()} cart={cart} />
                  </Elements>
                ) : (
                  <div className="address-warning">
                    <p>Please add your address to proceed with checkout</p>
                    <button
                      className="update-address-button"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="empty-cart"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="empty-cart-icon">
                <FaShoppingBag />
              </div>
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <button
                className="continue-shopping"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CartPage;
