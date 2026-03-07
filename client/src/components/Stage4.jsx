import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

const Stage4 = ({ stageData, onComplete }) => {
  const { situation, preparation, empathy } = stageData;
  const [instinct, setInstinct] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rewrite, setRewrite] = useState(null);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [chosenPhrase, setChosenPhrase] = useState(null);

  const handleSubmitInstinct = async () => {
    if (!instinct.trim()) return;
    setSubmitted(true);
    setLoadingRewrite(true);

    try {
      const context = `
        Tone chosen: ${empathy.tone}. Emotions to bring: ${empathy.emotions?.join(', ')}.
        Core issue: ${preparation.coreIssue}. Goal: ${preparation.goal}.
        The user's instinct phrase: "${instinct}"
      `;
      const res = await fetch('/api/facilitator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'rewrite', message: context }),
      });
      const data = await res.json();
      setRewrite(data.rewrite || null);
    } catch {
      setRewrite({
        iStatement: `I feel ${situation.feeling?.toLowerCase() || 'affected'} when this happens, and I'd like us to talk about it.`,
        gottman: `I've been thinking about something important to me. Can we find a moment to talk?`,
        framing: `I want us to be on the same page about this — I think there's something worth understanding together.`,
      });
    } finally {
      setLoadingRewrite(false);
    }
  };

  const canContinue = !!chosenPhrase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white"
    >
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">3rd Pillar · Phrasing & Rehearsal</p>
      <h2 className="text-3xl font-bold font-serif mb-2">Finding the right words</h2>
      <p className="text-white/50 text-sm mb-8">Start with what comes naturally — we'll refine from there.</p>

      {/* Step 1: Instinct phrase */}
      {!submitted && (
        <div>
          <p className="text-white/80 mb-4">What's the first thing you feel like saying to them?</p>
          <textarea
            value={instinct}
            onChange={e => setInstinct(e.target.value)}
            placeholder="Don't overthink it — just write what comes to mind..."
            rows={3}
            className="w-full bg-white/5 border border-white/15 rounded-xl p-4 text-white placeholder-white/25 outline-none focus:border-white/35 transition-colors resize-none mb-4"
          />
          <button
            onClick={handleSubmitInstinct}
            disabled={!instinct.trim()}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-full text-sm font-semibold disabled:opacity-30 hover:bg-teal-400 transition-colors flex items-center gap-2"
          >
            See how this could land <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 2: Side-by-side comparison */}
      {submitted && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Original */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
              <p className="text-white/35 text-xs uppercase tracking-wider mb-2">What you said</p>
              <p className="text-white/80 italic">"{instinct}"</p>
            </div>

            {loadingRewrite ? (
              <div className="flex items-center gap-2 text-white/40">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Finding better words...</span>
              </div>
            ) : rewrite && (
              <div>
                <p className="text-white/60 text-sm mb-4">Here are three science-backed alternatives — tap one to practice with it:</p>
                <div className="space-y-3 mb-6">
                  <PhraseCard
                    label="I-statement"
                    sublabel="Avoids harsh start-ups"
                    phrase={rewrite.iStatement}
                    selected={chosenPhrase === 'iStatement'}
                    onSelect={() => setChosenPhrase('iStatement')}
                  />
                  <PhraseCard
                    label="Soft opening"
                    sublabel="Gottman-based start"
                    phrase={rewrite.gottman}
                    selected={chosenPhrase === 'gottman'}
                    onSelect={() => setChosenPhrase('gottman')}
                  />
                  <PhraseCard
                    label="Framing"
                    sublabel="Builds a shared picture"
                    phrase={rewrite.framing}
                    selected={chosenPhrase === 'framing'}
                    onSelect={() => setChosenPhrase('framing')}
                  />
                </div>

                {chosenPhrase && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-teal-500/10 border border-teal-400/30 rounded-xl p-4 mb-6"
                  >
                    <p className="text-teal-300 text-xs mb-1 uppercase tracking-wider">Your chosen opener</p>
                    <p className="text-white/90 text-sm leading-relaxed">"{rewrite[chosenPhrase]}"</p>
                    <p className="text-white/35 text-xs mt-3">Say this out loud a few times — notice how it feels.</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {canContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onComplete({
              instinct,
              chosenPhrase,
              chosenText: rewrite?.[chosenPhrase] || '',
            })}
            className="w-full py-3 bg-teal-500 text-white rounded-2xl font-semibold hover:bg-teal-400 transition-colors"
          >
            See the bigger picture →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PhraseCard = ({ label, sublabel, phrase, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full text-left rounded-xl border p-4 transition-all ${
      selected
        ? 'border-teal-400 bg-teal-500/15 text-white'
        : 'border-white/15 bg-white/5 text-white/75 hover:border-white/30'
    }`}
  >
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">{label}</span>
      <span className="text-xs text-white/30">{sublabel}</span>
    </div>
    <p className="text-sm leading-relaxed">"{phrase}"</p>
  </button>
);

export default Stage4;
