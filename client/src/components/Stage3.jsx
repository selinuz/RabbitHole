import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw } from 'lucide-react';

const TONES = [
  { id: 'gentle', label: 'Gentle', desc: 'Soft, easing in slowly' },
  { id: 'direct', label: 'Direct', desc: 'Clear and straightforward' },
  { id: 'curious', label: 'Curious', desc: 'Open, seeking to understand' },
];

const EMOTIONS = ['Calm', 'Caring', 'Honest', 'Open', 'Firm', 'Warm', 'Patient', 'Clear'];

const FlipCard = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Front */}
        <div
          className="rounded-xl border border-white/15 bg-white/5 p-4"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-white/40 text-xs mb-1">From their side</p>
          <p className="text-white/85 text-sm leading-relaxed">{front}</p>
          <p className="text-white/25 text-xs mt-3 flex items-center gap-1">
            <RotateCcw size={10} /> tap to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl border border-teal-400/30 bg-teal-500/10 p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-teal-300 text-xs mb-1">How this might affect them</p>
          <p className="text-white/85 text-sm leading-relaxed">{back}</p>
        </div>
      </motion.div>
    </div>
  );
};

const Stage3 = ({ stageData, onComplete }) => {
  const { initialInput, situation, preparation } = stageData;
  const [perspectives, setPerspectives] = useState([]);
  const [loadingPerspectives, setLoadingPerspectives] = useState(true);
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);

  useEffect(() => {
    const fetchPerspectives = async () => {
      try {
        const context = `Situation: ${initialInput}. Core issue: ${preparation.coreIssue}. Goal: ${preparation.goal}. Feeling: ${situation.feeling}. Life area: ${situation.lifeArea}.`;
        const res = await fetch('/api/facilitator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 'perspectives', message: context }),
        });
        const data = await res.json();
        setPerspectives(data.perspectives || []);
      } catch {
        setPerspectives([
          { front: 'They may feel caught off guard by this conversation.', back: 'Giving them a moment to process can help them feel respected.' },
          { front: 'They might have pressures you\'re not fully aware of.', back: 'Acknowledging that their life has other demands softens the approach.' },
        ]);
      } finally {
        setLoadingPerspectives(false);
      }
    };
    fetchPerspectives();
  }, []);

  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const canContinue = selectedTone && selectedEmotions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white"
    >
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">2nd Pillar · Open with Empathy</p>
      <h2 className="text-3xl font-bold font-serif mb-2">Their perspective</h2>
      <p className="text-white/50 text-sm mb-8">How might they be experiencing this?</p>

      {/* Perspective flip cards */}
      {loadingPerspectives ? (
        <div className="flex items-center gap-2 text-white/40 mb-8">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Thinking about their side...</span>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {perspectives.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <FlipCard front={p.front} back={p.back} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Tone selector */}
      <div className="mb-8">
        <p className="text-white/70 text-sm mb-4">What tone feels right for opening?</p>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedTone === tone.id
                  ? 'border-teal-400 bg-teal-500/20 text-white'
                  : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80'
              }`}
            >
              <p className="font-medium text-sm">{tone.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{tone.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Emotion tags */}
      <div className="mb-8">
        <p className="text-white/70 text-sm mb-4">Which emotions do you want to carry into this conversation? <span className="text-white/30">(pick a few)</span></p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(emotion => (
            <button
              key={emotion}
              onClick={() => toggleEmotion(emotion)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                selectedEmotions.includes(emotion)
                  ? 'bg-teal-500 border-teal-400 text-white'
                  : 'bg-white/5 border-white/15 text-white/60 hover:border-white/35 hover:text-white/80'
              }`}
            >
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
            onClick={() => onComplete({ tone: selectedTone, emotions: selectedEmotions })}
            className="w-full py-3 bg-teal-500 text-white rounded-2xl font-semibold hover:bg-teal-400 transition-colors"
          >
            Climb to the 3rd Pillar →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stage3;
