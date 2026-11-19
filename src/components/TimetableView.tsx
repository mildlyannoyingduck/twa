import { Bell, ChevronDown, Clock, Lock, Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CLASS_PRESETS, DAYS_ORDER, SUBJECT_META } from '../data/previewData';
import { DayOfWeek, SlotCategory, SubjectId, TimetableSlot } from '../types';
import { getDayOfWeek } from '../utils/dateUtils';
import { formatDuration, formatTime12h, getDurationMinutes, toMinutes } from '../utils/timeUtils';
import { GlassTimePicker } from './GlassTimePicker';

interface TimetableViewProps {
  slots: TimetableSlot[];
  onAddSlot: (slot: TimetableSlot) => void;
  onUpdateSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}

const GRID_START_HOUR = 0;
const GRID_END_HOUR = 24;
const HOUR_HEIGHT = 46;

const GLASS_SUBJECT_BLOCK: Record<SubjectId, string> = {
  biology:
    'border-emerald-400/45 bg-gradient-to-br from-emerald-400/22 to-emerald-600/9 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-emerald-300/30 dark:from-emerald-400/18 dark:to-emerald-700/10 dark:text-emerald-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]',
  physics:
    'border-orange-400/45 bg-gradient-to-br from-orange-400/22 to-orange-600/9 text-orange-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-orange-300/30 dark:from-orange-400/18 dark:to-orange-700/10 dark:text-orange-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]',
  chemistry:
    'border-blue-400/45 bg-gradient-to-br from-blue-400/22 to-blue-600/9 text-blue-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-blue-300/30 dark:from-blue-400/18 dark:to-blue-700/10 dark:text-blue-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]',
};

