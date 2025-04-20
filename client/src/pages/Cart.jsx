const handlePayment = async (e) => {
  e.preventDefault();

  // Add an alert to verify function execution
  alert("Payment process started");

  try {
    // Clear console for better visibility
    console.clear();

    // Log start of payment process
    console.log(
      "%c=== STARTING PAYMENT PROCESS ===",
      "color: blue; font-weight: bold; font-size: 16px;"
    );

    // Log cart contents
    console.log("%cCart Contents:", "color: green; font-weight: bold;", {
      items: cart?.products?.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
      })),
      totalItems: cart?.products?.length || 0,
      totalAmount: cart?.products?.reduce((sum, p) => sum + p.price, 0) || 0,
    });

    // Log user details
    console.log("%cUser Details:", "color: green; font-weight: bold;", {
      id: user?._id,
      name: user?.name,
      email: user?.email,
    });

    if (!cart?.products?.length) {
      console.error("%cCart is empty", "color: red; font-weight: bold;");
      toast.error("Cart Is Empty");
      return;
    }

    // Log Braintree payment method request
    console.log(
      "%cRequesting payment method from Braintree...",
      "color: blue;"
    );
    const { nonce } = await instance.requestPaymentMethod();
    console.log("%cPayment method nonce received:", "color: green;", nonce);

    // Log payment request to server
    console.log("%cSending payment request to server...", "color: blue;");
    console.log("%cRequest payload:", "color: blue;", {
      nonce,
      cart: cart.products.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
      })),
    });

    const { data } = await axios.post(
      "http://localhost:8080/api/v1/payment/braintree/payment",
      { nonce, cart },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Log server response
    console.log("%cServer Response:", "color: green; font-weight: bold;", data);

    if (data.ok) {
      console.log("%cPayment successful!", "color: green; font-weight: bold;");
      console.log("%cClearing cart...", "color: blue;");
      setCart({ ...cart, products: [] });
      toast.success("Payment Completed Successfully ");
      navigate("/dashboard/user/orders");
    } else {
      console.error(
        "%cPayment failed:",
        "color: red; font-weight: bold;",
        data
      );
      toast.error("Payment Failed");
    }
  } catch (error) {
    console.error(
      "%cError in payment process:",
      "color: red; font-weight: bold;",
      {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }
    );
    toast.error("Something Went Wrong");
  }
};
