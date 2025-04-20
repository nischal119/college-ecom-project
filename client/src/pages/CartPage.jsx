import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/Cart";
import { useAuth } from "../context/Auth";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { Spin } from "antd";

const stripePromise = loadStripe(
  "pk_test_51RFqPdJ8Iu3wp7tOl9XO3lgpgTzFoAxwQbqxyAjtufkv2Uvv23giA1YhkpkTUN9RRhYbsoG32mG7L5mg5BTblOhH00flzLswxl"
);

const CartPage = () => {
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const navigate = useNavigate();

  const calculateProductTotal = (productId) => {
    const productItems = cart.filter((product) => product._id === productId);
    const quantity = productItems.length;
    const totalPrice = productItems.reduce((sum, item) => sum + item.price, 0);
    return { quantity, totalPrice };
  };

  // Get total price as number
  const getTotalPrice = () => {
    try {
      let total = 0;
      cart.forEach((item) => {
        const { totalPrice } = calculateProductTotal(item._id);
        total += totalPrice;
      });
      return total;
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };

  const getProductQuantity = (productId) => {
    return cart.filter((product) => product._id === productId).length;
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    margin: "0 auto",
  };

  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [cardholderName, setCardholderName] = useState("");

    const handleSubmit = async (event) => {
      event.preventDefault();
      console.log("Starting payment submission...");
      setLoading(true);

      if (!stripe || !elements) {
        console.error("Stripe not initialized:", {
          stripe: !!stripe,
          elements: !!elements,
        });
        setLoading(false);
        toast.error("Stripe is not initialized");
        return;
      }

      try {
        console.log("Creating payment method...");
        // Create payment method
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
          console.error("Payment method creation failed:", {
            type: paymentMethodError.type,
            message: paymentMethodError.message,
            code: paymentMethodError.code,
          });
          toast.error(paymentMethodError.message);
          return;
        }

        console.log("Payment method created successfully:", {
          id: paymentMethod.id,
          type: paymentMethod.type,
        });

        const { id } = paymentMethod;
        const amount = Math.round(getTotalPrice() * 100); // Convert to paise

        // Make sure amount is a valid integer
        if (!Number.isInteger(amount) || amount <= 0) {
          console.error("Invalid amount:", {
            amount,
            originalPrice: getTotalPrice(),
          });
          toast.error("Invalid amount");
          return;
        }

        console.log("Sending payment request to server...", {
          paymentMethodId: id,
          amount,
          cartItems: cart.length,
        });

        // Process payment
        const { data } = await axios
          .post("http://localhost:8080/api/v1/payment/create-payment-intent", {
            paymentMethodId: id,
            amount: amount,
            cart: cart,
          })
          .catch((error) => {
            console.error("Axios request failed:", {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              error: error.message,
            });
            throw error;
          });

        console.log("Received response from server:", data);

        if (data.success) {
          // Payment successful
          console.log("Payment successful, clearing cart...");
          localStorage.removeItem("cart");
          setCart([]);
          toast.success("Payment Successful");
          navigate("/dashboard/user/orders");
        } else if (data.requires_action) {
          console.log("Payment requires additional authentication...");
          // Handle 3D Secure authentication
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(data.payment_intent_client_secret);

          if (confirmError) {
            console.error("Payment confirmation failed:", {
              type: confirmError.type,
              message: confirmError.message,
              code: confirmError.code,
            });
            toast.error(
              confirmError.message || "Payment authentication failed"
            );
          } else {
            console.log("Payment confirmed successfully:", {
              id: paymentIntent.id,
              status: paymentIntent.status,
            });
            localStorage.removeItem("cart");
            setCart([]);
            toast.success("Payment Successful");
            navigate("/dashboard/user/orders");
          }
        } else {
          // Payment failed
          console.error("Payment failed:", {
            message: data.message,
            details: data.details,
            errorType: data.error_type,
            declineCode: data.decline_code,
          });
          toast.error(data.message || "Payment failed");
        }
      } catch (error) {
        console.error("Payment processing error:", {
          name: error.name,
          message: error.message,
          response: {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          },
          request: error.request
            ? "Request made but no response"
            : "Request setup failed",
        });

        // Log the full error object for debugging
        console.error("Full error object:", error);

        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message || "Payment failed");
        }
      } finally {
        setLoading(false);
      }
    };

    const formStyle = {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      padding: "20px",
      maxWidth: "500px",
      margin: "0 auto",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    };

    const inputStyle = {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "16px",
    };

    const buttonStyle = {
      width: "100%",
      padding: "12px",
      backgroundColor: "#4169E1",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
    };

    return (
      <div>
        <h3 style={{ marginBottom: "20px" }}>Pay with card</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label>Card information</label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                    padding: "10px",
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>

          <div>
            <label htmlFor="cardholderName">Cardholder name</label>
            <input
              id="cardholderName"
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Full name on card"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            style={buttonStyle}
          >
            {loading ? <Spin /> : "Pay"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#6b7c93",
              fontSize: "14px",
            }}
          >
            <p>Powered by stripe</p>
            <p>
              <span style={{ marginRight: "10px" }}>Terms</span>
              <span>Privacy</span>
            </p>
          </div>
        </form>
      </div>
    );
  };

  return (
    <Layout title="Cart - Ecommerce App">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {`Hello ${auth?.token && auth?.user?.name}`}
            </h1>
            <h4 className="text-center">
              {cart?.length
                ? `You have ${cart.length} items in your cart ${
                    auth?.token ? "" : "please login to checkout"
                  }`
                : "Your Cart is Empty"}
            </h4>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex flex-wrap flex-column">
              {Object.values(
                cart.reduce((acc, item) => {
                  if (!acc[item._id]) {
                    acc[item._id] = { ...item, count: 1 };
                  } else {
                    acc[item._id].count += 1;
                  }
                  return acc;
                }, {})
              ).map((groupedItem) => (
                <div
                  className="row m-3 p-3 d-flex justify-content-center align-items-center"
                  key={groupedItem._id}
                >
                  <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img
                      style={{
                        width: "100%",
                      }}
                      src={`http://localhost:8080/api/v1/product/product-photo/${groupedItem?._id}`}
                      alt="Card image cap"
                    />
                  </div>
                  <div className="col-md-8 text-center">
                    <h5 className="card-title">{groupedItem?.name}</h5>
                    <p className="card-text">Rs.{groupedItem?.price}</p>
                    <button
                      className="btn btn-danger w-50"
                      onClick={() => {
                        const newCart = cart.filter(
                          (product) => product._id !== groupedItem._id
                        );
                        setCart(newCart);
                        localStorage.setItem("cart", JSON.stringify(newCart));
                      }}
                    >
                      Remove from Cart ({groupedItem.count})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-4 text-center">
            <h2>Cart Summary</h2>
            <p>Total | Checkout | Payment</p>
            <hr />
            <h4>Total : {formatPrice(getTotalPrice())}</h4>
            {auth?.user?.address ? (
              <>
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
                <Elements stripe={stripePromise}>
                  <CheckoutForm />
                </Elements>
              </>
            ) : (
              <div className="mb-3">
                {auth?.token ? (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() =>
                      navigate("/login", {
                        state: "/cart",
                      })
                    }
                  >
                    Please Login to checkout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
