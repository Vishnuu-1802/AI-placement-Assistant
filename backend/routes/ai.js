import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText } = req.body;

    const response = await axios.post("http://127.0.0.1:8000/extract_skills", {
      resume_text: resumeText
    });

    res.json({ skills: response.data.skills });
  } catch (error) {
    console.log("Backend AI error:", error.message);
    res.status(500).json({ error: "AI Error" });
  }
});

export default router;
