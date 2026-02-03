import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new MediaRecorder(stream);
      const chunks = [];

      newRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      newRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const recordedFile = new File([blob], 'my-voice-recording.wav', { type: 'audio/wav' });
        setFile(recordedFile); 
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      newRecorder.start();
      setRecorder(newRecorder);
      setIsRecording(true);
      setTranscription("Recording... click stop when finished.");
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Please allow microphone access to record.");
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleTranscribe = async (e) => {
    if (e) e.preventDefault();
    if (!file) return;

    setLoading(true);
    setTranscription("");
    const formData = new FormData();
    formData.append('audio', file);

    try {
      // Use your backend URL
     // Final production URL
// Ensure there is no extra slash at the end of the base URL
const response = await axios.post('https://speech-to-text-backend-tpqu.onrender.com/api/transcribe', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
      setTranscription(response.data.text);
    } catch (error) {
      console.error("Error:", error);
      setTranscription("❌ Error: Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 relative">
      
      {/* 🎯 Central Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-2xl font-black animate-pulse px-4">AI is converting speech to text...</p>
        </div>
      )}

      <h1 className="text-4xl font-black text-blue-600 mb-8 tracking-tight">Speech to Text AI</h1>

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            {file ? `✅ Ready: ${file.name}` : "Step 1: Upload or Record Audio"}
          </label>
          <input type="file" accept="audio/*" onChange={handleFileChange} className="w-full border p-2 rounded-xl" />
        </div>

        <div className="flex gap-4 mb-6">
          {/* Toggle Recording Button */}
          <button 
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              isRecording 
                ? 'bg-red-600 animate-pulse text-white ring-4 ring-red-200' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isRecording ? "⏹️ Stop Record" : "🎤 Start Record"}
          </button>
          
          <button 
            type="button"
            onClick={handleTranscribe} 
            disabled={!file || loading} 
            className={`flex-1 py-3 rounded-xl font-bold shadow-lg transition-all ${
              !file || loading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? "Processing..." : "Transcribe"}
          </button>
        </div>

        <div className="p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[140px]">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Result</h2>
          <p className="text-gray-800 leading-relaxed font-medium">{transcription || "Your text will appear here..."}</p>
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-xs font-bold uppercase tracking-widest">Built by Pratik Misal</p>
    </div>
  );
}

export default App;