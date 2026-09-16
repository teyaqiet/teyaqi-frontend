import NewbieStreak from "./NewbieStreak";
import ProStreak from "./ProStreak";
import LegendaryStreak from "./LegendaryStreak";
import { FrozenStreakCelebration } from "./FrozenStreakCelebration"; 
import { StreakLost } from "./StreakLost"; // ⚡ Import your new component context

interface StreakProps {
  days: number;
  status: 'active' | 'frozen' | 'dead'; 
  onContinue: () => void;
}

export default function StreakShowcase({ days, status, onContinue }: StreakProps) {
  // 💀 INTERCEPT 1: If the streak died, cut execution loops and serve the loss card immediately
  if (status === 'dead') {
    return <StreakLost onContinue={onContinue} />;
  }

  // ❄️ INTERCEPT 2: If status is frozen, run the defrosting screen context layout
  if (status === 'frozen') {
    return <FrozenStreakCelebration days={days} onContinue={onContinue} />;
  }

  // Otherwise, route milestones normally
  if (days <= 3) return <NewbieStreak days={days} onContinue={onContinue} />;
  if (days < 20) return <ProStreak days={days} onContinue={onContinue} />;
  return <LegendaryStreak days={days} onContinue={onContinue} />;
}