import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Stage2 = ({ stageData, onComplete }) => {
  const { initialInput, situation } = stageData;
  const [coreIssue, setCoreIssue] = useState('');
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [goal, setGoal] = useState('');
  const [outcome, setOutcome] = useState('');
  const [revealed, setRevealed] = useState(0); // 0=none, 1=core, 2=goal, 3=outcome

  useEffect(() => {
    const fetchCoreIssue = async () => {
      try {
        const context = `Situation: ${initialInput}. Life area: ${situation.lifeArea}. Feeling: ${situation.feeling}. Position: ${situation.timeline}. More context: ${situation.vent || ''}`;
        const res = await fetch('/api/facilitator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 'core_issue', message: context }),
        });
        const data = await res.json();
        setCoreIssue(data.reply);
      } catch {
        setCoreIssue('The core tension in this situation needs clarity.');
      } finally {
        setLoadingIssue(false);
        setTimeout(() => setRevealed(1), 400);
      }
    };
    fetchCoreIssue();
  }, []);

  const handleGoalSubmit = () => {
    if (goal.trim()) setRevealed(3);
  };

  const canContinue = goal.trim() && outcome.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-8 text-white"
    >
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">1st Pillar · Preparation</p>
      <h2 className="text-3xl font-bold font-serif mb-2">Mapping the situation</h2>
      <p className="text-white/50 text-sm mb-8">Before walking in, you need to know what you're carrying.</p>

      <div className="space-y-5">
        {/* Core Issue — AI generated */}
        <AnimatePresence>
          {revealed >= 1 && (
            <motion.div
              key="core"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-teal-400/30 bg-teal-500/10 p-5"
            >
              <p className="text-teal-300 text-xs uppercase tracking-widest mb-2">Core Issue</p>
              {loadingIssue ? (
                <div className="flex items-center gap-2 text-white/40">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm">Identifying the core tension...</span>
                </div>
              ) : (
                <p className="text-white/90 leading-relaxed">{coreIssue}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal — user fills in */}
        <AnimatePresence>
          {revealed >= 1 && !loadingIssue && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-5"
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Your Goal</p>
              <p className="text-white/70 text-sm mb-3">What do you want to achieve in this conversation?</p>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                onBlur={handleGoalSubmit}
                onKeyDown={e => e.key === 'Enter' && handleGoalSubmit()}
                placeholder="e.g. Be heard, reach an agreement, clear the air..."
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desired Outcome — user fills in, revealed after goal */}
        <AnimatePresence>
          {revealed >= 3 && (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-5"
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Desired Outcome</p>
              <p className="text-white/70 text-sm mb-3">What would a good ending look like for both of you?</p>
              <input
                type="text"
                value={outcome}
                onChange={e => setOutcome(e.target.value)}
                placeholder="e.g. Mutual understanding, a clear plan, a repaired connection..."
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white placeholder-white/25 outline-none focus:border-white/40 transition-colors text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue */}
      <AnimatePresence>
        {canContinue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onComplete({ coreIssue, goal: goal.trim(), outcome: outcome.trim() })}
            className="mt-8 w-full py-3 bg-teal-500 text-white rounded-2xl font-semibold hover:bg-teal-400 transition-colors"
          >
            Climb to the 2nd Pillar →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stage2;
