import React, { useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";

const BecomeSeller = () => {
  const [auth] = useAuth();
  const [okResponse, setOkResponse] = React.useState(false);

  // Load state from localStorage on component mount
  useEffect(() => {
    const storedResponse = localStorage.getItem("okResponse");
    if (storedResponse === "true") {
      setOkResponse(true);
    }
  }, []);

  const handleClick = async () => {
    const { name, email } = auth.user;
    const adminEmail = "dhungeln12@gmail.com";

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/send-email",
        {
          senderName: name,
          senderEmail: email,
          adminEmail,
        }
      );

      if (response.data.success) {
        toast.success("Email sent successfully.");
        setOkResponse(true);
        localStorage.setItem("okResponse", "true"); // Persist state to localStorage
      } else {
        toast.error("An error occurred while sending the email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    }
  };

  return (
    <Layout title={"Become a seller"}>
      {okResponse ? (
        <div className="container d-flex justify-content-center align-items-center flex-column mt-5">
          <h1 className="text-center">Email sent!</h1>
          <p className="text-center">Please wait for admin response.</p>
        </div>
      ) : (
        <div className="container d-flex justify-content-center align-items-center flex-column mt-5">
          <h1 className="text-center">
            Please Contact admin to become a seller
          </h1>
          <button className="btn btn-primary mt-5" onClick={handleClick}>
            Contact Now?
          </button>
        </div>
      )}
    </Layout>
  );
};

export default BecomeSeller;
