import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Circle, MessageCircle, Heart, Lightbulb, CheckCircle } from 'lucide-react';
import Stage1 from './components/Stage1';
import Stage2 from './components/Stage2';
import Stage3 from './components/Stage3';
import Stage4 from './components/Stage4';

const stages = [
  { id: 1, name: 'Preparation', icon: Circle, color: 'dark', component: Stage1 },
  { id: 2, name: 'Opening with Empathy', icon: Heart, color: 'medium', component: Stage2 },
  { id: 3, name: 'Active Listening', icon: MessageCircle, color: 'light', component: Stage3 },
  { id: 4, name: 'Collaborative Solving', icon: Lightbulb, color: 'bright', component: Stage4 },
];

function App() {
  const [stage, setStage] = useState(0); // 0 is Home
  const [userInput, setUserInput] = useState('');
  
  const handleStart = () => {
    if (userInput.trim()) {
      setStage(1);
    }
  };

  const getBackgroundPosition = () => {
    return `${(stage / (stages.length)) * 100}%`;
  };

  return (
    <div 
      className="min-h-screen rabbit-hole-bg flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      style={{ backgroundPosition: `0% ${getBackgroundPosition()}` }}
    >
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {stage === 0 ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 text-white text-center"
            >
              <h1 className="text-5xl font-bold mb-6 font-serif">RabbitHole</h1>
              <p className="text-lg mb-8 opacity-80">What conversation is on your mind?</p>
              
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe the situation briefly..."
                className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-xl mb-6 focus:ring-2 focus:ring-teal-300 outline-none text-white placeholder-white/40"
              />
              
              <button
                onClick={handleStart}
                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition-colors"
                disabled={!userInput.trim()}
              >
                Start the climb
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="facilitator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8"
            >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex gap-2">
                    {stages.map((s) => (
                      <div 
                        key={s.id}
                        className={`h-2 w-12 rounded-full transition-colors ${stage >= s.id ? 'bg-teal-400' : 'bg-white/20'}`}
                      />
                    ))}
                 </div>
                 <span className="text-white/60 text-sm">Stage {stage} of 4</span>
              </div>
              
              <div className="text-white min-h-[400px]">
                {stage === 5 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <CheckCircle className="text-teal-400 w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold mb-4 font-serif">You've climbed out!</h2>
                    <p className="text-xl opacity-80 mb-8">You now have a clear path for your conversation.</p>
                    
                    <div className="bg-white/10 rounded-2xl p-6 text-left border border-white/20">
                      <h3 className="text-xl font-semibold mb-4 text-teal-300">Conversation Compass</h3>
                      <div className="space-y-4 text-white/90">
                        <p><strong>Intention:</strong> Clarified through your reflections.</p>
                        <p><strong>Approach:</strong> Empathy-first opening.</p>
                        <p><strong>Mindset:</strong> Active listening and collaborative solving.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setStage(0)}
                      className="mt-8 text-white/60 hover:text-white underline"
                    >
                      Start another climb
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {stage === 1 && <Stage1 initialInput={userInput} onComplete={() => setStage(2)} />}
                    {stage === 2 && <Stage2 onComplete={() => setStage(3)} />}
                    {stage === 3 && <Stage3 onComplete={() => setStage(4)} />}
                    {stage === 4 && <Stage4 onComplete={() => setStage(5)} />}
                  </>
                )}
              </div>

              {stage > 0 && stage < 5 && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStage(prev => prev + 1)}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg"
                  >
                    {stage === 4 ? 'Finish the climb' : 'Climb higher'} <ChevronUp size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Path */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-40">
        {stages.slice().reverse().map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.id}
              className={`p-3 rounded-full border-2 transition-all ${stage === s.id ? 'border-teal-400 text-teal-400 scale-125 opacity-100' : 'border-white/20 text-white'}`}
            >
              <Icon size={24} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
