import { useState } from "react";
import confetti from "canvas-confetti";
import { GlowingEffect } from "../components/GlowingEffect";

export default function UploadCard({
  input,
  setInput,
  setFile,
  handleSummarize,
  loading,
  summary,
  onClear,
  summaryRef,
}) {
  const [mode, setMode] = useState("text");
  const [showToast, setShowToast] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    confetti({
      particleCount: 80,
      angle: 90,
      spread: 80,
      origin: { x: 0.5, y: 0.1 },
      zIndex: 9999,
    });
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <GlowingEffect
        glow
        proximity={100}
        spread={30}
        blur={12}
        borderWidth={2}
        movementDuration={1.8}
        disabled={false}
      />

      <div className="relative z-10 p-6 bg-zinc-900/50 border border-zinc-700 rounded-2xl shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-center">AI Text Summarizer</h2>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMode("text")}
            className={`px-4 py-2 rounded-l-lg border border-r-0 ${
              mode === "text"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setMode("file")}
            className={`px-4 py-2 rounded-r-lg border ${
              mode === "file"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Input */}
        {mode === "text" ? (
          <textarea
            id="text"
            placeholder="Paste your text here..."
            className="w-full p-4 rounded-md bg-zinc-800 text-white border border-zinc-600 h-60 resize-none mb-4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        ) : (
          <input
            type="file"
            id="upload"
            className="mb-4 w-full text-white"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            className="w-full bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>

          {summary && (
            <button
              onClick={onClear}
              className="w-full bg-zinc-700 px-6 py-2 rounded-lg hover:bg-zinc-600 transition"
            >
              Clear Summary
            </button>
          )}
        </div>

        {/* Summary Output */}
        {summary && (
          <div ref={summaryRef} className="mt-6">
            <div className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-lg max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/70">
              <h2 className="text-lg font-semibold mb-2">Summary:</h2>
              <p className="text-zinc-300 whitespace-pre-wrap">{summary}</p>
            </div>

            {/* Download button */}
            <div className="mt-3 relative group">
              <button
                onClick={handleDownload}
                className="w-full px-6 py-2 text-white bg-zinc-700 rounded-lg border border-transparent hover:bg-zinc-600 transition-all duration-300 
                  relative z-10 overflow-hidden shadow-lg ring-1 ring-purple-500/50 hover:ring-2"
              >
                Download Summary (.txt)
              </button>
              <span
                className="absolute left-[-40px] top-[50%] w-2 h-2 bg-white rounded-full blur-sm opacity-0 
                group-hover:opacity-100 group-hover:animate-[meteor_1.2s_ease-out] z-0"
              ></span>
            </div>
          </div>
        )}

        {/* Toast */}
        {showToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in-out z-[1000]">
            ✅ Summary downloaded
          </div>
        )}
      </div>
    </div>
  );
}