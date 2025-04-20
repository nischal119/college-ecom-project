import express from "express";
import { stripePaymentController } from "../controllers/paymentController.js";
import { requireSignin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Payment routes
router.post("/create-payment-intent", requireSignin, stripePaymentController);

export default router;
