import { useState, useRef } from "react";

export const useRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks: Blob[] = [];

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.length = 0;

    mediaRecorder.current.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(audioBlob));
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return { recording, audioURL, start, stop };
};
