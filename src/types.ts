export type TabId = 'timetable' | 'papers' | 'day' | 'countdown';

export type SubjectId = 'biology' | 'physics' | 'chemistry';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type SlotCategory = 'class' | 'self-study';

export type PaperFormat = 'both' | 'part1' | 'part2';

export interface ClassPreset {
  id: string;
  subject: SubjectId;
  title: string;
  teacher: string;
  kind: 'Theory' | 'Paper' | 'Revision';
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:MM (24h)
  endTime: string;   // HH:MM (24h)
  category: SlotCategory;
  subject: SubjectId;
  classPresetId?: string;
  title: string;
  subtitle: string;
  autoBlock: boolean;
}

export interface DayCompletionLog {
  dateISO: string; // YYYY-MM-DD
  completedSlotIds: string[];
  plannedMinutes: number;
  completedMinutes: number;
  tasksTotal: number;
  tasksDone: number;
}

export interface PaperEntry {
  id: string;
  paperName: string;
  subject: SubjectId;
  classLabel: string;
  date: string; // YYYY-MM-DD
  format: PaperFormat;
  part1Score?: number;
  part1Max?: number;
  part2Score?: number;
  part2Max?: number;
  combinedPercent: number;
  note?: string;
}

export interface WeekPerformance {
  weekStartISO: string;
  label: string;
  range: string;
  completionPercent: number;
  tasksDone: number;
  tasksTotal: number;
  hoursCompleted: number;
  hoursPlanned: number;
}

export interface NativePermissionStatus {
  isNativeAndroid: boolean;
  usageAccess: boolean;
  overlayAccess: boolean;
  notifications: boolean;
  batteryUnrestricted: boolean;
}

export interface ActiveLockInfo {
  active: boolean;
  reason: string;
  untilTimeLabel: string;
  untilTimestampMs: number;
  source: 'auto-slot' | 'manual' | 'none';
}
