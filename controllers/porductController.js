import fs from "fs";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import dotenv from "dotenv";
//payment gateway

dotenv.config();
import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendOrderConfirmationEmail } from "../helpers/authHelper.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log(process.env.BRAINTREE_PUBLIC_ID);
export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, quantity, price } = req.fields;
    // console.log(req.fields);
    const { photo } = req.files;
    if (!name || !description || !quantity || !price || !photo) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }
    if (photo && photo.size > 2000000) {
      return res.status(400).send({
        message: "Image size should be less than 2MB",
        success: false,
      });
    }
    const products = new productModel({ ...req.fields, slug: slugify(name) });

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();
    res.status(201).send({
      message: "Product created successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error while creating product",
      success: false,
      error,
    });
  }
};

//get products

export const getProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .limit(10)
      .sort({ createdAt: -1 });
    res.status(200).send({
      message: "All products",
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: " Error while getting product",
      success: false,
      error,
    });
  }
};

//delete product
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findByIdAndDelete(id);
    res.status(200).send({
      message: "Product deleted successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while deleting product",
      success: false,
      error,
    });
  }
};

//update product
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, quantity, price } = req.fields;
    const { photo } = req.files;
    if (!name || !description || !quantity || !price) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }
    if (photo && photo.size > 2000000) {
      return res.status(400).send({
        message: "Image size should be less than 2MB",
        success: false,
      });
    }
    const product = await productModel.findByIdAndUpdate(
      id,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(200).send({
      message: "Product updated successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while updating product",
      success: false,
      error,
    });
  }
};

//get single product
export const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productModel
      .findOne({ slug })
      .select("-photo")
      .populate("category");
    if (!product) {
      return res.status(400).send({
        message: "Product not found",
        success: false,
      });
    }
    res.status(200).send({
      message: "Single product fetched",
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting single product",
      success: false,
      error,
    });
  }
};

//get photo
export const productPhotoController = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findById(pid).select("photo");
    if (!product) {
      return res.status(400).send({
        message: "Product not found",
        success: false,
      });
    }
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting photo",
      success: false,
      error,
    });
  }
};

//filter products
export const productsFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) {
      args.category = checked;
    }
    if (radio.length) {
      args.price = {
        $gte: radio[0],
        $lte: radio[1],
      };
    }
    const products = await productModel.find(args);
    // console.log(products);
    res.status(200).send({
      message: "Filtered products",
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while filtering products",
      success: false,
      error,
    });
  }
};

//product count

export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      message: "Product count",
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting product count",
      success: false,
      error,
    });
  }
};

//product per page

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page || 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      message: "Products per page",
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting product per page",
      success: false,
      error,
    });
  }
};

//search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while searching product",
      success: false,
      error,
    });
  }
};

//similar products
export const getSimilarProductsController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({ _id: { $ne: pid }, category: cid })
      .limit(3)
      .select("-photo")
      .populate("category");
    res.status(200).send({
      message: "Similar products",
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting similar products",
      success: false,
      error,
    });
  }
};

//category wise products
export const productsCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      message: "Category wise products",
      success: true,
      products,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting category wise products",
      success: false,
      error,
    });
  }
};

//token controller
export const brainTreeTokenController = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).send({
        success: false,
        message: "Amount is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).send({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({
      message: error.message || "Error creating payment intent",
      success: false,
    });
  }
};