export function TimetableView({
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
}: TimetableViewProps) {
  const todayDow = getDayOfWeek();
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');
  const [activeDay, setActiveDay] = useState<DayOfWeek>(todayDow);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [formDay, setFormDay] = useState<DayOfWeek>(todayDow);
  const [category, setCategory] = useState<SlotCategory>('class');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CLASS_PRESETS[0].id);
  const [classDropdownOpen, setClassDropdownOpen] = useState<boolean>(false);
  const [selfSubject, setSelfSubject] = useState<SubjectId>('biology');
  const [selfNote, setSelfNote] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [autoBlock, setAutoBlock] = useState(true);

  const [clockTarget, setClockTarget] = useState<'start' | 'end' | null>(null);

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i,
  );

  const daySlots = slots
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const selectedPreset =
    CLASS_PRESETS.find((c) => c.id === selectedPresetId) ?? CLASS_PRESETS[0];

  const previewDuration = getDurationMinutes(startTime, endTime);
  const invalidTimeRange = previewDuration <= 0;

  const openCreatorForDay = (day: DayOfWeek) => {
    setEditingSlotId(null);
    setFormDay(day);
    setCategory('class');
    setSelectedPresetId(CLASS_PRESETS[0].id);
    setSelfSubject('biology');
    setSelfNote('');
    setStartTime('08:00');
    setEndTime('11:00');
    setAutoBlock(true);
    setClassDropdownOpen(false);
    setSheetOpen(true);
  };

  const openExistingSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setFormDay(slot.day);
    setCategory(slot.category);
    if (slot.category === 'class') {
      setSelectedPresetId(slot.classPresetId ?? CLASS_PRESETS[0].id);
    } else {
      setSelfSubject(slot.subject);
      setSelfNote(slot.subtitle);
    }
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setAutoBlock(slot.autoBlock);
    setClassDropdownOpen(false);
    setSheetOpen(true);
  };

  const handleSaveSlot = () => {
    if (invalidTimeRange) return;

    const slotPayload: TimetableSlot =
      category === 'class'
        ? {
            id: editingSlotId ?? `slot-${Date.now()}`,
            day: formDay,
            startTime,
            endTime,
            category: 'class',
            subject: selectedPreset.subject,
            classPresetId: selectedPreset.id,
            title: selectedPreset.title,
            subtitle: selectedPreset.teacher,
            autoBlock,
          }
        : {
            id: editingSlotId ?? `slot-${Date.now()}`,
            day: formDay,
            startTime,
            endTime,
            category: 'self-study',
            subject: selfSubject,
            title: `Self-Study · ${SUBJECT_META[selfSubject].short}`,
            subtitle: selfNote.trim() || 'Focused revision block',
            autoBlock,
          };

    if (editingSlotId) {
      onUpdateSlot(slotPayload);
    } else {
      onAddSlot(slotPayload);
    }

    setActiveDay(formDay);
    setSheetOpen(false);
  };

  const handleDeleteCurrentSlot = () => {
    if (!editingSlotId) return;
    onDeleteSlot(editingSlotId);
    setSheetOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#07142B] dark:text-white">
            Timetable
          </h1>
          <p className="mt-0.5 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
            {slots.length === 0
              ? 'Add your classes and self-study blocks'
              : 'Tap any slot to view, edit or remove'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="ios-glass flex items-center rounded-full p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`min-h-[34px] rounded-full px-3.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                  : 'text-[#0B234A]/75 dark:text-blue-200/80'
              }`}
            >
              Week Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`min-h-[34px] rounded-full px-3.5 text-xs font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                  : 'text-[#0B234A]/75 dark:text-blue-200/80'
              }`}
            >
              Day List
            </button>
          </div>

          <button
            type="button"
            onClick={() => openCreatorForDay(activeDay)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform active:scale-[0.96] dark:bg-blue-500 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="ios-glass-strong mt-4 overflow-hidden rounded-[34px]">
          <div className="max-h-[66vh] overflow-auto no-scrollbar">
            <div className="min-w-[820px]">
              <div className="sticky top-0 z-20 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-blue-200/40 bg-white/70 backdrop-blur-xl dark:border-blue-300/12 dark:bg-[#07122B]/80">
                <div className="py-3.5 text-center text-[11px] font-medium text-[#0B234A]/55 dark:text-blue-200/60">
                  24h
                </div>
                {DAYS_ORDER.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => openCreatorForDay(day)}
                    className={`mx-1 my-1.5 rounded-full py-2 text-center text-xs font-semibold transition-colors hover:bg-white/35 dark:hover:bg-blue-400/15 ${
                      day === todayDow
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-[#07142B] dark:text-blue-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div
                className="relative grid grid-cols-[64px_repeat(7,minmax(0,1fr))]"
                style={{ height: `${(GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT}px` }}
              >
                <div className="relative border-r border-blue-200/35 dark:border-blue-300/10">
                  {hours.slice(0, -1).map((hour, i) => (
                    <div
                      key={hour}
                      style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                      className="tabular-nums absolute left-0 right-0 pr-2 pt-1 text-right text-[11px] text-[#0B234A]/60 dark:text-blue-200/60"
                    >
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                  <div className="tabular-nums absolute bottom-0.5 left-0 right-0 pr-2 text-right text-[10px] text-[#0B234A]/50 dark:text-blue-200/50">
                    24:00
                  </div>
                </div>

                {DAYS_ORDER.map((day) => {
                  const colSlots = slots.filter((s) => s.day === day);
                  return (
                    <div
                      key={day}
                      className="relative border-r border-blue-200/25 last:border-r-0 dark:border-blue-300/[0.07]"
                    >
                      {hours.slice(0, -1).map((hour, i) => (
                        <div
                          key={hour}
                          style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                          className="absolute left-0 right-0 border-b border-blue-200/25 dark:border-blue-300/[0.06]"
                        />
                      ))}

                      {colSlots.map((slot) => {
                        const startMin = toMinutes(slot.startTime);
                        const durMin = Math.max(25, getDurationMinutes(slot.startTime, slot.endTime));
                        const topPx = ((startMin - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                        const heightPx = (durMin / 60) * HOUR_HEIGHT;
                        const compact = durMin <= 45;

                        return (
                          <motion.button
                            key={slot.id}
                            type="button"
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => openExistingSlot(slot)}
                            style={{
                              top: `${Math.max(2, topPx + 1)}px`,
                              height: `${Math.max(24, heightPx - 2)}px`,
                            }}
                            className={`absolute left-1 right-1 overflow-hidden rounded-[18px] border px-2.5 py-1.5 text-left backdrop-blur-xl ${
                              GLASS_SUBJECT_BLOCK[slot.subject]
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="truncate text-[11px] font-semibold leading-tight">
                                {slot.title}
                              </p>
                              {slot.autoBlock && (
                                <Lock className="mt-0.5 h-2.5 w-2.5 shrink-0 opacity-75" />
                              )}
                            </div>
                            {!compact && (
                              <p className="mt-0.5 truncate text-[10px] opacity-85">
                                {slot.subtitle}
                              </p>
                            )}
                            {heightPx >= 54 && (
                              <p className="tabular-nums mt-0.5 text-[10px] opacity-75">
                                {slot.startTime}–{slot.endTime}
                              </p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="ios-glass grid grid-cols-7 gap-1 rounded-full p-1.5">
            {DAYS_ORDER.map((day) => {
              const active = activeDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`min-h-[42px] rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                      : 'text-[#0B234A]/75 dark:text-blue-200/80'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {daySlots.length === 0 ? (
            <div className="ios-glass mt-4 rounded-[32px] px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[#07142B] dark:text-white">
                No slots on {activeDay}
              </p>
              <p className="mt-1 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                Tap Add Slot to schedule a class or self-study block.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {daySlots.map((slot) => {
                const mins = getDurationMinutes(slot.startTime, slot.endTime);
                const subj = SUBJECT_META[slot.subject];
                return (
                  <motion.button
                    key={slot.id}
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onClick={() => openExistingSlot(slot)}
                    className={`flex w-full items-center justify-between gap-4 rounded-[28px] border px-5 py-4 text-left backdrop-blur-2xl ${
                      GLASS_SUBJECT_BLOCK[slot.subject]
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${subj.text}`}>{subj.name}</span>
                        <span className="opacity-50">·</span>
                        <span className="opacity-75">
                          {slot.category === 'class' ? 'Class' : 'Self-Study'}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-[#07142B] dark:text-white">
                        {slot.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#0B234A]/75 dark:text-blue-100/80">
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
            </div>
          )}
        </div>
      )}

      {/* Create / View / Edit Slot Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#020614]/60 backdrop-blur-lg sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ y: 36, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="ios-glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[38px] p-5 sm:rounded-[38px] sm:p-6"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-blue-900/20 dark:bg-blue-200/25 sm:hidden" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                    {formDay} · {invalidTimeRange ? 'Pick valid range' : formatDuration(previewDuration)}
                  </p>
                  <h2 className="text-lg font-semibold text-[#07142B] dark:text-white">
                    {editingSlotId ? 'View & Edit Slot' : 'Add Slot'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close slot sheet"
                  className="ios-glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[#07142B] dark:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1">
                {DAYS_ORDER.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setFormDay(day)}
                    className={`min-h-[36px] rounded-full text-xs font-medium transition-colors ${
                      formDay === day
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                        : 'ios-glass text-[#07142B] dark:text-blue-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="ios-glass mt-4 grid grid-cols-2 gap-1 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setCategory('class')}
                  className={`min-h-[38px] rounded-full text-xs font-semibold transition-colors ${
                    category === 'class'
                      ? 'bg-white/85 text-[#07142B] shadow-sm dark:bg-blue-500 dark:text-white'
                      : 'text-[#0B234A]/70 dark:text-blue-200/75'
                  }`}
                >
                  Class
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('self-study')}
                  className={`min-h-[38px] rounded-full text-xs font-semibold transition-colors ${
                    category === 'self-study'
                      ? 'bg-white/85 text-[#07142B] shadow-sm dark:bg-blue-500 dark:text-white'
                      : 'text-[#0B234A]/70 dark:text-blue-200/75'
                  }`}
                >
                  Self-Study
                </button>
              </div>

              {category === 'class' ? (
                <div className="mt-4">
                  <label className="block text-[11px] font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    Class
                  </label>

                  <button
                    type="button"
                    onClick={() => setClassDropdownOpen((open) => !open)}
                    aria-expanded={classDropdownOpen}
                    className="ios-glass mt-1.5 flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[24px] px-4 py-2.5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#07142B] dark:text-white">
                        {selectedPreset.title}
                      </p>
                      <p className="truncate text-xs text-[#0B234A]/70 dark:text-blue-200/75">
                        <span className={SUBJECT_META[selectedPreset.subject].text}>
                          {SUBJECT_META[selectedPreset.subject].short}
                        </span>
                        {' · '}
                        {selectedPreset.teacher}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#0B234A]/70 transition-transform duration-200 dark:text-blue-200 ${
                        classDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {classDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="ios-glass mt-2 divide-y divide-blue-200/30 overflow-hidden rounded-[24px] dark:divide-blue-300/12"
                      >
                        {CLASS_PRESETS.map((preset) => {
                          const meta = SUBJECT_META[preset.subject];
                          const active = selectedPresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setSelectedPresetId(preset.id);
                                setClassDropdownOpen(false);
                              }}
                              className={`flex min-h-[46px] w-full items-center justify-between px-4 py-2.5 text-left transition-colors ${
                                active
                                  ? 'bg-blue-500/20 font-semibold'
                                  : 'hover:bg-white/30 dark:hover:bg-blue-400/10'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-semibold text-[#07142B] dark:text-white">
                                  {preset.title}
                                </p>
                                <p className="text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                                  {preset.teacher}
                                </p>
                              </div>
                              <span className={`text-xs font-semibold ${meta.text}`}>
                                {meta.short}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(['biology', 'physics', 'chemistry'] as SubjectId[]).map((subj) => {
                      const meta = SUBJECT_META[subj];
                      const active = selfSubject === subj;
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setSelfSubject(subj)}
                          className={`min-h-[40px] rounded-full text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                              : `ios-glass ${meta.text}`
                          }`}
                        >
                          {meta.name}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    rows={2}
                    value={selfNote}
                    onChange={(e) => setSelfNote(e.target.value)}
                    placeholder="What are you going to do? (questions, recap...)"
                    className="ios-glass w-full rounded-[24px] px-4 py-3 text-sm text-[#07142B] placeholder:text-[#0B234A]/45 focus:outline-none dark:text-white dark:placeholder:text-blue-200/45"
                  />
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    Start Time
                  </label>
                  <button
                    type="button"
                    onClick={() => setClockTarget('start')}
                    className="ios-glass tabular-nums mt-1 flex min-h-[46px] w-full items-center justify-between rounded-full px-4 text-sm font-semibold text-[#07142B] dark:text-white"
                  >
                    <span>{formatTime12h(startTime)}</span>
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    End Time
                  </label>
                  <button
                    type="button"
                    onClick={() => setClockTarget('end')}
                    className="ios-glass tabular-nums mt-1 flex min-h-[46px] w-full items-center justify-between rounded-full px-4 text-sm font-semibold text-[#07142B] dark:text-white"
                  >
                    <span>{formatTime12h(endTime)}</span>
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </button>
                </div>
              </div>

              {invalidTimeRange && (
                <p className="mt-2 px-2 text-xs font-medium text-orange-600 dark:text-orange-300">
                  End time must be after start time.
                </p>
              )}

              <div className="ios-glass mt-4 flex items-center justify-between rounded-full px-4 py-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-[#07142B] dark:text-white">
                    Auto-Lock Phone
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoBlock((v) => !v)}
                  aria-pressed={autoBlock}
                  className={`h-7 w-12 rounded-full p-1 transition-colors ${
                    autoBlock ? 'bg-emerald-500' : 'bg-blue-900/20 dark:bg-blue-300/25'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      autoBlock ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 px-1 text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
                <span>10-minute reminder alert before start</span>
              </div>

              <div className="mt-5 flex items-center gap-2.5">
                {editingSlotId && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentSlot}
                    className="ios-glass inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full px-5 text-xs font-semibold text-orange-600 transition-transform active:scale-[0.97] dark:text-orange-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={invalidTimeRange}
                  onClick={handleSaveSlot}
                  className="min-h-[48px] flex-1 rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform active:scale-[0.98] disabled:opacity-45 dark:bg-blue-500"
                >
                  {editingSlotId ? 'Save Changes' : `Add to ${formDay}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassTimePicker
        open={clockTarget !== null}
        label={clockTarget === 'start' ? 'Start Time' : 'End Time'}
        value={clockTarget === 'start' ? startTime : endTime}
        onChange={(newVal) => {
          if (clockTarget === 'start') setStartTime(newVal);
          if (clockTarget === 'end') setEndTime(newVal);
        }}
        onClose={() => setClockTarget(null)}
      />
    </div>
  );
}
