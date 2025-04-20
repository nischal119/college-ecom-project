import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import productModel from "../models/productModel.js";

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createTransporter = () => {
  console.log("\n=== GMAIL CREDENTIALS DEBUG ===");
  const gmailUser = process.env.GMAIL_USER_NAME?.replace(/['"]+/g, "")?.trim();
  const gmailPass = process.env.GMAIL_PASSWORD?.replace(/['"]+/g, "")?.trim();

  console.log("Gmail user:", gmailUser ? "Set" : "Not set");
  console.log("Gmail password:", gmailPass ? "Set" : "Not set");

  if (!gmailUser || !gmailPass) {
    console.error("Missing Gmail credentials in environment variables");
    throw new Error("Missing Gmail credentials");
  }

  console.log("Creating transporter with credentials...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
    debug: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
    },
  });
  console.log("Transporter created successfully");
  console.log("=== END GMAIL CREDENTIALS DEBUG ===\n");
  return transporter;
};

export const sendTestEmail = async (userEmail) => {
  try {
    console.log("Starting test email process...");
    const transporter = createTransporter();

    const testOrder = {
      _id: "TEST_ORDER_123",
      status: "Test Order",
      createdAt: new Date(),
      products: [
        {
          name: "Test Product 1",
          price: 1000,
        },
        {
          name: "Test Product 2",
          price: 2000,
        },
      ],
      payment: {
        success: true,
        status: "succeeded",
        amount: 3000,
      },
    };

    const testUser = {
      name: "Test User",
      email: userEmail,
    };

    return await sendOrderConfirmationEmail(testUser, testOrder);
  } catch (error) {
    console.error("Error sending test email:", error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (user, order) => {
  try {
    console.log("\n=== EMAIL HELPER DEBUG ===");
    console.log("Received user object:", JSON.stringify(user, null, 2));
    console.log("Order details:", JSON.stringify(order, null, 2));

    if (!user.email) {
      console.error("No email address provided for user");
      return false;
    }

    const emailToSend = user.email.trim();
    console.log("Final email address to send to:", emailToSend);

    const transporter = createTransporter();
    console.log("Transporter created successfully");

    // Populate products if they're just IDs
    let populatedProducts = order.products;
    if (
      order.products &&
      order.products.length > 0 &&
      typeof order.products[0] === "string"
    ) {
      console.log("Products are IDs, populating...");
      populatedProducts = await productModel
        .find({ _id: { $in: order.products } })
        .select("name price");
      console.log(
        "Populated products:",
        JSON.stringify(populatedProducts, null, 2)
      );
    }

    const totalAmount = populatedProducts.reduce(
      (total, product) => total + product.price,
      0
    );

    console.log("=== PRODUCT DETAILS DEBUG ===");
    console.log("Products array:", JSON.stringify(populatedProducts, null, 2));
    console.log("Calculated total amount:", totalAmount);

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };

    const mailOptions = {
      from: process.env.GMAIL_USER_NAME.replace(/['"]+/g, ""),
      to: emailToSend,
      subject: "Order Confirmation - Your Purchase Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Thank you for your purchase, ${
            user.name
          }!</h2>
          <p style="color: #666;">Your order has been successfully placed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${formatDate(
              order.createdAt || new Date()
            )}</p>
            <p><strong>Order Status:</strong> ${order.status}</p>
            <p><strong>Payment Status:</strong> ${
              order.payment?.status === "succeeded" ? "Success" : "Failed"
            }</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Products:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                  <th style="text-align: left; padding: 10px;">Product</th>
                  <th style="text-align: right; padding: 10px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${populatedProducts
                  .map(
                    (product) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${product.name}</td>
                    <td style="text-align: right; padding: 10px;">${formatCurrency(
                      product.price
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr style="border-top: 2px solid #ddd; font-weight: bold;">
                  <td style="padding: 10px;">Total Amount:</td>
                  <td style="text-align: right; padding: 10px;">${formatCurrency(
                    totalAmount
                  )}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">If you have any questions about your order, please contact our support team.</p>
            <p style="color: #666; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        </div>
      `,
    };

    console.log("Mail options prepared:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully. Response:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    console.log("=== END EMAIL HELPER DEBUG ===\n");
    return true;
  } catch (error) {
    console.error("Detailed error in sending order confirmation email:", {
      message: error.message,
      stack: error.stack,
    });
    return false;
  }
};
