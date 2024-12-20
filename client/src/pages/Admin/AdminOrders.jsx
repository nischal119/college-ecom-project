import React, { useEffect, useState } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/Auth";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { get } from "mongoose";
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([
    "Not Processed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [changeStatus, setChangeStatus] = useState("");
  const [orderProducts, setOrderProducts] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();

  const getOrders = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8080/api/v1/auth/all-orders"
      );
      setOrders(data.orders);
      // console.log(data.orders[0].products)
      setOrderProducts(data.orders[0].products);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, []);

  const handelChange = async (orderId, value) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8080/api/v1/auth/order-status/${orderId}`,
        { status: value }
      );

      getOrders();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout title={"All Orders Data"}>
      <div className="row m-lg-3 p-lg-3">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div
          className="col-md-9"
          style={{ maxHeight: "80vh", overflowY: "scroll" }}
        >
          {orders.length > 0 && (
            <h1 className="text-center mt-4">All Orders</h1>
          )}
          {orders.length > 0 ? (
            orders?.map((item, index) => (
              <div className="border shadow" key={index}>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Status</th>
                        <th scope="col">Buyer</th>
                        <th scope="col">Date</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="align-items-center">
                        <td>{index + 1}</td>
                        <td>
                          <Select
                            variant="borderless"
                            onChange={(value) => {
                              handelChange(item._id, value);
                            }}
                            defaultValue={item?.status}
                          >
                            {status?.map((item, index) => (
                              <Option key={index} value={item}>
                                {item}
                              </Option>
                            ))}
                          </Select>
                        </td>
                        <td>{item?.buyer?.name}</td>
                        <td>{moment(item?.createdAt).fromNow()}</td>
                        <td>{item?.payment.success ? "Success" : "Failed"}</td>
                        <td>{item?.products?.length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="container">
                  {orderProducts?.map((product) => (
                    <div
                      className="row m-3 p-3 d-flex justify-content-center align-items-center"
                      key={product._id}
                    >
                      <div className="col-md-2 ">
                        <img
                          style={{
                            width: "100%",
                          }}
                          src={`http://localhost:8080/api/v1/product/product-photo/${product?._id}`}
                          alt="Card image cap"
                        />
                      </div>
                      <div className="col-md-8 text-center">
                        <h5 className="card-title">{product?.name}</h5>
                        <p className="card-text">Rs.{product?.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              <h1>No Orders Found</h1>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
