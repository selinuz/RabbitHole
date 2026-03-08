import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const TONES = [
  { id: "gentle", label: "Gentle", desc: "Soft, easing in slowly" },
  { id: "direct", label: "Direct", desc: "Clear and straightforward" },
  { id: "curious", label: "Curious", desc: "Open, seeking to understand" },
];

const EMOTIONS = [
  "Calm",
  "Caring",
  "Honest",
  "Open",
  "Firm",
  "Warm",
  "Patient",
  "Clear",
];

const SUITS = {
  spades: (
    <svg width="30" height="30" viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 5 C50 5 10 40 10 62 C10 78 22 85 35 82 C30 90 25 95 15 98 L85 98 C75 95 70 90 65 82 C78 85 90 78 90 62 C90 40 50 5 50 5Z" />
    </svg>
  ),
  hearts: (
    <svg width="30" height="30" viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 9 50 13 C52 9 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z" />
    </svg>
  ),
  clubs: (
    <svg width="30" height="30" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="35" r="20" />
      <circle cx="28" cy="58" r="20" />
      <circle cx="72" cy="58" r="20" />
      <rect x="42" y="55" width="16" height="30" />
      <rect x="30" y="80" width="40" height="8" rx="4" />
    </svg>
  ),
};

const SUIT_ORDER = ["spades", "hearts", "clubs"];

const FlipCard = ({ front, back, selected, flipped, onSelect, suitKey }) => {
  const suit = SUITS[suitKey];
  const suitColor = selected ? "#F4EDE8" : "#D66B6D";

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 rounded-xl ${selected ? 'bg-primary/5 scale-[1.02] shadow-2xl' : ''
        }`}
      style={{ perspective: 1000 }}
      onClick={onSelect}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full">
        {/* Front */}
        <div
          className="rounded-xl px-6 py-7 transition-all duration-300 flex flex-col h-full"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: selected ? "#D66B6D" : "#F4EDE8",
            border: `1.5px solid ${selected ? "#F4EDE8" : "#D66B6D"}`,
          }}>
          <div style={{ color: suitColor }}>{suit}</div>
          <div className="flex-1 flex flex-col justify-center gap-2 py-4">
            <span
              className="text-xs font-bold leading-none"
              style={{ color: suitColor }}>
              From their side
            </span>
            <p
              className="text-sm leading-loose"
              style={{ color: selected ? "rgba(255,255,255,0.9)" : "#5a3a3b" }}>
              {front}
            </p>
          </div>
          <div className="flex justify-end" style={{ color: suitColor }}>
            <div style={{ transform: "rotate(180deg)" }}>{suit}</div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl px-6 py-7 transition-all duration-300 flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: selected ? "#D66B6D" : "#F4EDE8",
            border: `1.5px solid ${selected ? "#F4EDE8" : "#D66B6D"}`,
          }}>
          <div style={{ color: suitColor }}>{suit}</div>
          <div className="flex-1 flex flex-col justify-center gap-2 py-4">
            <span
              className="text-xs font-bold leading-none"
              style={{ color: suitColor }}>
              How this might affect them
            </span>
            <p
              className="text-sm leading-loose"
              style={{ color: selected ? "rgba(255,255,255,0.9)" : "#5a3a3b" }}>
              {back}
            </p>
          </div>
          <div className="flex justify-end" style={{ color: suitColor }}>
            <div style={{ transform: "rotate(180deg)" }}>{suit}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Stage3 = ({ stageData, onComplete }) => {
  const { initialInput, situation, preparation } = stageData;
  const [perspectives, setPerspectives] = useState([]);
  const [loadingPerspectives, setLoadingPerspectives] = useState(true);
  const [selectedPerspective, setSelectedPerspective] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);

  useEffect(() => {
    const fetchPerspectives = async () => {
      try {
        const context = `Situation: ${initialInput}. Core issue: ${preparation.coreIssue}. Goal: ${preparation.goal}. Feeling: ${situation.feeling}. Life area: ${situation.lifeArea}.`;
        const res = await fetch("/api/facilitator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: "perspectives", message: context }),
        });
        const data = await res.json();
        setPerspectives(data.perspectives || []);
      } catch {
        setPerspectives([
          {
            front: "They may feel caught off guard by this conversation.",
            back: "Giving them a moment to process can help them feel respected.",
          },
          {
            front: "They might have pressures you're not fully aware of.",
            back: "Acknowledging that their life has other demands softens the approach.",
          },
        ]);
      } finally {
        setLoadingPerspectives(false);
      }
    };
    fetchPerspectives();
  }, []);

  const toggleEmotion = (emotion) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion],
    );
  };

  const canContinue =
    selectedPerspective !== null && selectedTone && selectedEmotions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
        2nd Pillar · Open with Empathy
      </p>
      <h2 className="text-3xl font-bold font-serif mb-2">Their perspective</h2>
      <p className="text-white/50 text-sm mb-8">
        Which of these feels most like how they might be experiencing this?
      </p>

      {/* Perspective flip cards */}
      {loadingPerspectives ? (
        <div className="flex items-center gap-2 text-white/60mb-8">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Thinking about their side...</span>
        </div>
      ) : (
        <div
          className="grid items-stretch mb-8"
          style={{
            gridTemplateColumns: `repeat(${perspectives.length}, 1fr)`,
            gap: "12px",
          }}>
          {perspectives.map((p, i) => (
            <motion.div
              key={i}
              className="flex h-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}>
              <FlipCard
                front={p.front}
                back={p.back}
                selected={selectedPerspective === i}
                flipped={flippedCard === i}
                suitKey={SUIT_ORDER[i % SUIT_ORDER.length]}
                onSelect={() => {
                  setFlippedCard((prev) => (prev === i ? null : i));
                  setSelectedPerspective(i);
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Tone selector */}
      <div className="mb-8">
        <p className="text-white/70 text-sm mb-4">
          What tone feels right for opening?
        </p>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-xl text-left transition-all duration-300 ${
                selectedTone === tone.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}>
              <p className="font-medium text-sm">{tone.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{tone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Emotion tags */}
      <div className="mb-8">
        <p className="text-white/70 text-sm mb-4">
          Which emotions do you want to carry into this conversation?{" "}
          <span className="text-white/30">(pick a few)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => toggleEmotion(emotion)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                selectedEmotions.includes(emotion)
                  ? "bg-primary text-white shadow-md"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}>
              {emotion}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {canContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() =>
              onComplete({
                tone: selectedTone,
                emotions: selectedEmotions,
                perspective: perspectives[selectedPerspective].front,
              })
            }
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20">
            Dig into the 3rd Pillar →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stage3;
