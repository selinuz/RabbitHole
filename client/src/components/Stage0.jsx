import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Stage0 = ({ onComplete }) => {
  const [value, setValue] = useState("");
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ready = wordCount >= 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6 }}
      className="glass-panel p-10 text-white text-center">
      <p className="text-xl text-white/80 mb-6 font">
        What conversation is on your mind?
      </p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write freely."
        rows={5}
        className="w-full bg-transparent resize-none outline-none text-white placeholder-white/25 text-lg leading-relaxed border-b border-white/15 pb-4 focus:border-white/40 transition-colors duration-300"
      />

      <div className="flex items-center justify-between mt-4">
        <span className="text-white/25 text-sm tabular-nums">
          {wordCount > 0
            ? `${wordCount} word${wordCount === 1 ? "" : "s"}`
            : ""}
        </span>

        <AnimatePresence>
          {ready && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => onComplete(value.trim())}
              className="bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent/20 transition-colors">
              Dive in
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {!ready && wordCount > 0 && (
        <p className="text-white/20 text-xs mt-6">
          Keep going — a little more context helps
        </p>
      )}
    </motion.div>
  );
};

export default Stage0;