//payment controller
export const brainTreePaymentController = async (req, res) => {
  try {
    console.log("Starting payment process...");
    const { paymentMethodId, amount, cart } = req.body;
    const user = req.user;

    console.log("Payment request details:", {
      amount,
      cartItems: cart?.length,
      userId: user?._id,
      paymentMethodId,
    });

    if (!paymentMethodId || !amount) {
      console.log("Missing required fields:", {
        paymentMethodId: !!paymentMethodId,
        amount: !!amount,
      });
      return res.status(400).send({
        success: false,
        message: "Payment method ID and amount are required",
      });
    }

    if (!cart || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Cart is empty",
      });
    }

    try {
      console.log("Creating Stripe payment intent...");
      // Convert amount to cents for Stripe (amount is in rupees, convert to paise)
      const amountInPaise = Math.round(parseFloat(amount) * 100);

      console.log("Amount conversion:", {
        originalAmount: amount,
        amountInPaise,
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaise,
        currency: "inr",
        payment_method: paymentMethodId,
        confirm: true,
        description: "Purchase from ecommerce store",
        metadata: {
          order_id: Date.now().toString(),
          user_id: user?._id?.toString(),
          cart_items: cart.length,
        },
        return_url: "http://localhost:5174/dashboard/user/orders",
        confirmation_method: "manual",
        use_stripe_sdk: true,
      });

      console.log("Payment intent created:", {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method,
      });

      if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded, creating order...");

        try {
          const populatedCart = await Promise.all(
            cart.map(async (item) => {
              const product = await productModel
                .findById(item._id)
                .select("-photo");
              if (!product) {
                throw new Error(`Product not found: ${item._id}`);
              }
              return product;
            })
          );

          const order = new orderModel({
            products: populatedCart,
            payment: {
              id: paymentIntent.id,
              status: "succeeded",
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              created: paymentIntent.created,
              payment_method: paymentIntent.payment_method,
              payment_method_types: paymentIntent.payment_method_types,
              metadata: paymentIntent.metadata,
            },
            buyer: user?._id,
            status: "Processing",
          });

          await order.save();
          console.log("Order created successfully:", {
            orderId: order._id,
            products: order.products.length,
            total: paymentIntent.amount,
            status: order.status,
            paymentStatus: order.payment.status,
          });

          // Send confirmation email
          console.log("Sending order confirmation email...");
          try {
            const emailSent = await sendOrderConfirmationEmail(user, order);
            if (emailSent) {
              console.log("Order confirmation email sent successfully");
            } else {
              console.error("Failed to send order confirmation email");
            }
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }

          res.status(200).send({
            success: true,
            message: "Payment successful",
            paymentIntent: {
              id: paymentIntent.id,
              status: "succeeded",
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
            },
            order: order._id,
            orderStatus: order.status,
            paymentStatus: order.payment.status,
          });
        } catch (orderError) {
          console.error("Error creating order:", orderError);
          try {
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntent.id,
            });
            console.log(
              "Payment refunded due to order creation failure:",
              refund.id
            );
          } catch (refundError) {
            console.error("Error refunding payment:", refundError);
          }
          throw new Error("Order creation failed: " + orderError.message);
        }
      } else {
        console.log("Payment failed with status:", paymentIntent.status);
        res.status(400).send({
          success: false,
          message: `Payment failed with status: ${paymentIntent.status}`,
          details: paymentIntent.last_payment_error?.message,
          paymentStatus: paymentIntent.status,
        });
      }
    } catch (stripeError) {
      console.error("Stripe API Error:", {
        type: stripeError.type,
        message: stripeError.message,
        code: stripeError.code,
        decline_code: stripeError.decline_code,
        param: stripeError.param,
        stack: stripeError.stack,
      });

      let errorMessage = "Payment processing failed";

      if (stripeError.type === "StripeCardError") {
        errorMessage = stripeError.message;
      } else if (stripeError.type === "StripeInvalidRequestError") {
        errorMessage = "Invalid payment request";
      } else if (stripeError.type === "StripeAPIError") {
        errorMessage = "Payment service temporarily unavailable";
      }

      return res.status(400).send({
        success: false,
        message: errorMessage,
        error_type: stripeError.type,
        decline_code: stripeError.decline_code,
        details: stripeError.message,
      });
    }
  } catch (error) {
    console.error("Server Error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send({
      success: false,
      message: "An unexpected error occurred while processing your payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
