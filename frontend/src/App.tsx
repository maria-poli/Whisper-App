import { useRecorder } from "./hooks/useRecorder";
import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const { recording, audioURL, start, stop } = useRecorder();
  const [transcript, setTranscript] = useState("");
  const [ttsInput, setTtsInput] = useState("");
  const [mode, setMode] = useState<"STT" | "TTS" | null>(null);
  const [modelSize, setModelSize] = useState("small"); // Default model size
  const [language, setLanguage] = useState("en"); // Default language

  const sendAudio = async () => {
    if (!audioURL) return;

    const res = await fetch(audioURL);
    const blob = await res.blob();
    const file = new File([blob], "recording.webm", { type: "audio/webm" });

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("modelSize", modelSize); // Add model size to FormData
    formData.append("language", language);   // Add language to FormData
  
    try {
      const response = await axios.post("http://localhost:3001/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTranscript(response.data.transcript);
    } catch (err) {
      console.error(err);
    }
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(ttsInput);
    synth.speak(utterance);
  };

  return (
    <div className="app-container">
      {/* Dropdowns for Model Size and Language */}
      <div className="dropdowns">
        <label>
          Model Size:
          <select value={modelSize} onChange={(e) => setModelSize(e.target.value)}>
            <option value="tiny">Tiny</option>
            <option value="base">Base</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <span>   </span>
        <label>
          Language:
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ar">Arabic</option>
            <option value="zh">Chinese</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pl">Polish</option>
            <option value="pt">Portuguese</option>
            <option value="ro">Romanian</option>
            <option value="ru">Russian</option>
            <option value="es">Spanish</option>
            <option value="sl">Slovenian</option>
          </select>
        </label>
      </div>
      {/* Mode Selection Buttons */}
      {!mode && (
        <div className="centered-box">
          <h1 className="text-2xl font-bold mb-4">🎤 Whisper STT & TTS App</h1>
          <button
            className="mode-button"
            onClick={() => setMode("STT")}
          >
            Speech-to-Text (STT)
          </button>
          <button
            className="mode-button"
            onClick={() => setMode("TTS")}
          >
            Text-to-Speech (TTS)
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {mode && (
        <div className="main-content">
          <div className="mode-buttons">
            <button
              className={`mode-button ${mode === "STT" ? "active" : ""}`}
              onClick={() => setMode("STT")}
            >
              STT
            </button>
            <button
              className={`mode-button ${mode === "TTS" ? "active" : ""}`}
              onClick={() => setMode("TTS")}
            >
              TTS
            </button>
          </div>

          <div className="centered-box">
            {mode === "STT" && (
              <>
                <button
                  className="stt-button"
                  onClick={recording ? stop : start}
                >
                  {recording ? "Stop Recording" : "Start Recording"}
                </button>

                {recording && (
                  <div className="recording-animation">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                )}

                {audioURL && (
                  <div>
                    <audio controls src={audioURL} />
                    <button
                      className="transcribe-button"
                      onClick={sendAudio}
                    >
                      Transcribe
                    </button>
                  </div>
                )}

                {transcript && (
                  <div className="transcript-box">
                    <h2 className="font-semibold">Transcript:</h2>
                    <p>{transcript}</p>
                  </div>
                )}
              </>
            )}

            {mode === "TTS" && (
              <>
                <input
                  type="text"
                  value={ttsInput}
                  onChange={(e) => setTtsInput(e.target.value)}
                  className="tts-input"
                  placeholder="Enter text here..."
                />
                <button onClick={speak} className="tts-button">
                  Speak
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;