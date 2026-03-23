import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import aiRoutes from "./routes/ai.js";   // <-- IMPORTANT
import careerRoutes from "./routes/career.js";
import authRoutes from "./routes/auth.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err.message));

// ------------------ Routes ------------------
app.use("/api/ai", aiRoutes);   // <-- REGISTER YOUR ROUTE HERE
app.use("/api/career", careerRoutes);
app.use("/api/auth", authRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
