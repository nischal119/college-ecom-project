import express from "express";
import { requireSignin } from "../middleware/authMiddleware.js";
import {
  getCartController,
  addItemController,
  removeItemController,
} from "../controllers/cartController.js";

const router = express.Router();

// GET User Cart || METHOD GET
router.get("/get-cart", requireSignin, getCartController);

// Add Item to Cart || METHOD POST
router.post("/add-item", requireSignin, addItemController);

// Remove Item from Cart || METHOD DELETE
router.delete("/remove-item/:productId", requireSignin, removeItemController);

export default router;
