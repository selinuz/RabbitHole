import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const Stage5 = ({ stageData, onRestart }) => {
  const { situation, preparation, empathy, phrasing } = stageData;
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const bases = [
    {
      number: '1',
      label: 'Core Needs',
      color: 'bg-primary/15 shadow-sm',
      labelColor: 'text-accent',
      items: [
        preparation.coreIssue && { key: 'The issue', value: preparation.coreIssue },
        preparation.goal && { key: 'Your goal', value: preparation.goal },
        preparation.outcome && { key: 'Desired outcome', value: preparation.outcome },
      ].filter(Boolean),
    },
    {
      number: '2',
      label: 'Strategy',
      color: 'bg-purple-500/15 shadow-sm',
      labelColor: 'text-purple-300',
      items: [
        situation.feeling && { key: 'Going in feeling', value: situation.feeling },
        empathy.perspective && { key: 'Their side', value: empathy.perspective },
        empathy.tone && { key: 'Tone', value: empathy.tone.charAt(0).toUpperCase() + empathy.tone.slice(1) },
        empathy.emotions?.length && { key: 'Emotions to bring', value: empathy.emotions.join(' · ') },
      ].filter(Boolean),
    },
    {
      number: '3',
      label: 'Your Opener',
      color: 'bg-amber-500/15 shadow-sm',
      labelColor: 'text-amber-300',
      items: [
        phrasing.chosenText && { key: 'Practice saying this', value: `"${phrasing.chosenText}"` },
        phrasing.instinct && { key: 'Your instinct was', value: `"${phrasing.instinct}"` },
      ].filter(Boolean),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6 }}
      className="glass-panel p-8 text-white"
    >
      <div className="text-center mb-10">
        <CheckCircle className="text-primary-hover w-10 h-10 mx-auto mb-4" />
        <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-figtree">4th Pillar · The Bigger Picture</p>
        <h2 className="text-3xl font-bold font-serif mb-2">Your Conversation Compass</h2>
        <p className="text-white/50 text-sm font-figtree">Everything you've built — now in one view.</p>
      </div>

      {/* The 3 bases */}
      <div className="space-y-4 mb-8">
        {bases.map((base, i) => (
          <motion.div
            key={base.number}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className={`rounded-2xl p-5 ${base.color}`}
          >
            <div className="flex items-center gap-2 mb-3 font-figtree">
              <span className={`text-xs font-bold ${base.labelColor} font-figtree`}>BASE {base.number}</span>
              <span className={`text-sm font-semibold ${base.labelColor} font-figtree`}>· {base.label}</span>
            </div>
            <div className="space-y-2">
              {base.items.map(item => (
                <div key={item.key} className="flex items-baseline gap-3 font-figtree">
                  <span className="text-white/30 text-xs w-28 shrink-0 font-figtree">{item.key}</span>
                  <span className="text-white/85 text-sm leading-relaxed font-figtree">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Base 4: Reflection log */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-white/[0.07] p-5 mb-8 shadow-sm font-figtree"
      >
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-figtree">Base 4</p>
        <p className="text-white/70 text-sm font-medium mb-3 font-figtree">The rest is in your hands.</p>
        <p className="text-white/45 text-sm mb-4 font-figtree">Come back after the conversation and record how it went.</p>

        {!reflectionSaved ? (
          <>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="How did it go? What happened? How do you feel now?"
              rows={3}
              className="w-full bg-white/5 rounded-xl p-3 text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all resize-none text-sm mb-3"
            />
            {reflection.trim() && (
              <button
                onClick={() => setReflectionSaved(true)}
                className="px-4 py-2 bg-white/10 text-white/70 rounded-full text-xs hover:bg-white/15 transition-colors"
              >
                Save reflection
              </button>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl p-3 text-white/70 text-sm leading-relaxed font-figtree"
          >
            {reflection}
          </motion.div>
        )}
      </motion.div>

      <button
        onClick={onRestart}
        className="w-full py-2.5 text-white/60 hover:text-white/70 text-sm transition-colors underline underline-offset-4 font-figtree"
      >
        Start another dig
      </button>
    </motion.div>
  );
};

export default Stage5;
