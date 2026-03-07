import React, { useState } from 'react';
import Facilitator from './Facilitator';
import { motion } from 'framer-motion';

const Stage1 = ({ initialInput, onComplete }) => {
  const [showSummary, setShowSummary] = useState(false);
  
  // Custom logic for Stage 1: Detect themes if input is long enough
  // In a real app, we might ask Gemini to summarize themes first
  
  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col"
      >
        <div className="mb-6">
          <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Stage 1: Preparation</p>
          <h2 className="text-3xl font-bold text-white font-serif">Clarifying the Situation</h2>
        </div>
        
        <Facilitator 
          stage={1} 
          initialTheme={initialInput} 
          onComplete={onComplete}
        />
      </motion.div>
    </div>
  );
};

export default Stage1;
