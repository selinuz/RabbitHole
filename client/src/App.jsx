import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Stage0 from "./components/Stage0";
import Stage1 from "./components/Stage1";
import Stage2 from "./components/Stage2";
import Stage3 from "./components/Stage3";
import Stage4 from "./components/Stage4";
import Stage5 from "./components/Stage5";

const TOTAL_STAGES = 5;
// How far into the image to travel per stage (0–1). 0.75 = 75% of image height used total.
const BG_TRAVEL = 0.75;

function App() {
  const [stage, setStage] = useState(0);
  const [stageData, setStageData] = useState({
    initialInput: "",
    situation: {},
    preparation: {},
    empathy: {},
    phrasing: {},
  });

  const advanceTo = (nextStage, newData = {}) => {
    setStageData((prev) => ({ ...prev, ...newData }));
    setStage(nextStage);
  };

  const goBack = () => setStage((prev) => Math.max(0, prev - 1));

  // Background pans from 0% to BG_TRAVEL*100% as stages progress
  const bgY = (stage / TOTAL_STAGES) * BG_TRAVEL * 100;

  return (
    <div
      className="h-screen w-screen overflow-hidden flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
        backgroundPosition: `center ${bgY}%`,
        backgroundRepeat: "no-repeat",
        transition: "background-position 1s ease-in-out",
      }}>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Progress sidebar */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-50 items-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="relative flex items-center justify-center">
            {stage === s || (stage === 0 && s === 1) ? (
              <img
                src="/rabbit.png"
                alt="current step"
                className="w-6 h-9 select-none"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.6))" }}
              />
            ) : (
              <div
                className={`w-5 h-5 rounded-full transition-all duration-500 ${
                  stage > s ? "bg-teal-400" : "bg-white/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Single stage shown at a time, fades in/out */}
      <div className="max-w-2xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage0
                onComplete={(input) => advanceTo(1, { initialInput: input })}
              />
            </motion.div>
          )}
          {stage === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage1
                stageData={stageData}
                onComplete={(situation) => advanceTo(2, { situation })}
                onBack={goBack}
              />
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage2
                stageData={stageData}
                onComplete={(preparation) => advanceTo(3, { preparation })}
              />
            </motion.div>
          )}
          {stage === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage3
                stageData={stageData}
                onComplete={(empathy) => advanceTo(4, { empathy })}
              />
            </motion.div>
          )}
          {stage === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage4
                stageData={stageData}
                onComplete={(phrasing) => advanceTo(5, { phrasing })}
              />
            </motion.div>
          )}
          {stage === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}>
              <Stage5
                stageData={stageData}
                onRestart={() => {
                  setStageData({
                    initialInput: "",
                    situation: {},
                    preparation: {},
                    empathy: {},
                    phrasing: {},
                  });
                  setStage(0);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
