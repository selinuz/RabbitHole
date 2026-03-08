import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

const Stage0 = ({ onComplete }) => {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ready = wordCount >= 15;

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstart = () => setIsRecording(true);

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        setIsTranscribing(true);
        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": mimeType },
            body: blob,
          });

          if (!response.ok) throw new Error("Transcription failed");

          const { transcript } = await response.json();
          if (transcript) {
            setValue((prev) => {
              const separator = prev && !prev.endsWith(" ") ? " " : "";
              return prev + separator + transcript;
            });
          }
        } catch (err) {
          console.error("Transcription error:", err);
          alert("Transcription failed. Please try again or type instead.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      if (err.name === "NotAllowedError") {
        alert(
          "Microphone access denied. Please check your browser permissions.",
        );
      } else {
        console.error("Failed to start recording:", err);
        alert("Could not access your microphone. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6 }}
      className="glass-panel p-8 text-black text-center"
      style={{ backgroundColor: "#F4EDE8BB" }}>
      <h2 className="text-3xl font-semibold font-serif mb-8 text-black/70">
        What conversation is on your mind right now?
      </h2>

      <div className="space-y-6">
        <div className="relative group">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your thoughts here..."
            rows={4}
            className="w-full bg-[#F4EDE8]/70 rounded-2xl p-4 text-black/50 placeholder-black/40 text-base leading-relaxed outline-none bg-[#F4EDE8]/70 transition-all duration-300 resize-none font-figtree"
          />
          {(isRecording || isTranscribing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 flex items-center gap-2 bg-black/5 backdrop-blur-md px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F4EDE8]/70"></span>
              </span>
              <span className="text-sm text-black/40 font-bold uppercase tracking-wider font-figtree">
                {isTranscribing ? "Transcribing..." : "Recording"}
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-black/40 flex-1" />
          <span className="text-black/40 text-md uppercase tracking-[0.3em] font-bold">
            OR
          </span>
          <div className="h-px bg-black/40 flex-1" />
        </div>

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`group flex flex-col items-center gap-3 p-7 rounded-2xl transition-all duration-500 w-full max-w-[280px] ${
              isRecording
                ? "bg-[#F4EDE8]/70 text-black/50 shadow-[0_0_40px_rgba(214,107,109,0.2)]"
                : isTranscribing
                  ? "bg-[#F4EDE8]/50 text-black/30 cursor-not-allowed"
                  : "bg-[#F4EDE8]/30 text-black/70 hover:text-black/100 lg:hover:bg-[#F4EDE8]/60"
            } font-figtree`}>
            <div
              className={`p-4 rounded-full transition-all duration-500 ${isRecording ? "bg-[#F4EDE8]/100 text-black/40" : "bg-[#F4EDE8]/10 text-black/50 group-hover:text-black"}`}>
              {isRecording ? (
                <MicOff size={32} className="animate-pulse" />
              ) : (
                <Mic size={32} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-black/60 uppercase tracking-[0.2em]">
                {isRecording
                  ? "Press to stop"
                  : isTranscribing
                    ? "Processing..."
                    : "Rant Out Loud"}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    if (isRecording) mediaRecorderRef.current?.stop();
                    onComplete(value.trim());
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-primary/30 text-lg font-figtree">
                  Dive in →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!ready && wordCount > 0 && (
            <p className="text-black/60 text-sm font-medium font-figtree">
              A few more details please!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Stage0;
