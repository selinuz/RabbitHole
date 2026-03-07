import React from 'react';
import Facilitator from './Facilitator';
import { motion } from 'framer-motion';

const Stage3 = ({ onComplete }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Stage 3: Active Listening</p>
        <h2 className="text-3xl font-bold text-white font-serif">Preparing to Hear</h2>
        <p className="text-white/70 mt-2">Focus on how you will receive their perspective.</p>
      </div>
      
      <Facilitator 
        stage={3} 
        onComplete={onComplete}
      />
    </div>
  );
};

export default Stage3;
