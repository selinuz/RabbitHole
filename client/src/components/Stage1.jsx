import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const LIFE_AREAS = ["Work", "Family", "Friends", "Relationship", "Other"];
const FEELINGS = [
  "Anxious",
  "Hurt",
  "Frustrated",
  "Hopeful",
  "Confused",
  "Overwhelmed",
  "Nervous",
  "Sad",
];
const TIMELINES = ["I'm initiating it", "Responding to something"];
const IMPORTANCE = [
  "It's everything right now",
  "Really important",
  "Somewhat important",
  "I'm not sure yet",
];

// The structured follow-up questions, in order
const QUESTIONS = [
  {
    id: "lifeArea",
    text: "What part of your life does this touch?",
    type: "pills",
    options: LIFE_AREAS,
  },
  {
    id: "feeling",
    text: "How does approaching this conversation make you feel?",
    type: "pills",
    options: FEELINGS,
    multi: true,
  },
  {
    id: "timeline",
    text: "Are you bringing this up, or responding to something?",
    type: "pills",
    options: TIMELINES,
  },
  {
    id: "importance",
    text: "How important is this to you right now?",
    type: "pills",
    options: IMPORTANCE,
  },
];

const PillGroup = ({ options, selected, onSelect, multi = false, allowCustom = false, customSelected = [], onCustomAdd, onCustomRemove }) => {
  const [customInput, setCustomInput] = useState("");

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = customInput.trim();
      if (trimmed && onCustomAdd) {
        onCustomAdd(trimmed);
        setCustomInput("");
      }
    }
  };

  const allOptions = [...options, ...customSelected];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-4">
        {allOptions.map((opt) => {
          const isCustom = customSelected.includes(opt);
          const isSelected = multi
            ? (Array.isArray(selected) && selected.includes(opt)) || isCustom
            : selected === opt;
          return (
            <button
              key={opt}
              onClick={() => isCustom ? onCustomRemove && onCustomRemove(opt) : onSelect(opt)}
              className={`px-4 py-2 rounded-full text-base transition-all duration-200 font-figtree flex items-center gap-1.5 ${isSelected
                ? "border-2 border-primary text-primary bg-[#F4EDE8]"
                : "bg-[#F4EDE8]/60 text-black/70 hover:text-black lg:hover:bg-black/5"
                }`}>
              {opt}
              {isCustom && <span className="text-xs opacity-50">✕</span>}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Add your own..."
          className="mt-3 w-full px-4 py-2.5 rounded-xl bg-[#F4EDE8]/60 text-black/80 placeholder-black/30 border border-black/10 focus:outline-none focus:border-primary text-base font-figtree"
        />
      )}
    </div>
  );
};

