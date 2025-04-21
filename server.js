import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import creategoryRoute from "./routes/categoryRoutes.js";
import productRoute from "./routes/porductRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import cartRoute from "./routes/cartRoutes.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

//dotenv config
dotenv.config();

//database connection
connectDB();

const PORT = process.env.PORT || 8080;
//rest object

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced logging setup
morgan.token("body", (req) => JSON.stringify(req.body));
morgan.token("error", (req, res) => res.error);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced logging
app.use(morgan(":method :url :status :response-time ms - :body - :error"));

// API Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", creategoryRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/cart", cartRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  // Check if this is an API route
  if (req.path.startsWith("/api/")) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err : undefined,
    });
  } else {
    next(err);
  }
});

// Serve static files only in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/dist")));
  app.use("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/dist/index.html"));
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Listen app
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS enabled for: http://localhost:5173, http://localhost:5174`);
});

// Enhanced logging functions
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const logMessage = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
    )
    .join(" ");
  process.stdout.write(`[${timestamp}] ${logMessage}\n`);
};

console.error = (...args) => {
  const timestamp = new Date().toISOString();
  const errorMessage = args
    .map((arg) =>
      arg instanceof Error
        ? `${arg.message}\n${arg.stack}`
        : typeof arg === "object"
        ? JSON.stringify(arg, null, 2)
        : arg
    )
    .join(" ");
  process.stderr.write(`[${timestamp}] ERROR: ${errorMessage}\n`);
};

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
