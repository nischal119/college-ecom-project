import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js"; // To populate product details

// Get User's Cart
export const getCartController = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ buyer: req.user._id })
      .populate("products", "-photo"); // Populate product details, exclude photo

    if (!cart) {
      // If no cart exists, create one for the user
      const newCart = new cartModel({ buyer: req.user._id, products: [] });
      await newCart.save();
      return res.status(200).send({
        success: true,
        message: "Cart created and fetched successfully",
        cart: newCart,
      });
    }

    res.status(200).send({
      success: true,
      message: "Cart Fetched Successfully",
      cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send({
      success: false,
      message: "Error in Get Cart API",
      error: error.message,
    });
  }
};

// Add Item to Cart
export const addItemController = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).send({ message: "Product ID is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    let cart = await cartModel.findOne({ buyer: req.user._id });

    // If no cart, create one
    if (!cart) {
      cart = new cartModel({ buyer: req.user._id, products: [productId] });
    } else {
      // Add product to existing cart if not already present
      if (!cart.products.includes(productId)) {
        cart.products.push(productId);
      } else {
        return res.status(200).send({
          // Or 409 Conflict? Decide based on desired UX
          success: true, // Indicate success even if already present
          message: "Product already in cart",
          cart, // Send updated cart anyway
        });
      }
    }

    await cart.save();
    // Populate products after saving
    const updatedCart = await cartModel
      .findById(cart._id)
      .populate("products", "-photo");

    res.status(201).send({
      success: true,
      message: "Product Added To Cart Successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).send({
      success: false,
      message: "Error in Add To Cart API",
      error: error.message,
    });
  }
};

// Remove Item from Cart
export const removeItemController = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId from URL parameters
    if (!productId) {
      return res.status(400).send({ message: "Product ID is required in URL" });
    }

    const cart = await cartModel
      .findOneAndUpdate(
        { buyer: req.user._id },
        { $pull: { products: productId } }, // Use $pull to remove the item
        { new: true } // Return the updated document
      )
      .populate("products", "-photo");

    if (!cart) {
      return res
        .status(404)
        .send({ message: "Cart not found or item not in cart" });
    }

    res.status(200).send({
      success: true,
      message: "Product Removed From Cart Successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send({
      success: false,
      message: "Error in Remove From Cart API",
      error: error.message,
    });
  }
};
