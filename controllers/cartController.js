export const addToCartController = async (req, res) => {
  try {
    console.log("Adding product to cart...");
    console.log("Request details:", {
      productId: req.body.productId,
      userId: req.user._id,
    });

    const { productId } = req.body;
    const product = await productModel.findById(productId);
    console.log("Product found:", {
      id: product._id,
      name: product.name,
      price: product.price,
    });

    let cart = await cartModel.findOne({ buyer: req.user._id });
    if (!cart) {
      console.log("Creating new cart for user");
      cart = new cartModel({
        buyer: req.user._id,
        products: [],
      });
    }

    cart.products.push(product);
    await cart.save();
    console.log("Product added to cart successfully");

    res.status(201).send({
      success: true,
      message: "Product Added To Cart",
    });
  } catch (error) {
    console.error("Error adding to cart:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send({
      success: false,
      message: "Error in Add To Cart",
      error,
    });
  }
};

export const getCartController = async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user._id);
    const cart = await cartModel
      .findOne({ buyer: req.user._id })
      .populate("products");

    console.log("Cart found:", {
      productCount: cart?.products?.length || 0,
      totalItems: cart?.products?.reduce((sum, p) => sum + p.price, 0) || 0,
    });

    res.status(200).send({
      success: true,
      message: "Cart Fetched Successfully",
      cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send({
      success: false,
      message: "Error in Get Cart",
      error,
    });
  }
};

export const deleteCartController = async (req, res) => {
  try {
    console.log("Deleting cart for user:", req.user._id);
    const { id } = req.params;
    const cart = await cartModel.findOneAndUpdate(
      { buyer: req.user._id },
      { $pull: { products: id } },
      { new: true }
    );
    console.log("Cart updated after deletion:", {
      remainingProducts: cart?.products?.length || 0,
    });

    res.status(200).send({
      success: true,
      message: "Product Deleted From Cart",
      cart,
    });
  } catch (error) {
    console.error("Error deleting from cart:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send({
      success: false,
      message: "Error in Delete Cart",
      error,
    });
  }
};
