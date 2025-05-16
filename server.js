const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");
const Tesseract = require("tesseract.js");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

async function summarizeText(text) {
  // Hugging Face models can handle ~1024 tokens (about 500–800 words)
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length < 50) {
    throw new Error("Text is too short to summarize.");
  }

  const sliced = cleaned.slice(0, 3000); // Limit to safe range

  const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: sliced }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  return data[0]?.summary_text || "No summary available.";
}
async function extractTextFromBuffer(file) {
  const mime = file.mimetype;

  if (mime === "application/pdf") {
    return (await pdfParse(file.buffer)).text;
  }

  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (mime === "application/msword") {
    return new Promise((resolve, reject) => {
      textract.fromBufferWithMime(mime, file.buffer, (err, text) => {
        if (err) reject(err);
        else resolve(text);
      });
    });
  }

  if (mime.startsWith("image/")) {
    const {
      data: { text },
    } = await Tesseract.recognize(file.buffer, "eng", { logger: () => {} });
    return text;
  }

  if (mime === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type");
}

app.post("/api/summarize", upload.single("file"), async (req, res) => {
  try {
    let text = req.body.text;

    if (!text && req.file) {
      text = await extractTextFromBuffer(req.file);
    }

if (!text || text.trim().length < 50) {
  return res.status(400).json({ error: "The text is too short to summarize. Please upload a larger file or input more content." });
}

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (err) {
    console.error("Summarization error:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));