import axios from "axios";
import { useState, useEffect, useContext, createContext } from "react";
import { useAuth } from "./Auth"; // Import useAuth
import toast from "react-hot-toast";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [auth] = useAuth(); // Get auth state

  // Function to fetch cart from backend
  const fetchUserCart = async () => {
    if (auth?.token) {
      try {
        const { data } = await axios.get(
          "http://localhost:8080/api/v1/cart/get-cart"
        );
        if (data?.success && data.cart?.products) {
          setCart(data.cart.products);
          localStorage.setItem("cart", JSON.stringify(data.cart.products));
        } else {
          setCart([]); // Start fresh if no cart on server or error
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error("Error fetching user cart:", error);
        toast.error("Could not load your shopping cart.");
        setCart([]); // Clear cart on error
        localStorage.removeItem("cart");
      }
    }
  };

  // Initial load: Check local storage first (for guests), then fetch if logged in
  useEffect(() => {
    if (auth?.token) {
      fetchUserCart(); // Fetch user-specific cart if logged in
    } else {
      // Load guest cart from local storage
      const data = localStorage.getItem("cart");
      if (data) {
        try {
          setCart(JSON.parse(data));
        } catch (error) {
          console.error("Error parsing guest cart from localStorage", error);
          localStorage.removeItem("cart");
          setCart([]);
        }
      } else {
        setCart([]); // Initialize empty for guest
      }
    }
  }, [auth?.token]); // Dependency ensures this runs on login/logout

  // Add Item
  const addItem = async (productToAdd) => {
    if (!productToAdd) return;

    // Optimistic UI Update (add locally first)
    const existingProductIndex = cart.findIndex(
      (item) => item._id === productToAdd._id
    );
    let newCart;
    if (existingProductIndex > -1) {
      // Already in cart, don't add again locally, maybe show message?
      toast.info("Item already in cart");
      return; // Don't proceed if already in cart
    } else {
      newCart = [...cart, productToAdd];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart)); // Update local storage
      toast.success(`${productToAdd.name} added to cart`);
    }

    // Sync with backend if logged in
    if (auth?.token) {
      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/v1/cart/add-item",
          {
            productId: productToAdd._id,
          }
        );
        if (!data?.success) {
          // Revert optimistic update on backend failure
          toast.error("Failed to add item to server cart.");
          const revertedCart = cart.filter(
            (item) => item._id !== productToAdd._id
          );
          setCart(revertedCart);
          localStorage.setItem("cart", JSON.stringify(revertedCart));
        } else {
          // Optional: Update local cart with potentially populated data from server
          // setCart(data.cart.products);
          // localStorage.setItem("cart", JSON.stringify(data.cart.products));
        }
      } catch (error) {
        console.error("Error adding item to backend cart:", error);
        toast.error("Server error adding item to cart.");
        // Revert optimistic update
        const revertedCart = cart.filter(
          (item) => item._id !== productToAdd._id
        );
        setCart(revertedCart);
        localStorage.setItem("cart", JSON.stringify(revertedCart));
      }
    }
  };

  // Remove Item
  const removeItem = async (productIdToRemove) => {
    if (!productIdToRemove) return;

    // Optimistic UI Update (remove locally first)
    const originalCart = [...cart]; // Keep original in case of revert
    const newCart = cart.filter((item) => item._id !== productIdToRemove);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart)); // Update local storage
    toast.success("Item removed from cart"); // Give feedback immediately

    // Sync with backend if logged in
    if (auth?.token) {
      try {
        const { data } = await axios.delete(
          `http://localhost:8080/api/v1/cart/remove-item/${productIdToRemove}`
        );
        if (!data?.success) {
          // Revert optimistic update on backend failure
          toast.error("Failed to remove item from server cart.");
          setCart(originalCart);
          localStorage.setItem("cart", JSON.stringify(originalCart));
        }
      } catch (error) {
        console.error("Error removing item from backend cart:", error);
        toast.error("Server error removing item from cart.");
        // Revert optimistic update
        setCart(originalCart);
        localStorage.setItem("cart", JSON.stringify(originalCart));
      }
    }
  };

  // Clear Cart (Typically used on logout)
  const clearCartLocally = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    // Provide cart state, add/remove functions, and clear function
    <CartContext.Provider
      value={{ cart, setCart, addItem, removeItem, clearCartLocally }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
