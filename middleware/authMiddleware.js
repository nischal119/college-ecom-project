import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//protected routes
export const requireSignin = async (req, res, next) => {
  try {
    const request = req.headers.authorization?.split(" ");
    let token;

    if (request?.length === 2) {
      token = request[1];
    } else {
      token = req?.headers?.authorization;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export const requireSigninProtected = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

//admin access
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized in Admin Middleware",
      });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  }
};
