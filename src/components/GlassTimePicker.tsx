import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface GlassTimePickerProps {
  open: boolean;
  label: string;
  value: string; // HH:MM 24h
  onChange: (newValue: string) => void;
  onClose: () => void;
}

const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function GlassTimePicker({
  open,
  label,
  value,
  onChange,
  onClose,
}: GlassTimePickerProps) {
  const [hour12, setHour12] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (!open) return;
    const [hRaw, mRaw] = value.split(':').map(Number);
    const h = isNaN(hRaw) ? 8 : hRaw;
    const m = isNaN(mRaw) ? 0 : mRaw;
    setPeriod(h >= 12 ? 'PM' : 'AM');
    setHour12(h % 12 === 0 ? 12 : h % 12);
    setMinute(m);
  }, [open, value]);

  const commit = (h12: number, min: number, per: 'AM' | 'PM') => {
    let h24 = h12 % 12;
    if (per === 'PM') h24 += 12;
    const formatted = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    onChange(formatted);
    onClose();
  };

  const stepHour = (delta: number) => {
    setHour12((prev) => {
      const next = ((prev - 1 + delta + 12) % 12) + 1;
      return next;
    });
  };

  const stepMinute = (delta: number) => {
    setMinute((prev) => (prev + delta + 60) % 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#020614]/60 backdrop-blur-md sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="ios-glass-strong w-full max-w-sm rounded-t-[36px] p-5 text-[#07142B] dark:text-white sm:rounded-[36px] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#0B234A]/65 dark:text-blue-200/70">
                  Custom Time
                </p>
                <h3 className="text-lg font-semibold tracking-tight">{label}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close clock picker"
                className="ios-glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[#07142B] dark:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Digital Wheel & AM/PM */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {/* Hour Column */}
              <div className="ios-glass flex flex-col items-center rounded-[28px] px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => stepHour(1)}
                  aria-label="Increase hour"
                  className="flex h-8 w-10 items-center justify-center rounded-full text-[#0B234A]/70 hover:bg-blue-500/15 dark:text-blue-200"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="tabular-nums my-1 text-4xl font-bold tracking-tight">
                  {String(hour12).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => stepHour(-1)}
                  aria-label="Decrease hour"
                  className="flex h-8 w-10 items-center justify-center rounded-full text-[#0B234A]/70 hover:bg-blue-500/15 dark:text-blue-200"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <span className="text-3xl font-bold text-[#0B234A]/50 dark:text-blue-200/60">
                :
              </span>

              {/* Minute Column */}
              <div className="ios-glass flex flex-col items-center rounded-[28px] px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => stepMinute(1)}
                  aria-label="Increase minute"
                  className="flex h-8 w-10 items-center justify-center rounded-full text-[#0B234A]/70 hover:bg-blue-500/15 dark:text-blue-200"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="tabular-nums my-1 text-4xl font-bold tracking-tight">
                  {String(minute).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => stepMinute(-1)}
                  aria-label="Decrease minute"
                  className="flex h-8 w-10 items-center justify-center rounded-full text-[#0B234A]/70 hover:bg-blue-500/15 dark:text-blue-200"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* AM / PM Switcher */}
              <div className="ios-glass flex flex-col gap-1.5 rounded-[26px] p-1.5">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`min-h-[40px] rounded-full px-3.5 text-xs font-semibold transition-colors ${
                      period === p
                        ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
                        : 'text-[#0B234A]/70 dark:text-blue-200/75'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 5-Min Chips */}
            <div className="mt-4">
              <p className="text-[11px] font-medium text-[#0B234A]/65 dark:text-blue-200/70">
                Quick Minutes
              </p>
              <div className="mt-2 grid grid-cols-6 gap-1.5">
                {MINUTE_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className={`tabular-nums min-h-[34px] rounded-full text-xs font-semibold transition-colors ${
                      minute === m
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                        : 'ios-glass text-[#07142B] dark:text-blue-100'
                    }`}
                  >
                    :{String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => commit(hour12, minute, period)}
              className="mt-5 min-h-[46px] w-full rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform active:scale-[0.98] dark:bg-blue-500"
            >
              Set {String(hour12).padStart(2, '0')}:{String(minute).padStart(2, '0')} {period}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
