import { CalendarPlus, Check, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { SUBJECT_META } from '../data/previewData';
import {
  ActiveLockInfo,
  DayCompletionLog,
  SubjectId,
  TimetableSlot,
  WeekPerformance,
} from '../types';
import {
  formatWeekRange,
  getCurrentWeekDays,
  getMondayOfWeek,
  getTodayISO,
  toISODate,
} from '../utils/dateUtils';
import { formatDuration, formatTime12h, getDurationMinutes } from '../utils/timeUtils';

interface DayViewProps {
  slots: TimetableSlot[];
  dailyLogs: Record<string, DayCompletionLog>;
  activeLock: ActiveLockInfo;
  onToggleSlotComplete: (dateISO: string, slotId: string) => void;
  onOpenBlockerPreview: () => void;
  onGoToTimetable: () => void;
}

const SUBJECT_GLASS_ROW: Record<SubjectId, string> = {
  biology:
    'border-emerald-400/45 bg-gradient-to-br from-emerald-400/18 to-emerald-500/7 shadow-[0_10px_28px_rgba(16,185,129,0.07),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-emerald-400/28 dark:from-emerald-500/15 dark:to-emerald-700/7 dark:shadow-[0_14px_34px_rgba(2,6,20,0.36),inset_0_1px_0_rgba(255,255,255,0.18)]',
  physics:
    'border-orange-400/45 bg-gradient-to-br from-orange-400/18 to-orange-500/7 shadow-[0_10px_28px_rgba(249,115,22,0.07),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-orange-400/28 dark:from-orange-500/15 dark:to-orange-700/7 dark:shadow-[0_14px_34px_rgba(2,6,20,0.36),inset_0_1px_0_rgba(255,255,255,0.18)]',
  chemistry:
    'border-blue-400/45 bg-gradient-to-br from-blue-400/18 to-blue-500/7 shadow-[0_10px_28px_rgba(59,130,246,0.07),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-blue-400/28 dark:from-blue-500/15 dark:to-blue-700/7 dark:shadow-[0_14px_34px_rgba(2,6,20,0.36),inset_0_1px_0_rgba(255,255,255,0.18)]',
};

const SUBJECT_CHECK_STYLE: Record<SubjectId, { checked: string; unchecked: string }> = {
  biology: {
    checked: 'border-emerald-500 bg-emerald-500 text-white shadow-sm',
    unchecked: 'border-emerald-600/50 bg-emerald-500/10 dark:border-emerald-400/50',
  },
  physics: {
    checked: 'border-orange-500 bg-orange-500 text-white shadow-sm',
    unchecked: 'border-orange-600/50 bg-orange-500/10 dark:border-orange-400/50',
  },
  chemistry: {
    checked: 'border-blue-500 bg-blue-500 text-white shadow-sm',
    unchecked: 'border-blue-600/50 bg-blue-500/10 dark:border-blue-400/50',
  },
};

export function DayView({
  slots,
  dailyLogs,
  activeLock,
  onToggleSlotComplete,
  onOpenBlockerPreview,
  onGoToTimetable,
}: DayViewProps) {
  const [section, setSection] = useState<'today' | 'history'>('today');

  const weekDays = useMemo(() => getCurrentWeekDays(new Date()), []);
  const todayISO = useMemo(() => getTodayISO(new Date()), []);
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);

  const selectedDayInfo =
    weekDays.find((d) => d.dateISO === selectedDateISO) ??
    weekDays.find((d) => d.isToday) ??
    weekDays[0];

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => s.day === selectedDayInfo.day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, selectedDayInfo.day],
  );

  const completedIds = dailyLogs[selectedDayInfo.dateISO]?.completedSlotIds ?? [];

  const totalTasks = daySlots.length;
  const doneTasks = daySlots.filter((s) => completedIds.includes(s.id)).length;

  const totalMinutes = daySlots.reduce(
    (acc, s) => acc + getDurationMinutes(s.startTime, s.endTime),
    0,
  );
  const doneMinutes = daySlots
    .filter((s) => completedIds.includes(s.id))
    .reduce((acc, s) => acc + getDurationMinutes(s.startTime, s.endTime), 0);

  const completionPercent =
    totalMinutes > 0 ? Math.round((doneMinutes / totalMinutes) * 100) : 0;

  // Compute real past weeks performance from dailyLogs
  const pastWeeks: WeekPerformance[] = useMemo(() => {
    const currentMondayISO = toISODate(getMondayOfWeek(new Date()));
    const weekBuckets: Record<
      string,
      { plannedMins: number; doneMins: number; tasksDone: number; tasksTotal: number }
    > = {};

    for (const [dateISO, log] of Object.entries(dailyLogs)) {
      const [y, m, d] = dateISO.split('-').map(Number);
      const monISO = toISODate(getMondayOfWeek(new Date(y, m - 1, d)));
      if (monISO >= currentMondayISO) continue; // Only past weeks
      if (!weekBuckets[monISO]) {
        weekBuckets[monISO] = { plannedMins: 0, doneMins: 0, tasksDone: 0, tasksTotal: 0 };
      }
      weekBuckets[monISO].plannedMins += log.plannedMinutes;
      weekBuckets[monISO].doneMins += log.completedMinutes;
      weekBuckets[monISO].tasksDone += log.tasksDone;
      weekBuckets[monISO].tasksTotal += log.tasksTotal;
    }

    return Object.entries(weekBuckets)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 8)
      .map(([weekStartISO, stats], idx) => {
        const pct =
          stats.plannedMins > 0
            ? Math.round((stats.doneMins / stats.plannedMins) * 100)
            : 0;
        return {
          weekStartISO,
          label: idx === 0 ? 'Last Week' : `${idx + 1} Weeks Ago`,
          range: formatWeekRange(weekStartISO),
          completionPercent: pct,
          tasksDone: stats.tasksDone,
          tasksTotal: stats.tasksTotal,
          hoursCompleted: Number((stats.doneMins / 60).toFixed(1)),
          hoursPlanned: Number((stats.plannedMins / 60).toFixed(1)),
        };
      });
  }, [dailyLogs]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#07142B] dark:text-white">
            {section === 'today' ? (selectedDayInfo.isToday ? 'Today' : selectedDayInfo.day) : 'Past Weeks'}
          </h1>
          <p className="mt-0.5 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
            {section === 'today' ? selectedDayInfo.fullLabel : 'Weekly completion history'}
          </p>
        </div>

        <div className="ios-glass flex items-center rounded-full p-1">
          <button
            type="button"
            onClick={() => setSection('today')}
            className={`min-h-[34px] rounded-full px-3.5 text-xs font-medium transition-colors ${
              section === 'today'
                ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                : 'text-[#0B234A]/75 dark:text-blue-200/80'
            }`}
          >
            Day Tasks
          </button>
          <button
            type="button"
            onClick={() => setSection('history')}
            className={`min-h-[34px] rounded-full px-3.5 text-xs font-medium transition-colors ${
              section === 'history'
                ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                : 'text-[#0B234A]/75 dark:text-blue-200/80'
            }`}
          >
            Past Weeks
          </button>
        </div>
      </div>

      {section === 'today' ? (
        <div className="mt-4 space-y-4">
          <section className="ios-glass-strong rounded-[34px] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="tabular-nums text-4xl font-bold tracking-tight text-[#07142B] dark:text-white">
                  {completionPercent}%
                </p>
                <p className="mt-1 text-xs text-[#0B234A]/75 dark:text-blue-100/80">
                  <span className="tabular-nums font-semibold text-[#07142B] dark:text-white">
                    {doneTasks}/{totalTasks} tasks
                  </span>{' '}
                  ·{' '}
                  <span className="tabular-nums">
                    {formatDuration(doneMinutes)} of {formatDuration(totalMinutes)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenBlockerPreview}
                className="ios-glass inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#07142B] transition-transform active:scale-[0.96] dark:text-blue-50"
              >
                <Lock
                  className={`h-3.5 w-3.5 ${
                    activeLock.active
                      ? 'text-emerald-500'
                      : 'text-blue-600 dark:text-blue-300'
                  }`}
                />
                <span>{activeLock.active ? 'Lock Active' : 'Lock Shield'}</span>
              </button>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-blue-900/10 dark:bg-blue-300/15">
              <motion.div
                initial={false}
                animate={{ width: `${completionPercent}%` }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {weekDays.map((item) => {
                const active = item.dateISO === selectedDayInfo.dateISO;
                return (
                  <button
                    key={item.dateISO}
                    type="button"
                    onClick={() => setSelectedDateISO(item.dateISO)}
                    className={`flex min-h-[52px] flex-col items-center justify-center rounded-full text-xs transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                        : 'ios-glass text-[#07142B] dark:text-blue-100'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">{item.day}</span>
                    <span className="tabular-nums font-semibold">{item.dateNum}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {daySlots.length === 0 ? (
            <section className="ios-glass flex flex-col items-center justify-center rounded-[32px] px-6 py-10 text-center">
              <CalendarPlus className="h-7 w-7 text-blue-600 dark:text-blue-300" />
              <p className="mt-3 text-sm font-semibold text-[#07142B] dark:text-white">
                Nothing scheduled for {selectedDayInfo.day}
              </p>
              <p className="mt-1 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                Add your classes and self-study blocks in the Timetable tab.
              </p>
              <button
                type="button"
                onClick={onGoToTimetable}
                className="mt-4 min-h-[42px] rounded-full bg-blue-600 px-5 text-xs font-semibold text-white shadow-md shadow-blue-600/25 dark:bg-blue-500"
              >
                Open Timetable
              </button>
            </section>
          ) : (
            <section className="space-y-2.5">
              {daySlots.map((slot) => {
                const subj = SUBJECT_META[slot.subject];
                const isDone = completedIds.includes(slot.id);
                const mins = getDurationMinutes(slot.startTime, slot.endTime);
                const checkStyle = SUBJECT_CHECK_STYLE[slot.subject];

                return (
                  <motion.button
                    key={slot.id}
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onToggleSlotComplete(selectedDayInfo.dateISO, slot.id)}
                    className={`flex w-full items-center gap-3.5 rounded-[28px] border px-4 py-3.5 text-left backdrop-blur-2xl transition-opacity ${
                      SUBJECT_GLASS_ROW[slot.subject]
                    } ${isDone ? 'opacity-75' : 'opacity-100'}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isDone ? checkStyle.checked : checkStyle.unchecked
                      }`}
                    >
                      {isDone && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold text-[#07142B] dark:text-white ${
                          isDone ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {slot.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#0B234A]/75 dark:text-blue-100/80">
                        <span className={`font-semibold ${subj.text}`}>{subj.short}</span>
                        {' · '}
                        {slot.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 text-right tabular-nums">
                      <p className="text-xs font-semibold text-[#07142B] dark:text-white">
                        {formatTime12h(slot.startTime)}
                      </p>
                      <p className="text-[11px] text-[#0B234A]/70 dark:text-blue-100/75">
                        {formatDuration(mins)}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </section>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {pastWeeks.length === 0 ? (
            <section className="ios-glass rounded-[32px] px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#07142B] dark:text-white">
                No past weeks recorded yet
              </p>
              <p className="mt-1 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                As you tick off daily slots each week, your weekly completion percentages will build here automatically.
              </p>
            </section>
          ) : (
            <>
              <section className="ios-glass-strong rounded-[34px] p-5 sm:p-6">
                <div className="grid grid-cols-4 gap-3">
                  {[...pastWeeks]
                    .slice(0, 4)
                    .reverse()
                    .map((wk) => (
                      <div key={wk.weekStartISO} className="flex flex-col items-center gap-2">
                        <span className="tabular-nums text-xs font-semibold text-[#07142B] dark:text-white">
                          {wk.completionPercent}%
                        </span>
                        <div className="flex h-28 w-full items-end rounded-full bg-blue-900/10 p-1.5 dark:bg-blue-300/12">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm dark:from-blue-500 dark:to-cyan-300"
                            style={{ height: `${wk.completionPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                          {wk.range.split('–')[0].trim()}
                        </span>
                      </div>
                    ))}
                </div>
              </section>

              <section className="space-y-2.5">
                {pastWeeks.map((wk) => (
                  <div
                    key={wk.weekStartISO}
                    className="ios-glass flex items-center justify-between gap-4 rounded-[28px] px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#07142B] dark:text-white">
                        {wk.label} · {wk.range}
                      </p>
                      <p className="tabular-nums mt-0.5 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                        {wk.tasksDone}/{wk.tasksTotal} tasks · {wk.hoursCompleted}h / {wk.hoursPlanned}h
                      </p>
                    </div>

                    <span className="tabular-nums text-xl font-bold text-blue-700 dark:text-blue-300">
                      {wk.completionPercent}%
                    </span>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
