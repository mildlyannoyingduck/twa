import { CalendarRange, CheckCircle2, FileBarChart2, Hourglass } from 'lucide-react';
import { motion } from 'motion/react';
import { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: typeof CalendarRange }[] = [
  { id: 'timetable', label: 'Timetable', icon: CalendarRange },
  { id: 'papers', label: 'Papers', icon: FileBarChart2 },
  { id: 'day', label: 'Day', icon: CheckCircle2 },
  { id: 'countdown', label: 'Countdown', icon: Hourglass },
];

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-40 px-4">
      <nav
        aria-label="Primary navigation"
        className="ios-glass-strong pointer-events-auto mx-auto grid h-[60px] max-w-md grid-cols-4 items-center rounded-full px-1.5"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-full transition-colors duration-150 ${
                isActive
                  ? 'text-[#07142B] dark:text-white'
                  : 'text-[#0B234A]/65 hover:text-[#07142B] dark:text-blue-200/65 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeDockPill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] dark:bg-blue-400/25 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                />
              )}
              <Icon
                className={`relative z-10 h-[18px] w-[18px] ${
                  isActive ? 'stroke-[2.25]' : 'stroke-[1.7]'
                }`}
              />
              <span className="relative z-10 text-[10px] font-medium tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
