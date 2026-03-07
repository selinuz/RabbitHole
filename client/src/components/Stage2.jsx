import React from 'react';
import Facilitator from './Facilitator';
import { motion } from 'framer-motion';

const Stage2 = ({ onComplete }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Stage 2: Opening with Empathy</p>
        <h2 className="text-3xl font-bold text-white font-serif">Bridging the Gap</h2>
        <p className="text-white/70 mt-2">Conversations start better when the other person feels understood.</p>
      </div>
      
      <Facilitator 
        stage={2} 
        onComplete={onComplete}
      />
    </div>
  );
};

export default Stage2;
