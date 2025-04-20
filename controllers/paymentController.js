import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendOrderConfirmationEmail } from "../helpers/authHelper.js";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripePaymentController = async (req, res) => {
  try {
    console.log("=== STARTING STRIPE PAYMENT PROCESS ===");
    console.log(
      "Request received with body:",
      JSON.stringify(req.body, null, 2)
    );

    const { paymentMethodId, amount, cart } = req.body;

    if (!paymentMethodId || !amount || !cart) {
      console.error("Missing required fields:", {
        paymentMethodId,
        amount,
        cart,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    // Validate amount is a positive integer
    if (!Number.isInteger(amount) || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    console.log("Creating payment intent with Stripe...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      payment_method: paymentMethodId,
      confirm: true,
      return_url: "http://localhost:5173/cart",
    });

    console.log("Payment intent created:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });

    if (paymentIntent.status === "succeeded") {
      console.log("Creating new order in database...");

      // Ensure cart is an array and extract product IDs
      const cartArray = Array.isArray(cart) ? cart : JSON.parse(cart);
      console.log("Cart array:", JSON.stringify(cartArray, null, 2));

      // Format products for order and email
      const formattedProducts = cartArray.map((product) => ({
        _id: new mongoose.Types.ObjectId(product._id),
        name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
      }));

      const productIds = formattedProducts.map((product) => product._id);

      console.log(
        "Formatted products:",
        JSON.stringify(formattedProducts, null, 2)
      );
      console.log(
        "Product IDs for order:",
        JSON.stringify(productIds, null, 2)
      );

      const order = await new orderModel({
        products: productIds,
        payment: {
          success: true,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back to rupees
          status: paymentIntent.status,
        },
        buyer: req.user._id,
      }).save();

      console.log("=== ORDER CREATION DEBUG ===");
      console.log("Created order:", JSON.stringify(order, null, 2));
      console.log("Order products:", JSON.stringify(order.products, null, 2));
      console.log("Order payment:", JSON.stringify(order.payment, null, 2));
      console.log("Order buyer:", order.buyer);

      // Fetch full user details
      const user = await userModel.findById(req.user._id).select("name email");
      if (!user) {
        console.error("User not found:", req.user._id);
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      console.log("=== USER DETAILS DEBUG ===");
      console.log("User details:", JSON.stringify(user, null, 2));

      // Send order confirmation email
      try {
        console.log("\n=== STARTING EMAIL SEND PROCESS ===");
        // Create a temporary order object with formatted products for email
        const emailOrder = {
          ...order.toObject(),
          products: formattedProducts,
        };
        const emailSent = await sendOrderConfirmationEmail(user, emailOrder);
        console.log(
          "Order confirmation email status:",
          emailSent ? "Sent" : "Failed to send"
        );
        console.log("=== END EMAIL SEND PROCESS ===\n");
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
      }

      console.log("=== PAYMENT PROCESS COMPLETED SUCCESSFULLY ===");
      return res.json({
        success: true,
        message: "Payment successful",
        order: order,
      });
    } else {
      console.error("Payment failed:", paymentIntent.status);
      return res.status(400).json({
        success: false,
        message: "Payment failed",
        error: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error("Error in Stripe payment process:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
    });
  }
};
