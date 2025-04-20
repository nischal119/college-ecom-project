import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/Routes/UserMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/Auth";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Card, Table, Tag, Badge } from "antd";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();

  const getOrders = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8080/api/v1/auth/orders"
      );
      setOrders(data.orders);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Processed":
        return "red";
      case "Processing":
        return "orange";
      case "Shipped":
        return "blue";
      case "Delivered":
        return "green";
      case "Cancelled":
        return "gray";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => (
        <span style={{ fontWeight: "bold" }}>{text.slice(-6)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => moment(date).format("MMM Do YYYY, h:mm a"),
    },
    {
      title: "Payment",
      dataIndex: ["payment", "success"],
      key: "payment",
      render: (success) => (
        <Tag color={success ? "green" : "red"}>
          {success ? "Success" : "Failed"}
        </Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "products",
      key: "quantity",
      render: (products) => products?.length || 0,
    },
  ];

  return (
    <Layout title={"Your Orders"}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <Card
              title="Your Orders"
              style={{ margin: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              {orders?.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={orders}
                  rowKey="_id"
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="container">
                        <h4>Ordered Products</h4>
                        <div className="row">
                          {record.products?.map((product) => (
                            <div className="col-md-4 mb-3" key={product._id}>
                              <Card
                                hoverable
                                cover={
                                  <img
                                    alt={product.name}
                                    src={`http://localhost:8080/api/v1/product/product-photo/${product._id}`}
                                    style={{
                                      height: "200px",
                                      objectFit: "cover",
                                    }}
                                  />
                                }
                              >
                                <Card.Meta
                                  title={product.name}
                                  description={`Rs.${product.price}`}
                                />
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  }}
                />
              ) : (
                <div className="text-center p-5">
                  <h3>No Orders Found</h3>
                  <p>You haven't placed any orders yet.</p>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/")}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
