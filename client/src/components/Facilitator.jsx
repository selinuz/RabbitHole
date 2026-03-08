import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ChevronDown } from "lucide-react";

const Facilitator = ({ stage, initialTheme, onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Initial greeting or summary from AI
    const initFacilitator = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/facilitator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: initialTheme
              ? `I've started with this context: ${initialTheme}`
              : "Let's start the preparation.",
            history: [],
            stage: stage,
          }),
        });
        const data = await response.json();
        setMessages([{ role: "assistant", content: data.reply }]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (messages.length === 0) {
      initFacilitator();
    }
  }, [stage, initialTheme]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: inputValue }];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/facilitator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          history: newMessages,
          stage: stage,
        }),
      });
      const data = await response.json();

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);

      // Simple completion heuristic: If AI says "dig deeper" or "next stage"
      if (
        data.reply.toLowerCase().includes("dig deeper") ||
        data.reply.toLowerCase().includes("next stage")
      ) {
        setCompleted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white/10 text-white rounded-tl-none shadow-sm"
                }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start">
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="animate-spin text-primary-hover" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-auto">
        {completed ? (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onComplete}
            className="w-full p-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg">
            Dig deeper <ChevronDown />
          </motion.button>
        ) : (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Reflect here..."
              className="w-full p-4 bg-white/5 rounded-2xl text-white outline-none focus:bg-white/10 transition-all pr-12 shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-xl text-white hover:bg-primary-hover disabled:opacity-50 transition-all">
              <Send size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Facilitator;
