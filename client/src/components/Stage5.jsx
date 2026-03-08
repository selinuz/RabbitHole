import { motion } from "framer-motion";
import { CheckCircle, ChevronLeft } from "lucide-react";

const Stage5 = ({ stageData, onRestart, onBack }) => {
  const { situation, preparation, empathy, phrasing } = stageData;
const bases = [
    {
      number: "1",
      label: "Core Needs",
      color: "bg-primary/15 shadow-sm",
      labelColor: "text-accent",
      items: [
        preparation.coreIssue && {
          key: "The issue",
          value: preparation.coreIssue,
        },
        preparation.goal && { key: "Your goal", value: preparation.goal },
        preparation.outcome && {
          key: "Desired outcome",
          value: preparation.outcome,
        },
      ].filter(Boolean),
    },
    {
      number: "2",
      label: "Strategy",
      color: "bg-purple-500/15 shadow-sm",
      labelColor: "text-purple-300",
      items: [
        (Array.isArray(situation.feeling) ? situation.feeling.length > 0 : situation.feeling) && {
          key: "Going in feeling",
          value: Array.isArray(situation.feeling) ? situation.feeling.join(" · ") : situation.feeling,
        },
        empathy.perspective && {
          key: "Their side",
          value: empathy.perspective,
        },
        empathy.tone && {
          key: "Tone",
          value: empathy.tone.charAt(0).toUpperCase() + empathy.tone.slice(1),
        },
        empathy.emotions?.length && {
          key: "Emotions to bring",
          value: empathy.emotions.join(" · "),
        },
      ].filter(Boolean),
    },
    {
      number: "3",
      label: "Your Opener",
      color: "bg-amber-500/15 shadow-sm",
      labelColor: "text-amber-300",
      items: [
        phrasing.chosenText && {
          key: "Practice saying this",
          value: `"${phrasing.chosenText}"`,
        },
        phrasing.instinct && {
          key: "Your instinct was",
          value: `"${phrasing.instinct}"`,
        },
      ].filter(Boolean),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6 }}
      className="glass-panel p-8 text-white">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 text-base transition-colors font-figtree">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div className="text-center mb-10">
        <CheckCircle className="text-primary-hover w-10 h-10 mx-auto mb-4" />
        <h2 className="text-3xl font-semibold font-serif mb-2">
          Your Conversation Compass
        </h2>
        <p className="text-white/50 text-base font-figtree">
          Everything you've built — now in one view.
        </p>
      </div>

      {/* The 3 bases */}
      <div className="space-y-4 mb-8">
        {bases.map((base, i) => (
          <motion.div
            key={base.number}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className={`rounded-2xl p-5 ${base.color}`}>
            <div className="flex items-center gap-2 mb-3 font-figtree">
              <span className={`text-sm font-bold ${base.labelColor} font-figtree`}>
                BASE {base.number}
              </span>
              <span className={`text-base font-semibold ${base.labelColor} font-figtree`}>
                · {base.label}
              </span>
            </div>
            <div className="space-y-2">
              {base.items.map(item => (
                <div key={item.key} className="flex items-baseline gap-3 font-figtree">
                  <span className="text-white/30 text-sm w-28 shrink-0 font-figtree">{item.key}</span>
                  <span className="text-white/85 text-base leading-relaxed font-figtree">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

<button
        onClick={onRestart}
        className="w-full py-2.5 text-white/60 hover:text-white/70 text-base transition-colors underline underline-offset-4 font-figtree"
      >
        Start another dig
      </button>
    </motion.div>
  );
};

export default Stage5;
