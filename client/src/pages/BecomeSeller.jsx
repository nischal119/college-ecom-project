import React, { useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";

const BecomeSeller = () => {
  const [auth] = useAuth();
  const [okResponse, setOkResponse] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
      setIsLoading(true);
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
        setIsLoading(false);
      } else {
        toast.error("An error occurred while sending the email.");
        setIsLoading(false);
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
          {isLoading ? (
            <button className="btn btn-primary" disabled>
              Sending...
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleClick}>
              Send Email
            </button>
          )}
        </div>
      )}
    </Layout>
  );
};

export default BecomeSeller;
