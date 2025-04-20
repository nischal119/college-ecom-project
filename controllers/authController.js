import JWT from "jsonwebtoken";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    //validations

    if (!name || !email || !password || !phone || !address || !answer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //register user

    const hashedPassword = await hashPassword(password);
    //save user

    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

//POST login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validations

    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    //check user

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not found",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Incorrect password",
      });
    }

    //token

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",

      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//check email and answer

export const checkEmailController = async (req, res, next) => {
  const { email, answer } = req.body;
  try {
    if (!email || !answer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    next();

    res.status(200).send({
      success: true,
      message: "Email and answer matched",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in forgot password",
      error,
    });
  }
};

//forgot password

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const checkOldPassword = await comparePassword(newPassword, user.password);

    if (checkOldPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }
    const hash = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hash });

    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in forgot password",
      error,
    });
  }
};

//test

export const testController = async (req, res) => {
  try {
    res.send({ message: "Protected route" });
  } catch (error) {
    res.send(error);
    res.status(500).json({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  }
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;
    //validations
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 6 characters long",
      });
    }
    //hash password

    const hashedPassword = password ? await hashPassword(password) : undefined;

    //update user
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,

        phone: phone || user.phone,
        address: address || user.address,
        password: hashedPassword,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in update profile",
      error,
    });
  }
};

//get orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name ");
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in get orders",
      error,
    });
  }
};

//get all orders
export const getALlOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name ")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in get orders",
      error,
    });
  }
};

//update order status
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in update order status",
      error,
    });
  }
};

//send email controller
export const sendEmailController = async (req, res) => {
  let transporter;
  try {
    const { senderName, senderEmail, adminEmail } = req.body;
    console.log("Starting seller request email process...");
    console.log("Sender details:", { name: senderName, email: senderEmail });
    console.log("Admin email:", adminEmail);

    // Verify environment variables
    if (!process.env.GMAIL_USER_NAME || !process.env.GMAIL_PASSWORD) {
      console.error("Missing Gmail credentials in environment variables");
      return res.status(500).json({
        success: false,
        message: "Email service configuration error",
      });
    }

    console.log("Using Gmail account:", process.env.GMAIL_USER_NAME);

    // Create transporter with timeout
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER_NAME,
        pass: process.env.GMAIL_PASSWORD,
      },
      debug: true,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
    });

    // Verify transporter connection with timeout
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 10000)
        ),
      ]);
      console.log("Transporter verified successfully");
    } catch (verifyError) {
      console.error("Transporter verification failed:", verifyError);
      return res.status(500).json({
        success: false,
        message: "Failed to connect to email server",
        error: verifyError.message,
      });
    }

    const mailOptions = {
      from: process.env.GMAIL_USER_NAME,
      to: adminEmail,
      subject: "Becoming a Seller Inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">New Seller Request</h2>
          <p style="color: #666;">A user has requested to become a seller on your platform.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">User Details:</h3>
            <p><strong>Name:</strong> ${senderName}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
          </div>

          <p style="color: #666; font-size: 14px;">Please review this request and take appropriate action.</p>
          <p style="color: #666; font-size: 14px;">Thank you!</p>
        </div>
      `,
    };

    console.log("Mail options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    console.log("Sending email...");
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timeout")), 30000)
      ),
    ]);
    console.log("Email sent successfully. Response:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      info: {
        messageId: info.messageId,
        response: info.response,
      },
    });
  } catch (error) {
    console.error("Detailed error in sending email:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    let errorMessage = "Error sending email";
    if (
      error.message === "Connection timeout" ||
      error.message === "Email sending timeout"
    ) {
      errorMessage = "Email service timed out. Please try again.";
    } else if (error.code === "EAUTH") {
      errorMessage = "Authentication failed. Please check your credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage =
        "Unable to connect to the email server. Check your network.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message || error,
    });
  } finally {
    // Close the transporter if it was created
    if (transporter) {
      transporter.close();
    }
  }
};

export const authorizeSeller = async (req, res) => {
  try {
    const { email } = req.query;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the user's role to seller
    user.role = 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User with email ${email} has been authorized as a seller.`,
    });
  } catch (error) {
    console.error("Error authorizing seller:", error);
    res.status(500).json({
      success: false,
      message: "Error authorizing seller",
      error: error.message || error,
    });
  }
};
