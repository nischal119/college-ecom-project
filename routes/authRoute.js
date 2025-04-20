import express from "express";
import {
  authorizeSeller,
  forgotPasswordController,
  getALlOrdersController,
  getOrdersController,
  loginController,
  registerController,
  sendEmailController,
  testController,
  updateOrderStatusController,
  updateProfileController,
} from "../controllers/authController.js";
import {
  isAdmin,
  requireSignin,
  requireSigninProtected,
} from "../middleware/authMiddleware.js";
import { sendTestEmail } from "../helpers/authHelper.js";
//router object

const router = express.Router();

//routing

//REGISTER
router.post("/register", registerController);

//login
router.post("/login", loginController);

// checking email and security answer validity

//forgot password
router.post("/forgot-password", forgotPasswordController);

//test
router.get("/test", requireSignin, isAdmin, testController);

//protected route auth
router.get("/user-auth", requireSigninProtected, (req, res) => {
  res.status(200).send({ ok: true });
});

//Admin Route
router.get("/admin-auth", requireSigninProtected, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/update-profile", requireSignin, updateProfileController);

//order
router.get("/orders", requireSignin, getOrdersController);

//all orders
router.get("/all-orders", requireSignin, getALlOrdersController);

//order status update
router.put(
  "/order-status/:orderId",
  requireSignin,
  isAdmin,
  updateOrderStatusController
);

//sending email function
router.post("/send-email", sendEmailController);

//authorizing user through email
// router.get("/authorize-seller/:userId", authorizeSeller);

// Test email route
router.post("/test-email", requireSignin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("Attempting to send test email to:", email);
    const result = await sendTestEmail(email);

    if (result) {
      console.log("Test email sent successfully to:", email);
      return res.json({
        success: true,
        message: "Test email sent successfully",
      });
    } else {
      console.error("Failed to send test email to:", email);
      return res.status(500).json({
        success: false,
        message:
          "Failed to send test email. Please check server logs for details.",
      });
    }
  } catch (error) {
    console.error("Error in test email route:", {
      message: error.message,
      stack: error.stack,
      email: req.body.email,
    });
    return res.status(500).json({
      success: false,
      message: "Error sending test email: " + error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;
