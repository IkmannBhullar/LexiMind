import { useEffect, useRef, useState } from "react";
import { Meteors } from "./components/Meteors";
import UploadCard from "./components/UploadCard";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import confetti from "canvas-confetti";


function InnerApp() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

const { gradient, toggleTheme, mode } = useTheme(); // ✅ Add `mode`  
const summaryRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("leximind_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (summary && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [summary]);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", input);
      }

      const res = await fetch("http://localhost:3000/api/summarize", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const finalSummary = data.summary || "No summary returned.";

      const entry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        content: finalSummary,
      };

      const newHistory = [entry, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem("leximind_history", JSON.stringify(newHistory));

      setSummary(finalSummary);

      const y = window.scrollY + window.innerHeight / 3;
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: y / document.body.scrollHeight },
      });
    } catch (err) {
      console.error(err);
      setSummary("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => setSummary("");

  return (
    <div className={`relative min-h-screen ${gradient} text-white transition-colors duration-700`}>
      {/* ☄️ Meteors */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Meteors number={30} />
      </div>

      {/* 🌗 Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 px-4 py-2 text-sm rounded-md bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40 transition"
      >
        Toggle Theme
      </button>
      <p className="absolute top-24 right-6 text-xs text-white/70 italic z-50">
  Mode: <span className="font-semibold text-purple-300">{mode}</span>
</p>


      {/* 👋 Header */}
      <header className="pt-20 pb-6 text-center z-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.55)]">
          LexiMind
        </h1>
        <p className="text-white/80 mt-2 text-base font-light italic">
          Turn documents into clarity
        </p>
      </header>

      {/* 🧠 Upload Card */}
      <main className="flex flex-col items-center px-4 pb-24 z-10">
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-purple-400 via-pink-500 to-teal-400 blur-xl opacity-40 animate-pulse"></div>

          <UploadCard
            input={input}
            setInput={setInput}
            setFile={setFile}
            handleSummarize={handleSummarize}
            loading={loading}
            summary={summary}
            onClear={handleClear}
            summaryRef={summaryRef}
          />
        </div>

        {/* 💾 History (optional) */}
        {history.length > 1 && (
          <div className="mt-12 w-full max-w-3xl bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-white/80">Previous Summaries</h3>
            <ul className="space-y-3 text-sm text-white/70 max-h-60 overflow-y-auto">
              {history.slice(1).map((entry) => (
                <li key={entry.id} className="border-b border-white/10 pb-2">
                  <p className="italic text-xs text-white/50 mb-1">{entry.timestamp}</p>
                  {entry.content.length > 200
                    ? entry.content.slice(0, 200) + "..."
                    : entry.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}