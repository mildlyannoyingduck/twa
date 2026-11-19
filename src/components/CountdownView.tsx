import { Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActiveLockInfo } from '../types';
import { getExamCountdown } from '../utils/timeUtils';

interface CountdownViewProps {
  activeLock: ActiveLockInfo;
  onOpenBlockerPreview: () => void;
}

export function CountdownView({ activeLock, onOpenBlockerPreview }: CountdownViewProps) {
  const [countdown, setCountdown] = useState(() => getExamCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getExamCountdown());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tiles = [
    { value: String(countdown.days), label: 'days' },
    { value: String(countdown.hours).padStart(2, '0'), label: 'hours' },
    { value: String(countdown.minutes).padStart(2, '0'), label: 'minutes' },
    { value: String(countdown.seconds).padStart(2, '0'), label: 'seconds' },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pb-28 pt-6 sm:px-6 lg:pt-10">
      <section className="ios-glass-strong relative overflow-hidden rounded-[40px] p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="animate-orb-a pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full opacity-75"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.48) 0%, rgba(59,130,246,0) 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="animate-orb-b pointer-events-none absolute -bottom-24 right-[-20px] h-72 w-72 rounded-full opacity-65"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.34) 0%, rgba(34,211,238,0) 70%)',
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 600 320"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-55 dark:opacity-75"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 235 Q 270 275 375 0"
            fill="none"
            stroke="url(#arcGradExtreme)"
            strokeWidth="1.75"
          />
          <defs>
            <linearGradient id="arcGradExtreme" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.35" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#0B234A]/75 dark:text-blue-100/80">
            <span className="font-medium">G.C.E. A/L Biology</span>
            <span className="tabular-nums">August 3 – 28, 2027</span>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className="ios-glass-tile flex flex-col items-center justify-center rounded-[30px] px-3 py-6 text-center sm:py-8"
              >
                <span className="tabular-nums text-4xl font-bold tracking-tight text-[#07142B] dark:text-white sm:text-5xl">
                  {tile.value}
                </span>
                <span className="mt-1.5 text-xs font-medium text-[#0B234A]/70 dark:text-blue-100/80">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ios-glass flex flex-wrap items-center justify-between gap-4 rounded-[32px] px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#0B234A]/75 dark:text-blue-100/80">
          <div>
            <span className="tabular-nums text-sm font-semibold text-[#07142B] dark:text-white">
              {countdown.weeks}
            </span>{' '}
            weeks left
          </div>
          <div>
            <span className="tabular-nums text-sm font-semibold text-[#07142B] dark:text-white">
              {countdown.weekends}
            </span>{' '}
            weekends
          </div>
          <div>
            <span className="tabular-nums text-sm font-semibold text-[#07142B] dark:text-white">
              {countdown.totalHours.toLocaleString()}
            </span>{' '}
            hours
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBlockerPreview}
          className="ios-glass inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#07142B] transition-transform active:scale-[0.96] dark:text-blue-50"
        >
          {activeLock.active ? (
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{activeLock.active ? `Locked Until ${activeLock.untilTimeLabel}` : 'Galaxy A07 Lock'}</span>
        </button>
      </section>
    </div>
  );
}
