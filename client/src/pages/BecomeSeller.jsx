import React from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/Auth";
import axios from "axios";

const BecomeSeller = () => {
  const [auth] = useAuth();

  const handleClick = async () => {
    // const { name, email } = auth.user;
    // const adminEmail = "dhungeln12@gmail.com";
    // const subject = "Becoming a Seller Inquiry";
    // const body = `Hi, I'm ${name} (${email}), and I'm interested in becoming a seller.`;
    // const gmailComposeLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(
    //   adminEmail
    // )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // window.open(gmailComposeLink, "_blank");

    const { name, email } = auth.user;
    const adminEmail = "dhungeln12@gmail.com";

    try {
      const response = await axios.post("http://localhost:8080/send-email", {
        senderName: name,
        senderEmail: email,
        adminEmail,
      });

      if (response.data.success) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    }
  };

  return (
    <Layout title={"Become a seller"}>
      <div className="container d-flex justify-content-center align-items-center flex-column mt-5">
        <h1 className="text-center">Please Contact admin to become a seller</h1>
        <button className="btn btn-primary mt-5" onClick={handleClick}>
          Contact Now?
        </button>
      </div>
    </Layout>
  );
};

export default BecomeSeller;
