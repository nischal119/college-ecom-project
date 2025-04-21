import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.ObjectId,
      ref: "User", // Assuming your user model is named 'User'
      required: true,
      unique: true, // Each user should have only one cart
    },
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products", // Corrected ref to match product model name
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
