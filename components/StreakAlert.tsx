import { motion, AnimatePresence } from 'framer-motion';

export default function StreakAlert({ status, isOpen, onConfirm }) {
  if (!isOpen) return null;

  const isReset = status === 'reset';
  const isFrozen = status === 'warning_freeze_available';
  const isUp = status === 'incremented';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="text-6xl mb-4">
          {isReset ? '🌑' : isFrozen ? '❄️' : '🔥'}
        </div>
        
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
          {isReset ? 'Streak Lost!' : isFrozen ? 'Streak Frozen!' : 'Streak Up!'}
        </h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {isReset 
            ? "You missed a day and your streak reset to 0. Time to start a new legacy!"
            : isFrozen 
            ? "Your streak was about to break, but you can use a Freeze Shield to save it!"
            : "Your streak is growing! Keep the momentum going."}
        </p>

        <button
          onClick={onConfirm}
          className={`w-full py-4 font-black rounded-2xl transition-all active:scale-95 uppercase italic tracking-widest ${
            isFrozen ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-white text-slate-950'
          }`}
        >
          {isReset ? 'Start Fresh' : isFrozen ? 'Use Freeze Shield' : 'Awesome!'}
        </button>
      </motion.div>
    </div>
  );
}