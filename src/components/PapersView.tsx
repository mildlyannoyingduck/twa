import { Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { SUBJECT_META } from '../data/previewData';
import { PaperEntry, PaperFormat, SubjectId } from '../types';
import { getTodayISO } from '../utils/dateUtils';

interface PapersViewProps {
  papers: PaperEntry[];
  onAddPaper: (entry: PaperEntry) => void;
  onUpdatePaper: (entry: PaperEntry) => void;
  onDeletePaper: (paperId: string) => void;
  isDark: boolean;
}

const CLASS_OPTIONS_BY_SUBJECT: Record<SubjectId, string[]> = {
  biology: ['Sashanka Dhanujaya · Paper', 'Past Paper', 'School Term Test'],
  physics: ['Sujith Liyanage · Paper', 'Samitha Rathnayake · Revision', 'Past Paper', 'School Term Test'],
  chemistry: ['Amila Dasanayake · Paper', 'Past Paper', 'School Term Test'],
};

const SUBJECT_GLASS_SURFACE: Record<SubjectId, string> = {
  biology:
    'border-emerald-400/45 bg-gradient-to-br from-emerald-400/18 to-emerald-500/7 shadow-[0_14px_36px_rgba(16,185,129,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-emerald-400/28 dark:from-emerald-500/14 dark:to-emerald-700/6 dark:shadow-[0_18px_42px_rgba(2,6,20,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]',
  physics:
    'border-orange-400/45 bg-gradient-to-br from-orange-400/18 to-orange-500/7 shadow-[0_14px_36px_rgba(249,115,22,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-orange-400/28 dark:from-orange-500/14 dark:to-orange-700/6 dark:shadow-[0_18px_42px_rgba(2,6,20,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]',
  chemistry:
    'border-blue-400/45 bg-gradient-to-br from-blue-400/18 to-blue-500/7 shadow-[0_14px_36px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-blue-400/28 dark:from-blue-500/14 dark:to-blue-700/6 dark:shadow-[0_18px_42px_rgba(2,6,20,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]',
};

const SUBJECT_ACTIVE_BTN: Record<SubjectId, string> = {
  biology: 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/20 dark:bg-emerald-500/90',
  physics: 'bg-orange-600/90 text-white shadow-lg shadow-orange-600/20 dark:bg-orange-500/90',
  chemistry: 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500/90',
};

type SeriesMode = 'combined' | 'part1' | 'part2';

function buildSmoothSpline(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    path += ` C ${midX.toFixed(1)} ${p0.y.toFixed(1)}, ${midX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return path;
}

export function PapersView({
  papers,
  onAddPaper,
  onUpdatePaper,
  onDeletePaper,
  isDark,
}: PapersViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<SubjectId>('biology');
  const [seriesMode, setSeriesMode] = useState<SeriesMode>('combined');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

  const [paperName, setPaperName] = useState('');
  const [formSubject, setFormSubject] = useState<SubjectId>('biology');
  const [formClass, setFormClass] = useState<string>(CLASS_OPTIONS_BY_SUBJECT.biology[0]);
  const [formDate, setFormDate] = useState<string>(getTodayISO());
  const [formFormat, setFormFormat] = useState<PaperFormat>('both');
  const [part1Score, setPart1Score] = useState('');
  const [part1Max, setPart1Max] = useState('50');
  const [part2Score, setPart2Score] = useState('');
  const [part2Max, setPart2Max] = useState('100');
  const [formNote, setFormNote] = useState('');

  const filteredPapers = useMemo(() => {
    return papers
      .filter((p) => p.subject === subjectFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [papers, subjectFilter]);

  const chartPoints = useMemo(() => {
    return filteredPapers
      .map((p) => {
        let value: number | null = p.combinedPercent;
        if (seriesMode === 'part1') {
          value =
            p.part1Score !== undefined && p.part1Max
              ? Math.round((p.part1Score / p.part1Max) * 100)
              : null;
        } else if (seriesMode === 'part2') {
          value =
            p.part2Score !== undefined && p.part2Max
              ? Math.round((p.part2Score / p.part2Max) * 100)
              : null;
        }
        return value !== null ? { paper: p, value } : null;
      })
      .filter((item): item is { paper: PaperEntry; value: number } => item !== null);
  }, [filteredPapers, seriesMode]);

  const activePoint =
    chartPoints.find((pt) => pt.paper.id === selectedPointId) ??
    chartPoints[chartPoints.length - 1] ??
    null;

  const avgPercent = chartPoints.length
    ? Math.round(chartPoints.reduce((acc, p) => acc + p.value, 0) / chartPoints.length)
    : 0;
  const bestPercent = chartPoints.length
    ? Math.max(...chartPoints.map((p) => p.value))
    : 0;

  const meta = SUBJECT_META[subjectFilter];
  const strokeColor = isDark ? meta.strokeDarkHex : meta.strokeHex;

  const svgW = 520;
  const svgH = 200;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const mappedCoords = chartPoints.map((pt, idx) => {
    const x =
      chartPoints.length === 1
        ? padL + plotW / 2
        : padL + (idx / (chartPoints.length - 1)) * plotW;
    const y = padT + (1 - pt.value / 100) * plotH;
    return { ...pt, x, y };
  });

  const smoothLinePath = buildSmoothSpline(mappedCoords);
  const areaPath =
    mappedCoords.length > 1
      ? `${smoothLinePath} L ${mappedCoords[mappedCoords.length - 1].x.toFixed(1)} ${(
          padT + plotH
        ).toFixed(1)} L ${mappedCoords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const openNewPaperModal = () => {
    setEditingPaperId(null);
    setPaperName('');
    setFormSubject(subjectFilter);
    setFormClass(CLASS_OPTIONS_BY_SUBJECT[subjectFilter][0]);
    setFormDate(getTodayISO());
    setFormFormat('both');
    setPart1Score('');
    setPart1Max('50');
    setPart2Score('');
    setPart2Max('100');
    setFormNote('');
    setSheetOpen(true);
  };

  const openEditPaperModal = (entry: PaperEntry) => {
    setEditingPaperId(entry.id);
    setPaperName(entry.paperName);
    setFormSubject(entry.subject);
    setFormClass(entry.classLabel);
    setFormDate(entry.date);
    setFormFormat(entry.format);
    setPart1Score(entry.part1Score !== undefined ? String(entry.part1Score) : '');
    setPart1Max(entry.part1Max !== undefined ? String(entry.part1Max) : '50');
    setPart2Score(entry.part2Score !== undefined ? String(entry.part2Score) : '');
    setPart2Max(entry.part2Max !== undefined ? String(entry.part2Max) : '100');
    setFormNote(entry.note ?? '');
    setSheetOpen(true);
  };

  const handleSubjectInFormChange = (subj: SubjectId) => {
    setFormSubject(subj);
    setFormClass(CLASS_OPTIONS_BY_SUBJECT[subj][0]);
  };

  const handleSavePaper = () => {
    const p1 = Number(part1Score) || 0;
    const p1Max = Math.max(1, Number(part1Max) || 50);
    const p2 = Number(part2Score) || 0;
    const p2Max = Math.max(1, Number(part2Max) || 100);

    let combined = 0;
    if (formFormat === 'both') {
      combined = Math.round(((p1 / p1Max) * 100 + (p2 / p2Max) * 100) / 2);
    } else if (formFormat === 'part1') {
      combined = Math.round((p1 / p1Max) * 100);
    } else {
      combined = Math.round((p2 / p2Max) * 100);
    }

    const entry: PaperEntry = {
      id: editingPaperId ?? `paper-${Date.now()}`,
      paperName: paperName.trim() || `${SUBJECT_META[formSubject].short} Paper`,
      subject: formSubject,
      classLabel: formClass,
      date: formDate || getTodayISO(),
      format: formFormat,
      part1Score: formFormat !== 'part2' ? p1 : undefined,
      part1Max: formFormat !== 'part2' ? p1Max : undefined,
      part2Score: formFormat !== 'part1' ? p2 : undefined,
      part2Max: formFormat !== 'part1' ? p2Max : undefined,
      combinedPercent: Math.min(100, Math.max(0, combined)),
      note: formNote.trim() || undefined,
    };

    if (editingPaperId) {
      onUpdatePaper(entry);
    } else {
      onAddPaper(entry);
    }

    setSubjectFilter(formSubject);
    setSelectedPointId(entry.id);
    setSheetOpen(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#07142B] dark:text-white">
            Papers
          </h1>
          <p className="mt-0.5 text-xs text-[#0B234A]/70 dark:text-blue-200/75">
            Progress & separate Part I / II marks
          </p>
        </div>

        <button
          type="button"
          onClick={openNewPaperModal}
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-transform active:scale-[0.96] whitespace-nowrap shrink-0 ${SUBJECT_ACTIVE_BTN[subjectFilter]}`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Marks</span>
        </button>
      </div>

      <div className="ios-glass mt-4 grid grid-cols-3 gap-1 rounded-full p-1">
        {(['biology', 'physics', 'chemistry'] as SubjectId[]).map((subj) => {
          const item = SUBJECT_META[subj];
          const active = subjectFilter === subj;
          return (
            <button
              key={subj}
              type="button"
              onClick={() => {
                setSubjectFilter(subj);
                setSelectedPointId(null);
              }}
              className={`min-h-[40px] rounded-full text-xs font-semibold transition-colors ${
                active ? SUBJECT_ACTIVE_BTN[subj] : `${item.text}`
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <section
        className={`mt-4 rounded-[34px] border p-5 backdrop-blur-2xl sm:p-6 ${SUBJECT_GLASS_SURFACE[subjectFilter]}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {activePoint ? (
              <div className="flex items-baseline gap-2.5">
                <span className={`tabular-nums text-2xl font-bold ${meta.text}`}>
                  {activePoint.value}%
                </span>
                <span className="text-xs font-medium text-[#07142B] dark:text-blue-50">
                  {activePoint.paper.paperName}
                </span>
              </div>
            ) : (
              <span className={`text-xs font-semibold ${meta.text}`}>
                {meta.name} Progress
              </span>
            )}
          </div>

          <div className="ios-glass flex items-center gap-1 rounded-full p-1">
            {(
              [
                { id: 'combined', label: 'All' },
                { id: 'part1', label: 'Part I' },
                { id: 'part2', label: 'Part II' },
              ] as { id: SeriesMode; label: string }[]
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSeriesMode(mode.id)}
                className={`min-h-[30px] rounded-full px-3 text-[11px] font-medium transition-colors ${
                  seriesMode === mode.id
                    ? SUBJECT_ACTIVE_BTN[subjectFilter]
                    : 'text-[#0B234A]/70 dark:text-blue-100/80'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {mappedCoords.length === 0 ? (
            <div className="flex h-44 items-center justify-center text-xs text-[#0B234A]/65 dark:text-blue-200/70">
              No {meta.name} papers logged yet — tap Add Marks to start tracking.
            </div>
          ) : (
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-auto w-full overflow-visible">
              <defs>
                <linearGradient id={`glassGrad-${subjectFilter}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.34" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 25, 50, 75, 100].map((tick) => {
                const y = padT + (1 - tick / 100) * plotH;
                return (
                  <g key={tick}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="3 4"
                      className="text-blue-500/20 dark:text-blue-200/15"
                    />
                    <text
                      x={padL - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-[#0B234A]/60 text-[10px] tabular-nums dark:fill-blue-200/65"
                    >
                      {tick}%
                    </text>
                  </g>
                );
              })}

              {areaPath && <path d={areaPath} fill={`url(#glassGrad-${subjectFilter})`} />}

              {mappedCoords.length > 1 && (
                <path
                  d={smoothLinePath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {mappedCoords.map((pt) => {
                const isActive = activePoint?.paper.id === pt.paper.id;
                return (
                  <g
                    key={pt.paper.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPointId(pt.paper.id)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 6.5 : 4.5}
                      fill={isDark ? '#061028' : '#FFFFFF'}
                      stroke={strokeColor}
                      strokeWidth={isActive ? 3 : 2.2}
                    />
                    <text
                      x={pt.x}
                      y={svgH - 6}
                      textAnchor="middle"
                      className="fill-[#0B234A]/75 text-[10px] dark:fill-blue-100/80"
                    >
                      {pt.paper.paperName.replace(`${meta.short} `, '').slice(0, 12)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="mt-3 flex items-center gap-6 border-t border-white/30 pt-3 text-xs text-[#0B234A]/75 dark:border-white/[0.1] dark:text-blue-100/80">
          <span>
            Average{' '}
            <strong className="tabular-nums font-semibold text-[#07142B] dark:text-white">
              {avgPercent}%
            </strong>
          </span>
          <span>
            Best{' '}
            <strong className="tabular-nums font-semibold text-[#07142B] dark:text-white">
              {bestPercent}%
            </strong>
          </span>
        </div>
      </section>

      {filteredPapers.length > 0 && (
        <section className="mt-4 space-y-2.5">
          {[...filteredPapers].reverse().map((entry) => (
            <motion.button
              key={entry.id}
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => openEditPaperModal(entry)}
              className={`flex w-full items-center justify-between gap-4 rounded-[28px] border px-5 py-3.5 text-left backdrop-blur-2xl ${SUBJECT_GLASS_SURFACE[entry.subject]}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#07142B] dark:text-white">
                  {entry.paperName}
                </p>
                <p className="tabular-nums mt-0.5 truncate text-xs text-[#0B234A]/75 dark:text-blue-100/80">
                  {entry.classLabel}
                  {entry.part1Score !== undefined && ` · P1 ${entry.part1Score}/${entry.part1Max}`}
                  {entry.part2Score !== undefined && ` · P2 ${entry.part2Score}/${entry.part2Max}`}
                </p>
              </div>
              <span className={`tabular-nums shrink-0 text-lg font-bold ${meta.text}`}>
                {entry.combinedPercent}%
              </span>
            </motion.button>
          ))}
        </section>
      )}

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
              className="ios-glass-strong max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[38px] p-5 sm:rounded-[38px] sm:p-6"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-blue-900/20 dark:bg-blue-200/25 sm:hidden" />

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#07142B] dark:text-white">
                  {editingPaperId ? 'Edit Paper Marks' : 'Add Paper Marks'}
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close add marks modal"
                  className="ios-glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[#07142B] dark:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    Paper Name
                  </label>
                  <input
                    type="text"
                    value={paperName}
                    onChange={(e) => setPaperName(e.target.value)}
                    placeholder="e.g., Bio Paper 17 or 2023 A/L"
                    className="ios-glass mt-1 min-h-[44px] w-full rounded-full px-4 text-sm text-[#07142B] placeholder:text-[#0B234A]/45 focus:outline-none dark:text-white dark:placeholder:text-blue-200/45"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    Subject & Class
                  </label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {(['biology', 'physics', 'chemistry'] as SubjectId[]).map((subj) => {
                      const item = SUBJECT_META[subj];
                      const active = formSubject === subj;
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => handleSubjectInFormChange(subj)}
                          className={`min-h-[38px] rounded-full text-xs font-semibold transition-colors ${
                            active ? SUBJECT_ACTIVE_BTN[subj] : `ios-glass ${item.text}`
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>

                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="ios-glass mt-2 min-h-[44px] w-full rounded-full px-4 text-sm text-[#07142B] focus:outline-none dark:text-white"
                  >
                    {CLASS_OPTIONS_BY_SUBJECT[formSubject].map((cls) => (
                      <option
                        key={cls}
                        value={cls}
                        className="bg-[#DCE8FA] text-[#07142B] dark:bg-[#081533] dark:text-white"
                      >
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0B234A]/70 dark:text-blue-200/75">
                    Paper Mode
                  </label>
                  <div className="ios-glass mt-1 grid grid-cols-3 gap-1 rounded-full p-1">
                    {(
                      [
                        { id: 'both', label: 'Paper I & II' },
                        { id: 'part1', label: 'Paper I Only' },
                        { id: 'part2', label: 'Paper II Only' },
                      ] as { id: PaperFormat; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormFormat(opt.id)}
                        className={`min-h-[36px] rounded-full text-xs font-semibold transition-colors ${
                          formFormat === opt.id
                            ? SUBJECT_ACTIVE_BTN[formSubject]
                            : 'text-[#0B234A]/70 dark:text-blue-200/75'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formFormat !== 'part2' && (
                  <div className="ios-glass grid grid-cols-2 gap-3 rounded-[26px] p-3.5">
                    <div>
                      <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                        Paper I Score
                      </label>
                      <input
                        type="number"
                        value={part1Score}
                        onChange={(e) => setPart1Score(e.target.value)}
                        placeholder="0"
                        className="ios-glass tabular-nums mt-1 min-h-[40px] w-full rounded-full px-3.5 text-sm text-[#07142B] focus:outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                        Out Of
                      </label>
                      <input
                        type="number"
                        value={part1Max}
                        onChange={(e) => setPart1Max(e.target.value)}
                        className="ios-glass tabular-nums mt-1 min-h-[40px] w-full rounded-full px-3.5 text-sm text-[#07142B] focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {formFormat !== 'part1' && (
                  <div className="ios-glass grid grid-cols-2 gap-3 rounded-[26px] p-3.5">
                    <div>
                      <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                        Paper II Score
                      </label>
                      <input
                        type="number"
                        value={part2Score}
                        onChange={(e) => setPart2Score(e.target.value)}
                        placeholder="0"
                        className="ios-glass tabular-nums mt-1 min-h-[40px] w-full rounded-full px-3.5 text-sm text-[#07142B] focus:outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                        Out Of
                      </label>
                      <input
                        type="number"
                        value={part2Max}
                        onChange={(e) => setPart2Max(e.target.value)}
                        className="ios-glass tabular-nums mt-1 min-h-[40px] w-full rounded-full px-3.5 text-sm text-[#07142B] focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="ios-glass tabular-nums mt-1 min-h-[42px] w-full rounded-full px-3.5 text-xs text-[#07142B] focus:outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#0B234A]/70 dark:text-blue-200/75">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Mistakes..."
                      className="ios-glass mt-1 min-h-[42px] w-full rounded-full px-3.5 text-xs text-[#07142B] placeholder:text-[#0B234A]/45 focus:outline-none dark:text-white dark:placeholder:text-blue-200/45"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2.5">
                {editingPaperId && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeletePaper(editingPaperId);
                      setSheetOpen(false);
                    }}
                    className="ios-glass inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full px-5 text-xs font-semibold text-orange-600 transition-transform active:scale-[0.97] dark:text-orange-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSavePaper}
                  className={`min-h-[48px] flex-1 rounded-full text-sm font-semibold transition-transform active:scale-[0.98] ${SUBJECT_ACTIVE_BTN[formSubject]}`}
                >
                  {editingPaperId ? 'Save Changes' : 'Save Marks'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