const Stage1 = forwardRef(({ stageData, onComplete, onBack }, ref) => {
  const { initialInput } = stageData;
  const [activeQuestions, setActiveQuestions] = useState(null); // null = loading
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customFeelings, setCustomFeelings] = useState([]);

  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [draftCustomFeelings, setDraftCustomFeelings] = useState([]);

  // Fetch AI acknowledgement and analyze what's already known
  useEffect(() => {
    const fetchAckAndAnalyze = async () => {
      try {
        const analyzeRes = await fetch("/api/facilitator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: "analyze", message: initialInput }),
        });

        const analyzeData = await analyzeRes.json();
        const inferred = analyzeData.inferred || {};

        // Pre-fill answers with inferred values
        const prefilled = {};
        if (inferred.lifeArea && LIFE_AREAS.includes(inferred.lifeArea))
          prefilled.lifeArea = inferred.lifeArea;
        if (Array.isArray(inferred.feeling) && inferred.feeling.length > 0) {
          prefilled.feeling = inferred.feeling.filter((f) =>
            FEELINGS.includes(f),
          );
          if (prefilled.feeling.length === 0) delete prefilled.feeling;
        }
        if (inferred.timeline && TIMELINES.includes(inferred.timeline))
          prefilled.timeline = inferred.timeline;
        if (inferred.importance && IMPORTANCE.includes(inferred.importance))
          prefilled.importance = inferred.importance;
        setAnswers(prefilled);

        // Only include questions that weren't already answered
        const remaining = QUESTIONS.filter(
          (q) =>
            !prefilled[q.id] ||
            (Array.isArray(prefilled[q.id]) && prefilled[q.id].length === 0),
        );
        setActiveQuestions(remaining);
      } catch {
        setActiveQuestions(QUESTIONS);
      }
    };
    fetchAckAndAnalyze();
  }, [initialInput]);

  const currentQuestion = activeQuestions ? activeQuestions[currentQ] : null;

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
    } else {
      onBack();
    }
  };

  const handlePillSelect = (value) => {
    if (currentQuestion.multi) {
      const current = Array.isArray(answers[currentQuestion.id])
        ? answers[currentQuestion.id]
        : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    } else {
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      setTimeout(() => setCurrentQ((q) => q + 1), 300);
    }
  };

  const openAdjust = () => {
    setDraftAnswers({ ...answers });
    setDraftCustomFeelings([...customFeelings]);
    setAdjusting(true);
  };

  const saveAdjust = () => {
    setAnswers({ ...draftAnswers });
    setCustomFeelings([...draftCustomFeelings]);
    setAdjusting(false);
  };

  const allDone =
    activeQuestions !== null && currentQ >= activeQuestions.length;

  // Merge preset + custom feelings into the feeling field for onComplete
  const buildFinalAnswers = () => {
    const presetFeelings = Array.isArray(answers.feeling) ? answers.feeling : [];
    const allFeelings = [...presetFeelings, ...customFeelings];
    return { ...answers, feeling: allFeelings };
  };

  const isFeelingQuestion = currentQuestion?.id === "feeling";
  const totalSelected = [
    ...(Array.isArray(answers.feeling) ? answers.feeling : []),
    ...customFeelings,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      ref={ref}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-black/80"
      style={{ backgroundColor: "#F4EDE8BB" }}>
      <h2 className="text-3xl font-semibold font-serif mb-8">
        Let's understand the situation
      </h2>

      {/* Questions, one at a time */}
      {activeQuestions === null && (
        <div className="flex items-center gap-3 text-black/50 mb-8">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-base font-figtree">Personalizing your questions...</span>
        </div>
      )}

      {activeQuestions !== null && !allDone && currentQuestion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}>
            <p className="text-black/80 text-lg leading-snug font-figtree">
              {currentQuestion.text}
            </p>

            {currentQuestion.type === "pills" && (
              <PillGroup
                options={currentQuestion.options}
                selected={answers[currentQuestion.id]}
                onSelect={handlePillSelect}
                multi={currentQuestion.multi}
                allowCustom={isFeelingQuestion}
                customSelected={isFeelingQuestion ? customFeelings : []}
                onCustomAdd={(v) => {
                  if (!customFeelings.includes(v)) {
                    setCustomFeelings((prev) => [...prev, v]);
                  }
                }}
                onCustomRemove={(v) =>
                  setCustomFeelings((prev) => prev.filter((f) => f !== v))
                }
              />
            )}

            <div className="flex items-center gap-4 mt-6">
              {currentQuestion.multi && (
                isFeelingQuestion ? totalSelected.length > 0 : (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0)
              ) && (
                <button
                  onClick={() => setCurrentQ((q) => q + 1)}
                  className="px-5 py-2.5 bg-primary text-black/80 rounded-full text-base font-semibold hover:bg-primary-hover transition-colors font-figtree">
                  Continue →
                </button>
              )}
              <button
                onClick={handleBack}
                className="text-black/80 text-base hover:text-black/60 transition-colors font-figtree">
                ← Back
              </button>
            </div>

            {/* Step dots */}
            <div className="flex gap-1.5 mt-4">
              {activeQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i < currentQ
                    ? "w-6 bg-primary-hover"
                    : i === currentQ
                      ? "w-6 bg-white/60"
                      : "w-3 bg-white/15"
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Adjust screen */}
      {allDone && adjusting && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <p className="text-black/80 text-base mb-6 font-figtree">
              Update your answers below, then save.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-black/80 text-sm uppercase tracking-wider mb-2 font-figtree">
                  Area of life
                </p>
                <PillGroup
                  options={LIFE_AREAS}
                  selected={draftAnswers.lifeArea}
                  onSelect={(v) =>
                    setDraftAnswers((p) => ({ ...p, lifeArea: v }))
                  }
                />
              </div>
              <div>
                <p className="text-black/80 text-sm uppercase tracking-wider mb-2 font-figtree">
                  How you're feeling
                </p>
                <PillGroup
                  options={FEELINGS}
                  selected={draftAnswers.feeling}
                  multi={true}
                  allowCustom={true}
                  customSelected={draftCustomFeelings}
                  onCustomAdd={(v) => {
                    if (!draftCustomFeelings.includes(v)) {
                      setDraftCustomFeelings((prev) => [...prev, v]);
                    }
                  }}
                  onCustomRemove={(v) =>
                    setDraftCustomFeelings((prev) => prev.filter((f) => f !== v))
                  }
                  onSelect={(v) => {
                    const current = Array.isArray(draftAnswers.feeling)
                      ? draftAnswers.feeling
                      : [];
                    const updated = current.includes(v)
                      ? current.filter((f) => f !== v)
                      : [...current, v];
                    setDraftAnswers((p) => ({ ...p, feeling: updated }));
                  }}
                />
              </div>
              <div>
                <p className="text-black/80 text-sm uppercase tracking-wider mb-2 font-figtree">
                  Your position
                </p>
                <PillGroup
                  options={TIMELINES}
                  selected={draftAnswers.timeline}
                  onSelect={(v) =>
                    setDraftAnswers((p) => ({ ...p, timeline: v }))
                  }
                />
              </div>
              <div>
                <p className="text-black/80 text-sm uppercase tracking-wider mb-2 font-figtree">
                  Importance
                </p>
                <PillGroup
                  options={IMPORTANCE}
                  selected={draftAnswers.importance}
                  onSelect={(v) =>
                    setDraftAnswers((p) => ({ ...p, importance: v }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveAdjust}
                className="px-5 py-2.5 bg-primary text-white rounded-full text-base font-semibold hover:bg-primary-hover transition-colors font-figtree">
                Save changes
              </button>
              <button
                onClick={() => setAdjusting(false)}
                className="px-5 py-2.5 bg-white/30 text-black/70 rounded-full text-base hover:bg-white/15 transition-colors font-figtree">
                Cancel
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Summary card */}
      {allDone && !adjusting && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="text-black/80 text-base mb-4 font-figtree">Here's what I'm hearing:</p>
            <div className="bg-[#F4EDE8]/5 rounded-2xl p-6 space-y-3 mb-6">
              <SummaryRow label="Area of life" value={answers.lifeArea} />
              <SummaryRow
                label="How you're feeling"
                value={[
                  ...(Array.isArray(answers.feeling) ? answers.feeling : answers.feeling ? [answers.feeling] : []),
                  ...customFeelings,
                ].join(" · ") || undefined}
              />
              <SummaryRow label="Your position" value={answers.timeline} />
              <SummaryRow label="Importance" value={answers.importance} />
            </div>

            {!summaryConfirmed ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setSummaryConfirmed(true)}
                  className="px-5 py-2.5 bg-primary text-black/80 rounded-full text-base font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 font-figtree">
                  That's right
                </button>
                <button
                  onClick={openAdjust}
                  className="px-5 py-2.5 bg-white/10 text-black/80 rounded-full text-base hover:bg-white/15 transition-colors font-figtree">
                  Let me adjust
                </button>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onComplete(buildFinalAnswers())}
                className="w-full py-3 bg-primary text-black/80 rounded-2xl text-lg font-semibold hover:bg-primary-hover transition-colors font-figtree">
                Dig into the 1st Pillar →
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
});

const SummaryRow = ({ label, value }) =>
  value ? (
    <div className="flex items-baseline gap-3">
      <span className="text-black/85 text-base w-40 shrink-0 font-figtree">{label}</span>
      <span className="text-black/100 text-base font-figtree">{value}</span>
    </div>
  ) : null;

export default Stage1;
