import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";

const execFilePromise = promisify(execFile);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Save uploads to /uploads folder
const upload = multer({ dest: "uploads/" });

// app.post("/transcribe", upload.single("audio"), async (req, res) => {
//     try {
//       const audioPath = req.file.path;

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;
    const { modelSize, language } = req.body; // Extract model size and language from request body
    console.log(modelSize, language);

    // Validate inputs
    const validModelSizes = ["tiny", "base", "small", "medium", "large"];
    const validLanguages = ["en", "es", "ro", "sl"]; // Add more languages as needed

    if (!validModelSizes.includes(modelSize)) {
      return res.status(400).json({ error: "Invalid model size" });
    }

    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid language" });
    }
    var transcriptPath = audioPath.slice(8);
    transcriptPath = transcriptPath + ".txt";

    const whisperPath = path.join(__dirname, "../venv/bin/whisper");

    console.log("Running Whisper on:", audioPath);

    // const { stdout, stderr } = await execFilePromise(
    //   whisperPath,
    //   [audioPath, "--model", "small", "--language", "en", "--output_format", "txt"]
    // );

    // Execute Whisper with user-selected model size and language
    const { stdout, stderr } = await execFilePromise(whisperPath, [
    audioPath,
    "--model",
    modelSize,
    "--language",
    language,
    "--output_format",
    "txt",
    ]);

    // console.log("Whisper STDOUT:", stdout);
    // console.log("Whisper STDERR:", stderr);
    // console.log("Audio path:", audioPath);
    // console.log("Transcript path:", transcriptPath);
    const transcript = await fs.promises.readFile(transcriptPath, "utf-8");

    res.json({ transcript });
    // console.log("Transcription successful:", transcript);
  } catch (err) {
    console.error("Error in /transcribe:", err);
    res.status(500).json({ error: "Transcription failed", details: err.message });
  }
});


app.listen(port, () => {
console.log(`Server listening on http://localhost:${port}`);
});
