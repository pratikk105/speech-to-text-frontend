import React, { useState, useEffect } from 'react';
import axios from 'axios';

// YOUR LIVE BACKEND URL
const BACKEND_URL = "https://speech-to-text-backend-tpqu.onrender.com"; 

function App() {
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);

  // Auto-wake up the backend
  useEffect(() => {
    axios.get(BACKEND_URL).catch(() => console.log("Waking up server..."));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new MediaRecorder(stream);
      const chunks = [];
      newRecorder.ondataavailable = (e) => chunks.push(e.data);
      newRecorder.onstop = () => {
        const recordedFile = new File([new Blob(chunks)], 'voice.wav', { type: 'audio/wav' });
        setFile(recordedFile);
        setIsRecording(false);
        stream.getTracks().forEach(t => t.stop());
      };
      newRecorder.start();
      setRecorder(newRecorder);
      setIsRecording(true);
      setTranscription("Recording... speak clearly!");
    } catch (err) { alert("Mic access denied!"); }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/transcribe`, formData);
      setTranscription(res.data.text);
    } catch (err) {
      setTranscription("⚠️ Backend is waking up. Please wait 30 seconds and try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      {loading && <div className="fixed inset-0 bg-black/60 flex items-center justify-center text-white z-50 font-bold text-xl">AI is processing your voice...</div>}
      <h1 className="text-4xl font-black text-blue-600 mb-8 tracking-tight">Speech to Text AI</h1>
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} className="mb-6 w-full text-sm" />
        <div className="flex gap-4 mb-6">
          <button onClick={isRecording ? () => recorder.stop() : startRecording} className={`flex-1 py-4 rounded-xl font-bold transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {isRecording ? "⏹ Stop" : "🎤 Record"}
          </button>
          <button onClick={handleTranscribe} disabled={!file || loading} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300">
            Transcribe
          </button>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[120px] text-left text-gray-800 italic">
          {transcription || "Your text result will appear here..."}
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs font-black uppercase tracking-widest">Project by Pratik Misal</p>
    </div>
  );
}

export default App;