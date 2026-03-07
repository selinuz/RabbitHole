import React from 'react';
import Facilitator from './Facilitator';
import { motion } from 'framer-motion';

const Stage4 = ({ onComplete }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Stage 4: Collaborative Solving</p>
        <h2 className="text-3xl font-bold text-white font-serif">Climbing Out</h2>
        <p className="text-white/70 mt-2">Framing the problem as something to solve together.</p>
      </div>
      
      <Facilitator 
        stage={4} 
        onComplete={onComplete}
      />
    </div>
  );
};

export default Stage4;
