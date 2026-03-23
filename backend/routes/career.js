import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { skills } = req.body;

    const response = await axios.post(
      "http://127.0.0.1:8000/predict_role",
      { skills }
    );

    res.json(response.data);
  } catch (err) {
    console.log("Prediction error:", err.message);
    res.status(500).json({ error: "AI prediction failed" });
  }
});

export default router;
