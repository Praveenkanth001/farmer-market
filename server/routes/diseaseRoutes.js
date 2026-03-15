const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import the AI service and models
const detectPlantDisease = require("../ai/plantDiseaseService");
const Diagnosis = require("../models/Diagnosis");
const jwt = require("jsonwebtoken");

// ==============================
// MULTER STORAGE CONFIG
// ==============================

const fs = require("fs");
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the current timestamp and original name
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Basic file filter to ensure only images are processed
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// ==============================
// ROUTE : DETECT DISEASE
// ==============================
// POST /api/disease/detect
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    console.log("📥 Request received");

    // 1. Check if image file was uploaded
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    console.log("📂 File received:", req.file.filename);
    console.log("File received:", req.file);

    const imagePath = req.file.path;

    // 2. Call the AI detection service
    const aiResult = await detectPlantDisease(imagePath);

    console.log("🤖 AI raw result:", aiResult);

    // 3. Handle failed AI results
    if (!aiResult) {
      console.log("⚠️ AI could not detect disease from the provided image");
      return res.status(500).json({
        message: "AI could not detect disease",
      });
    }

    // 4. Extract user from token if available
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log("⚠️ Guest scan (Invalid or no token)");
      }
    }

    // 5. Save report to database
    try {
        const report = new Diagnosis({
            user: userId,
            crop: aiResult.disease.split(' ')[0] || "Plant",
            diagnosisEn: aiResult.disease,
            treatmentEn: aiResult.treatment,
            preventionEn: aiResult.prevention,
            confidence: aiResult.score,
            image: req.file.filename,
            timestamp: new Date()
        });
        await report.save();
        console.log("💾 AI Report saved to DB");
    } catch (saveErr) {
        console.error("❌ Failed to save AI report:", saveErr.message);
    }

    // 6. Return the structured result
    res.json({
      disease: aiResult.disease,
      confidence: aiResult.score,
      treatment: aiResult.treatment,
      prevention: aiResult.prevention,
      symptoms: aiResult.symptoms,
      fullResult: aiResult,
    });

  } catch (error) {
    console.error("❌ Detection Error:", error.message);

    res.status(500).json({
      message: "Image analysis failed",
      error: error.message,
    });
  }
});

module.exports = router;