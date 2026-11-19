import { Moon, Shield, ShieldCheck, Sun } from 'lucide-react';

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  blockerActive: boolean;
  onOpenBlockerPreview: () => void;
}

export function TopBar({
  isDark,
  onToggleTheme,
  blockerActive,
  onOpenBlockerPreview,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="font-brand bg-gradient-to-r from-[#0B2454] via-blue-700 to-cyan-600 bg-clip-text text-[19px] font-bold tracking-tight text-transparent dark:from-white dark:via-blue-200 dark:to-cyan-300 whitespace-nowrap shrink-0">
          This Week
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBlockerPreview}
            className={`ios-glass inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-transform active:scale-[0.96] whitespace-nowrap shrink-0 ${
              blockerActive
                ? '!border-emerald-400/55 !bg-emerald-500/25 text-emerald-900 dark:text-emerald-200'
                : 'text-[#07142B] dark:text-blue-50'
            }`}
          >
            {blockerActive ? (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Shield className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{blockerActive ? 'Lock On' : 'Phone Lock'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
            className="ios-glass inline-flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#07142B] transition-transform active:scale-[0.94] dark:text-blue-50"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
