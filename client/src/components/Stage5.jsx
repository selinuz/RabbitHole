import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronLeft } from "lucide-react";

const Stage5 = forwardRef(({ stageData, onFinish, onBack }, ref) => {
  const { situation, preparation, empathy, phrasing } = stageData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      ref={ref}
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
        <h2 className="text-3xl font-semibold font-serif mb-2">
          Your Conversation Plan
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 items-stretch">
        {/* BASE 1 — Core Needs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="rounded-xl px-5 py-6 flex flex-col"
          style={{ backgroundColor: "#F4EDE8", border: "1.5px solid #D66B6D" }}>
          <div className="mb-4">
            <span
              className="text-xs font-bold font-figtree"
              style={{ color: "#D66B6D" }}>
              PILLAR 1
            </span>
            <p
              className="text-sm font-semibold font-figtree mt-0.5"
              style={{ color: "#5a3a3b" }}>
              Core Needs
            </p>
          </div>
          <div className="flex-1 space-y-3">
            {preparation.coreIssue && (
              <div
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "rgba(214,107,109,0.12)",
                  border: "1px solid #D66B6D",
                }}>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#D66B6D" }}>
                  Core Issue
                </p>
                <p
                  className="text-sm leading-relaxed font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {preparation.coreIssue}
                </p>
              </div>
            )}
            {preparation.goal && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(90,58,59,0.07)" }}>
                <p
                  className="text-xs uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#a07070" }}>
                  Your Goal
                </p>
                <p
                  className="text-sm leading-relaxed font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {preparation.goal}
                </p>
              </div>
            )}
            {preparation.outcome && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(90,58,59,0.07)" }}>
                <p
                  className="text-xs uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#a07070" }}>
                  Desired Outcome
                </p>
                <p
                  className="text-sm leading-relaxed font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {preparation.outcome}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* PILLAR 2 — Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-xl px-5 py-6 flex flex-col"
          style={{ backgroundColor: "#F4EDE8", border: "1.5px solid #D66B6D" }}>
          <div className="mb-4">
            <span
              className="text-xs font-bold font-figtree"
              style={{ color: "#D66B6D" }}>
              PILLAR 2
            </span>
            <p
              className="text-sm font-semibold font-figtree mt-0.5"
              style={{ color: "#5a3a3b" }}>
              Strategy
            </p>
          </div>
          <div className="flex-1 space-y-3">
            {empathy.perspective && (
              <div
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "rgba(214,107,109,0.12)",
                  border: "1px solid #D66B6D",
                }}>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#D66B6D" }}>
                  Their side
                </p>
                <p
                  className="text-sm leading-relaxed font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {empathy.perspective}
                </p>
              </div>
            )}
            {empathy.tone && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(90,58,59,0.07)" }}>
                <p
                  className="text-xs uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#a07070" }}>
                  Tone
                </p>
                <p
                  className="text-sm font-semibold font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {empathy.tone.charAt(0).toUpperCase() + empathy.tone.slice(1)}
                </p>
                <p
                  className="text-xs mt-0.5 font-figtree"
                  style={{ color: "#a07070" }}>
                  {empathy.tone === "gentle" && "Soft, easing in slowly"}
                  {empathy.tone === "direct" && "Clear and straightforward"}
                  {empathy.tone === "curious" && "Open, seeking to understand"}
                </p>
              </div>
            )}
            {empathy.emotions?.length > 0 && (
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-1.5 font-figtree"
                  style={{ color: "#a07070" }}>
                  Emotions to bring
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {empathy.emotions.map((emotion) => (
                    <span
                      key={emotion}
                      className="px-2.5 py-1 rounded-full text-xs font-figtree font-medium"
                      style={{ backgroundColor: "#D66B6D", color: "#F4EDE8" }}>
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(Array.isArray(situation.feeling)
              ? situation.feeling.length > 0
              : situation.feeling) && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(90,58,59,0.07)" }}>
                <p
                  className="text-xs uppercase tracking-widest mb-1 font-figtree"
                  style={{ color: "#a07070" }}>
                  Going in feeling
                </p>
                <p
                  className="text-sm leading-relaxed font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  {Array.isArray(situation.feeling)
                    ? situation.feeling.join(" · ")
                    : situation.feeling}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* PILLAR 3 — Your Opener */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-xl px-5 py-6 flex flex-col"
          style={{ backgroundColor: "#F4EDE8", border: "1.5px solid #D66B6D" }}>
          <div className="mb-4">
            <span
              className="text-xs font-bold font-figtree"
              style={{ color: "#D66B6D" }}>
              PILLAR 3
            </span>
            <p
              className="text-sm font-semibold font-figtree mt-0.5"
              style={{ color: "#5a3a3b" }}>
              Your Openers
            </p>
          </div>
          <div className="flex-1 space-y-3">
            {phrasing.instinct && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(90,58,59,0.07)" }}>
                <p
                  className="text-xs uppercase tracking-widest mb-1.5 font-figtree"
                  style={{ color: "#a07070" }}>
                  Your instinct was
                </p>
                <p
                  className="text-sm leading-relaxed italic font-figtree"
                  style={{ color: "#5a3a3b" }}>
                  "{phrasing.instinct}"
                </p>
              </div>
            )}
            {[
              { key: "iStatementText", label: "I-statement" },
              { key: "gottmanText", label: "Soft opening" },
              { key: "framingText", label: "Framing" },
            ].map(
              ({ key, label }) =>
                phrasing[key] && (
                  <div
                    key={key}
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor: "rgba(214,107,109,0.12)",
                      border: "1px solid #D66B6D",
                    }}>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-1.5 font-figtree"
                      style={{ color: "#D66B6D" }}>
                      {label}
                    </p>
                    <p
                      className="text-sm leading-relaxed font-figtree"
                      style={{ color: "#5a3a3b" }}>
                      "{phrasing[key]}"
                    </p>
                  </div>
                ),
            )}
          </div>
        </motion.div>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-4 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 font-figtree">
        I'm ready →
      </button>
    </motion.div>
  );
});

export default Stage5;
