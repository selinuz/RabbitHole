import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Stage0 from './components/Stage0';
import Stage1 from './components/Stage1';
import Stage2 from './components/Stage2';
import Stage3 from './components/Stage3';
import Stage4 from './components/Stage4';
import Stage5 from './components/Stage5';

const STAGE_COUNT = 5;

function App() {
  const [stage, setStage] = useState(0);
  // stageData accumulates context across stages
  const [stageData, setStageData] = useState({
    initialInput: '',   // raw entry from Stage 0
    situation: {},      // Stage 1 structured answers
    preparation: {},    // Stage 2 core issue / goal / outcome
    empathy: {},        // Stage 3 perspective + tone
    phrasing: {},       // Stage 4 rewritten statements
  });

  const advanceTo = (nextStage, newData = {}) => {
    setStageData(prev => ({ ...prev, ...newData }));
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBackgroundPosition = () => `0% ${(stage / STAGE_COUNT) * 100}%`;

  return (
    <div
      className="min-h-screen rabbit-hole-bg flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      style={{ backgroundPosition: getBackgroundPosition() }}
    >
      {/* Progress dots — hidden on home */}
      {stage > 0 && stage < 6 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                stage >= s ? 'w-8 bg-teal-400' : 'w-3 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <Stage0
              key="stage0"
              onComplete={(input) => advanceTo(1, { initialInput: input })}
            />
          )}
          {stage === 1 && (
            <Stage1
              key="stage1"
              stageData={stageData}
              onComplete={(situation) => advanceTo(2, { situation })}
            />
          )}
          {stage === 2 && (
            <Stage2
              key="stage2"
              stageData={stageData}
              onComplete={(preparation) => advanceTo(3, { preparation })}
            />
          )}
          {stage === 3 && (
            <Stage3
              key="stage3"
              stageData={stageData}
              onComplete={(empathy) => advanceTo(4, { empathy })}
            />
          )}
          {stage === 4 && (
            <Stage4
              key="stage4"
              stageData={stageData}
              onComplete={(phrasing) => advanceTo(5, { phrasing })}
            />
          )}
          {stage === 5 && (
            <Stage5
              key="stage5"
              stageData={stageData}
              onRestart={() => {
                setStageData({ initialInput: '', situation: {}, preparation: {}, empathy: {}, phrasing: {} });
                setStage(0);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
