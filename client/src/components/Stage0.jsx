import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

const Stage0 = ({ onComplete }) => {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const hasReceivedResults = useRef(false);
  const isRetrying = useRef(false);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ready = wordCount >= 15;

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const startSession = (retry = false) => {
      if (!retry) {
        hasReceivedResults.current = false;
        isRetrying.current = false;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-US";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            hasReceivedResults.current = true;
            isRetrying.current = false; // Successfully joined a session
            setValue((prev) => {
              const separator = prev && !prev.endsWith(" ") ? " " : "";
              return prev + separator + finalTranscript;
            });
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);

          if (event.error === 'network') {
            if (!hasReceivedResults.current && !isRetrying.current) {
              console.warn("Network error detected, attempting one silent retry...");
              isRetrying.current = true;
              startSession(true);
              return;
            }
            if (!hasReceivedResults.current) {
              alert("Connection lost. Please try again or check your internet.");
            }
          } else if (event.error === 'not-allowed') {
            alert("Microphone access denied. Please check your browser permissions.");
          }

          setIsRecording(false);
          isRetrying.current = false;
        };

        recognition.onend = () => {
          if (!isRetrying.current) {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsRecording(false);
      }
    };

    startSession();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6 }}
      className="glass-panel p-10 text-white text-center max-w-xl mx-auto shadow-2xl"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >

      <p className="text-xl text-white mb-8 font-light">
        What conversation is on your mind right now?
      </p>

      <div className="space-y-6">
        <div className="relative group">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your thoughts here..."
            rows={4}
            className="w-full bg-white/10 rounded-2xl p-6 text-white placeholder-white/40 text-lg leading-relaxed outline-none focus:bg-white/[0.15] transition-all duration-300 resize-none"
          />
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Recording</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">OR</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={toggleRecording}
            className={`group flex flex-col items-center gap-3 p-7 rounded-2xl transition-all duration-500 w-full max-w-[280px] ${isRecording
              ? "bg-primary/20 text-primary shadow-[0_0_40px_rgba(214,107,109,0.2)]"
              : "bg-white/10 text-white/70 hover:text-white lg:hover:bg-white/15"
              }`}
          >
            <div className={`p-4 rounded-full transition-all duration-500 ${isRecording ? "bg-primary/30 text-primary" : "bg-white/10 text-white/50 group-hover:text-white"}`}>
              {isRecording ? <MicOff size={32} className="animate-pulse" /> : <Mic size={32} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                {isRecording ? "Listening to you..." : "Rant Out Loud"}
              </span>
              {!isRecording && <span className="text-[10px] text-white/40 font-medium">Use your voice</span>}
            </div>
          </button>

          <AnimatePresence>
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col items-center gap-4"
              >
                <button
                  onClick={() => {
                    if (isRecording) recognitionRef.current.stop();
                    onComplete(value.trim());
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-primary/30 text-xl"
                >
                  Dive in →
                </button>
                <span className="text-white/50 text-xs tabular-nums font-semibold tracking-wide">
                  {wordCount} words shared
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!ready && wordCount > 0 && (
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
              A few more words to find the depth...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Stage0;
