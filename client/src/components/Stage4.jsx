import { useState, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ChevronLeft, Mic, MicOff } from "lucide-react";

const Stage4 = forwardRef(({ stageData, onComplete, onBack }, ref) => {
  const { preparation, empathy } = stageData;
  const [instinct, setInstinct] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rewrite, setRewrite] = useState(null);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [fillerValues, setFillerValues] = useState({
    iStatement: {},
    gottman: {},
    framing: {},
  });
  const [micState, setMicState] = useState({
    iStatement: "idle",
    gottman: "idle",
    framing: "idle",
  }); // idle | recording | transcribing | error
  const mediaRecorderRefs = useRef({
    iStatement: null,
    gottman: null,
    framing: null,
  });
  const chunksRefs = useRef({ iStatement: [], gottman: [], framing: [] });

  const handleSubmitInstinct = async () => {
    if (!instinct.trim()) return;
    setSubmitted(true);
    setLoadingRewrite(true);

    try {
      const context = `
        Perspective identified: "${empathy.perspective}".
        Tone chosen: ${empathy.tone}. Emotions to bring: ${empathy.emotions?.join(", ")}.
        Core issue: ${preparation.coreIssue}. Goal: ${preparation.goal}.
        The user's instinct phrase: "${instinct}"
      `;
      const res = await fetch("/api/facilitator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "rewrite", message: context }),
      });
      const data = await res.json();
      setRewrite(data.rewrite || null);
    } catch {
      setRewrite({
        iStatement: `I feel [emotion] when [behavior] happens because [impact], and I'd like to talk about it.`,
        gottman: `I've been thinking about [topic] and how it's affecting me. Can we find a moment to talk about [goal]?`,
        framing: `I want us to be on the same page about [issue] — I think there's [something worth understanding] together.`,
      });
    } finally {
      setLoadingRewrite(false);
    }
  };

  const constructFinalPhrase = (template, fillers) => {
    if (!template) return "";
    const parts = template.split(/(\[.*?\])/g);
    let blankIndex = 0;
    return parts
      .map((part) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          const value = fillers[blankIndex++];
          return value || part;
        }
        return part;
      })
      .join("");
  };

  const countBlanks = (template) => {
    if (!template) return 0;
    return (template.match(/\[.*?\]/g) || []).length;
  };

  const allBlanksFilled = (template, fillers) => {
    const blanks = countBlanks(template);
    return Array.from({ length: blanks }, (_, i) => fillers[i]).every(
      (v) => v && v.trim().length > 0,
    );
  };

  const handleComplete = () => {
    onComplete({
      instinct,
      iStatementText: constructFinalPhrase(
        rewrite.iStatement,
        fillerValues.iStatement,
      ),
      gottmanText: constructFinalPhrase(rewrite.gottman, fillerValues.gottman),
      framingText: constructFinalPhrase(rewrite.framing, fillerValues.framing),
    });
  };

  const canContinue =
    rewrite &&
    allBlanksFilled(rewrite.iStatement, fillerValues.iStatement) &&
    allBlanksFilled(rewrite.gottman, fillerValues.gottman) &&
    allBlanksFilled(rewrite.framing, fillerValues.framing);

  const toggleMic = async (key) => {
    const currentState = micState[key];

    if (currentState === "recording") {
      mediaRecorderRefs.current[key]?.stop();
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
      mediaRecorderRefs.current[key] = mediaRecorder;
      chunksRefs.current[key] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRefs.current[key].push(e.data);
      };

      mediaRecorder.onstart = () =>
        setMicState((prev) => ({ ...prev, [key]: "recording" }));

      mediaRecorder.onstop = async () => {
        setMicState((prev) => ({ ...prev, [key]: "transcribing" }));
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRefs.current[key], { type: mimeType });
        chunksRefs.current[key] = [];

        try {
          const transcribeRes = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": mimeType },
            body: blob,
          });
          if (!transcribeRes.ok) throw new Error("Transcription failed");
          const { transcript } = await transcribeRes.json();

          const template = rewrite?.[key];
          const extractRes = await fetch("/api/facilitator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stage: "extractBlanks",
              message: JSON.stringify({ transcript, template }),
            }),
          });
          const { fillers } = await extractRes.json();

          const fillerMap = {};
          fillers.forEach((val, i) => {
            if (val) fillerMap[i] = val;
          });
          setFillerValues((prev) => ({ ...prev, [key]: fillerMap }));
        } catch (err) {
          console.error("Mic fill error:", err);
        } finally {
          setMicState((prev) => ({ ...prev, [key]: "idle" }));
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      ref={ref}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.40)" }}>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 text-base transition-colors font-figtree">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <p className="text-white/40 text-sm uppercase tracking-widest mb-1 font-figtree">
        3rd Pillar · Phrasing & Rehearsal
      </p>
      <h2 className="text-3xl font-semibold font-serif mb-2">
        Finding the right words
      </h2>

      <p className="text-white/50 text-base mb-8 font-figtree">
        Start with what comes naturally — we'll refine from there.
      </p>

      {/* Step 1: Instinct phrase */}
      {!submitted && (
        <div>
          <p className="text-white/80 text-base mb-4 font-figtree">
            What's the first thing you feel like saying to them?
          </p>
          <textarea
            value={instinct}
            onChange={(e) => setInstinct(e.target.value)}
            placeholder="Don't overthink it — just write what comes to mind..."
            rows={3}
            className="w-full bg-white/5 rounded-xl p-4 text-white placeholder-white/25 outline-none focus:bg-white/10 transition-all resize-none mb-4 text-base font-figtree"
          />
          <button
            onClick={handleSubmitInstinct}
            disabled={!instinct.trim()}
            className="px-6 py-2.5 bg-primary text-white rounded-full text-base font-semibold disabled:opacity-30 hover:bg-primary-hover transition-colors flex items-center gap-2 font-figtree">
            See how this could land <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 2: Side-by-side comparison */}
      {submitted && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}>
            {/* Original */}
            <div className="rounded-xl bg-white/5 p-4 mb-6 shadow-sm font-figtree">
              <p className="text-white/35 text-sm uppercase tracking-wider mb-2 font-figtree">
                What you said
              </p>
              <p className="text-white/80 text-base italic font-figtree">
                "{instinct}"
              </p>
            </div>

            {loadingRewrite ? (
              <div className="flex items-center gap-2 text-white/60 font-figtree">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-base font-figtree">
                  Finding better words...
                </span>
              </div>
            ) : (
              rewrite && (
                <div>
                  {empathy?.perspective && (
                    <div
                      className="mb-5 rounded-xl px-4 py-3.5 flex items-start gap-3"
                      style={{
                        backgroundColor: "transparent",
                        border: "2px solid #D66B6D",
                      }}>
                      <span
                        className="text-xs font-bold uppercase tracking-widest mt-0.5 font-figtree shrink-0"
                        style={{ color: "#D66B6D" }}>
                        Keep in mind
                      </span>
                      <p className="text-white/70 text-base leading-relaxed font-figtree">
                        {empathy.perspective}
                      </p>
                    </div>
                  )}
                  <p className="text-white/60 text-base mb-4 font-figtree">
                    Try all three science-backed techniques — fill in the blanks
                    on each to continue:
                  </p>
                  <div className="space-y-4 mb-6">
                    {[
                      {
                        key: "iStatement",
                        label: "I-statement",
                        sublabel: "Avoids harsh start-ups",
                      },
                      {
                        key: "gottman",
                        label: "Soft opening",
                        sublabel: "Gottman-based start",
                      },
                      {
                        key: "framing",
                        label: "Framing",
                        sublabel: "Builds a shared picture",
                      },
                    ].map(({ key, label, sublabel }) => (
                      <div
                        key={key}
                        className="bg-white/5 rounded-xl p-4 font-figtree">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-semibold uppercase tracking-wider text-accent font-figtree">
                              {label}
                            </span>
                            <span className="text-base text-white/30 font-figtree">
                              {sublabel}
                            </span>
                          </div>
                          <MicButton
                            state={micState[key]}
                            onClick={() => toggleMic(key)}
                          />
                        </div>
                        <div className="text-white/90 text-base leading-relaxed flex flex-wrap items-center gap-y-2 font-figtree">
                          {renderInteractivePhrase(
                            rewrite[key],
                            fillerValues[key],
                            (idx, val) => {
                              setFillerValues((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], [idx]: val },
                              }));
                            },
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {canContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleComplete}
            className="w-full py-4 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 font-figtree">
            See the bigger picture →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const MicButton = ({ state, onClick }) => (
  <button
    onClick={onClick}
    disabled={state === "transcribing"}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      whiteSpace: "nowrap",
      fontFamily: "Figtree, sans-serif",
      border: "none",
      cursor: state === "transcribing" ? "wait" : "pointer",
      background:
        state === "recording" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
      color:
        state === "recording"
          ? "#f87171"
          : state === "transcribing"
            ? "rgba(255,255,255,0.4)"
            : "rgba(255,255,255,0.6)",
    }}>
    {state === "recording" ? (
      <>
        <MicOff size={13} />
        <span>Stop</span>
      </>
    ) : state === "transcribing" ? (
      <>
        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        <span>Listening...</span>
      </>
    ) : (
      <>
        <Mic size={13} />
        <span>Read aloud</span>
      </>
    )}
  </button>
);

const renderInteractivePhrase = (phrase, fillers, onChange) => {
  if (!phrase) return null;
  const parts = phrase.split(/(\[.*?\])/g);
  let blankIndex = 0;

  return parts.map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      const idx = blankIndex++;
      const val = fillers[idx] || "";
      return (
        <input
          key={i}
          type="text"
          value={val}
          onChange={(e) => onChange(idx, e.target.value)}
          placeholder={part}
          className="px-3 py-1 mx-1 outline-none transition-all rounded-full text-base font-medium shadow-inner font-figtree"
          style={{
            width: `${Math.max(val.length || part.length, 4) + 2}ch`,
            backgroundColor: "#F4EDE8",
            color: "#d66b6d",
          }}
        />
      );
    }
    return (
      <span key={i} className="font-figtree">
        {part}
      </span>
    );
  });
};

export default Stage4;
