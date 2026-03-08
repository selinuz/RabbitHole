import { useState, useEffect } from "react";
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

const PillGroup = ({ options, selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
          selected === opt
            ? "bg-primary text-white"
            : "bg-white/5 text-white/70 hover:text-white lg:hover:bg-white/10"
        }`}>
        {opt}
      </button>
    ))}
  </div>
);

const Stage1 = ({ stageData, onComplete, onBack }) => {
  const { initialInput } = stageData;
  const [activeQuestions, setActiveQuestions] = useState(null); // null = loading
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState({});

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
        if (inferred.lifeArea) prefilled.lifeArea = inferred.lifeArea;
        if (inferred.feeling) prefilled.feeling = inferred.feeling;
        if (inferred.timeline) prefilled.timeline = inferred.timeline;
        if (inferred.importance) prefilled.importance = inferred.importance;
        setAnswers(prefilled);

        // Only include questions that weren't already answered
        const remaining = QUESTIONS.filter((q) => !prefilled[q.id]);
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
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => setCurrentQ((q) => q + 1), 300);
  };

  const openAdjust = () => {
    setDraftAnswers({ ...answers });
    setAdjusting(true);
  };

  const saveAdjust = () => {
    setAnswers({ ...draftAnswers });
    setAdjusting(false);
  };

  const allDone =
    activeQuestions !== null && currentQ >= activeQuestions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
        Figuring out the issue
      </p>
      <h2 className="text-3xl font-bold font-serif mb-8">
        Let's understand the situation
      </h2>

      {/* Questions, one at a time */}
      {activeQuestions === null && (
        <div className="flex items-center gap-3 text-white/50 mb-8">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Personalizing your questions...</span>
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
            <p className="text-white/90 text-lg leading-snug">
              {currentQuestion.text}
            </p>

            {currentQuestion.type === "pills" && (
              <PillGroup
                options={currentQuestion.options}
                selected={answers[currentQuestion.id]}
                onSelect={handlePillSelect}
              />
            )}

            {/* Back button */}
            <button
              onClick={handleBack}
              className="mt-6 text-white/35 text-sm hover:text-white/60 transition-colors">
              ← Back
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5 mt-4">
              {activeQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i < currentQ
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
            <p className="text-white/50 text-sm mb-6">
              Update your answers below, then save.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
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
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                  How you're feeling
                </p>
                <PillGroup
                  options={FEELINGS}
                  selected={draftAnswers.feeling}
                  onSelect={(v) =>
                    setDraftAnswers((p) => ({ ...p, feeling: v }))
                  }
                />
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
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
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
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
                className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors">
                Save changes
              </button>
              <button
                onClick={() => setAdjusting(false)}
                className="px-5 py-2.5 bg-white/10 text-white/70 rounded-full text-sm hover:bg-white/15 transition-colors">
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
            <p className="text-white/50 text-sm mb-4">
              Here's what I'm hearing:
            </p>
            <div className="bg-white/5 rounded-2xl p-6 space-y-3 mb-6">
              <SummaryRow label="Area of life" value={answers.lifeArea} />
              <SummaryRow label="How you're feeling" value={answers.feeling} />
              <SummaryRow label="Your position" value={answers.timeline} />
              <SummaryRow label="Importance" value={answers.importance} />
            </div>

            {!summaryConfirmed ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setSummaryConfirmed(true)}
                  className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/10">
                  That's right
                </button>
                <button
                  onClick={openAdjust}
                  className="px-5 py-2.5 bg-white/10 text-white/70 rounded-full text-sm hover:bg-white/15 transition-colors">
                  Let me adjust
                </button>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onComplete(answers)}
                className="w-full py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover transition-colors">
                Dig into the 1st Pillar →
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const SummaryRow = ({ label, value }) =>
  value ? (
    <div className="flex items-baseline gap-3">
      <span className="text-white/35 text-xs w-28 shrink-0">{label}</span>
      <span className="text-white/85 text-sm">{value}</span>
    </div>
  ) : null;

export default Stage1;
