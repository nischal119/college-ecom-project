import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, Button, Spin } from "antd";

const BecomeSeller = () => {
  const [auth] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(null);

  const handleClick = async () => {
    const { name, email } = auth.user;
    const adminEmail = "strawluffy119@gmail.com";

    try {
      setIsLoading(true);
      console.log(
        `Sending seller request email from ${name} (${email}) to ${adminEmail}`
      );

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timed out. Please try again."));
        }, 30000); // 30 seconds timeout
      });

      // Race between the API call and timeout
      const response = await Promise.race([
        axios.post("http://localhost:8080/api/v1/auth/send-email", {
          senderName: name,
          senderEmail: email,
          adminEmail,
        }),
        timeoutPromise,
      ]);

      if (response.data.success) {
        toast.success("Email sent successfully.");
        setLastRequestTime(new Date());
        console.log(`Seller request email sent successfully at ${new Date()}`);
        console.log("Email details:", {
          from: email,
          to: adminEmail,
          response: response.data,
        });
      } else {
        toast.error(
          response.data.message || "An error occurred while sending the email."
        );
        console.error(
          `Failed to send seller request email: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
      if (error.message === "Request timed out. Please try again.") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while sending the email."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={"Become a seller"}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Card
              title="Become a Seller"
              style={{ margin: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-center p-4">
                <h3>Interested in becoming a seller?</h3>
                <p>Click the button below to send a request to the admin.</p>
                {lastRequestTime && (
                  <p style={{ color: "green", marginBottom: "20px" }}>
                    Last request sent at: {lastRequestTime.toLocaleString()}
                  </p>
                )}
                <Button
                  type="primary"
                  size="large"
                  onClick={handleClick}
                  disabled={isLoading}
                  style={{ marginTop: "20px" }}
                >
                  {isLoading ? (
                    <>
                      <Spin size="small" style={{ marginRight: "8px" }} />
                      Sending Request...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BecomeSeller;
