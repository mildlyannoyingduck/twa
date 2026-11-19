import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { CountdownView } from './components/CountdownView';
import { DayView } from './components/DayView';
import { LockOverlayPreview } from './components/LockOverlayPreview';
import { PapersView } from './components/PapersView';
import { TimetableView } from './components/TimetableView';
import { TopBar } from './components/TopBar';
import { useScheduleEngine } from './hooks/useScheduleEngine';
import { syncNativeBlockerAndAlarms } from './native/thisWeekBridge';
import { DayCompletionLog, PaperEntry, TabId, TimetableSlot } from './types';
import { getDayOfWeek } from './utils/dateUtils';
import {
  loadDailyLogs,
  loadManualLockUntil,
  loadPapers,
  loadSlots,
  loadThemeDark,
  saveDailyLogs,
  saveManualLockUntil,
  savePapers,
  saveSlots,
  saveThemeDark,
} from './utils/storage';
import { getDurationMinutes } from './utils/timeUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('day');
  const [isDark, setIsDark] = useState<boolean>(() => loadThemeDark());
  const [blockerModalOpen, setBlockerModalOpen] = useState<boolean>(false);

  const [slots, setSlots] = useState<TimetableSlot[]>(() => loadSlots());
  const [papers, setPapers] = useState<PaperEntry[]>(() => loadPapers());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DayCompletionLog>>(() =>
    loadDailyLogs(),
  );
  const [manualLockUntil, setManualLockUntil] = useState<number>(() =>
    loadManualLockUntil(),
  );

  const clearExpiredManualLock = useCallback(() => {
    setManualLockUntil(0);
    saveManualLockUntil(0);
  }, []);

  const { activeLock, reminderToast, dismissReminderToast } = useScheduleEngine(
    slots,
    manualLockUntil,
    clearExpiredManualLock,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemeDark(isDark);
  }, [isDark]);

  // Sync slots & lock state to localStorage + native Samsung A07 Capacitor service
  useEffect(() => {
    saveSlots(slots);
    syncNativeBlockerAndAlarms(slots, manualLockUntil);
  }, [slots, manualLockUntil]);

  useEffect(() => {
    savePapers(papers);
  }, [papers]);

  useEffect(() => {
    saveDailyLogs(dailyLogs);
  }, [dailyLogs]);

  const handleToggleSlotComplete = (dateISO: string, slotId: string) => {
    setDailyLogs((prev) => {
      const [y, m, d] = dateISO.split('-').map(Number);
      const dow = getDayOfWeek(new Date(y, m - 1, d));
      const daySlots = slots.filter((s) => s.day === dow);

      const existingIds = prev[dateISO]?.completedSlotIds ?? [];
      const nextIds = existingIds.includes(slotId)
        ? existingIds.filter((id) => id !== slotId)
        : [...existingIds, slotId];

      const plannedMinutes = daySlots.reduce(
        (acc, s) => acc + getDurationMinutes(s.startTime, s.endTime),
        0,
      );
      const completedMinutes = daySlots
        .filter((s) => nextIds.includes(s.id))
        .reduce((acc, s) => acc + getDurationMinutes(s.startTime, s.endTime), 0);

      return {
        ...prev,
        [dateISO]: {
          dateISO,
          completedSlotIds: nextIds,
          plannedMinutes,
          completedMinutes,
          tasksTotal: daySlots.length,
          tasksDone: daySlots.filter((s) => nextIds.includes(s.id)).length,
        },
      };
    });
  };

  const handleAddSlot = (newSlot: TimetableSlot) => {
    setSlots((prev) => [...prev, newSlot]);
  };

  const handleUpdateSlot = (updatedSlot: TimetableSlot) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot)),
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleAddPaper = (entry: PaperEntry) => {
    setPapers((prev) => [...prev, entry]);
  };

  const handleUpdatePaper = (updated: PaperEntry) => {
    setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
  };

  const handleStartManualLock = (durationMinutes: number) => {
    const untilMs = Date.now() + durationMinutes * 60 * 1000;
    setManualLockUntil(untilMs);
    saveManualLockUntil(untilMs);
    syncNativeBlockerAndAlarms(slots, untilMs);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#DCE8FA] text-[#07142B] transition-colors duration-300 dark:bg-[#020614] dark:text-white">
      <div
        aria-hidden="true"
        className="animate-orb-a pointer-events-none fixed -left-28 -top-24 h-[460px] w-[460px] rounded-full opacity-80"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(59,130,246,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="animate-orb-b pointer-events-none fixed right-[-100px] top-[18%] h-[420px] w-[420px] rounded-full opacity-75"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.26) 0%, rgba(16,185,129,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="animate-orb-a pointer-events-none fixed bottom-[-80px] left-[20%] h-[380px] w-[380px] rounded-full opacity-70"
        style={{
          background:
            'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0) 70%)',
        }}
      />

      <div className="relative z-10">
        <TopBar
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          blockerActive={activeLock.active}
          onOpenBlockerPreview={() => setBlockerModalOpen(true)}
        />

        {/* Floating 10-Min Pre-Slot Alert Toast */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto mt-2 max-w-md px-4"
            >
              <div className="ios-glass-strong flex items-center justify-between gap-3 rounded-full px-4 py-2.5 text-xs">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Bell className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#07142B] dark:text-white">
                      {reminderToast.title}
                    </p>
                    <p className="truncate text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                      {reminderToast.subtitle} · {reminderToast.startTime}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissReminderToast}
                  aria-label="Dismiss reminder"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#07142B] dark:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <div className={activeTab === 'timetable' ? 'block tab-panel-active' : 'hidden'}>
            <TimetableView
              slots={slots}
              onAddSlot={handleAddSlot}
              onUpdateSlot={handleUpdateSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          </div>
          <div className={activeTab === 'papers' ? 'block tab-panel-active' : 'hidden'}>
            <PapersView
              papers={papers}
              onAddPaper={handleAddPaper}
              onUpdatePaper={handleUpdatePaper}
              onDeletePaper={handleDeletePaper}
              isDark={isDark}
            />
          </div>
          <div className={activeTab === 'day' ? 'block tab-panel-active' : 'hidden'}>
            <DayView
              slots={slots}
              dailyLogs={dailyLogs}
              activeLock={activeLock}
              onToggleSlotComplete={handleToggleSlotComplete}
              onOpenBlockerPreview={() => setBlockerModalOpen(true)}
              onGoToTimetable={() => setActiveTab('timetable')}
            />
          </div>
          <div className={activeTab === 'countdown' ? 'block tab-panel-active' : 'hidden'}>
            <CountdownView
              activeLock={activeLock}
              onOpenBlockerPreview={() => setBlockerModalOpen(true)}
            />
          </div>
        </main>

        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

        <LockOverlayPreview
          open={blockerModalOpen}
          activeLock={activeLock}
          onStartManualLock={handleStartManualLock}
          onClose={() => setBlockerModalOpen(false)}
        />
      </div>
    </div>
  );
}
