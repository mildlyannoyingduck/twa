import { ClassPreset, DayOfWeek, SubjectId } from '../types';

export const SUBJECT_META: Record<
  SubjectId,
  {
    name: string;
    short: string;
    text: string;
    bgSoft: string;
    borderSoft: string;
    bar: string;
    strokeHex: string;
    strokeDarkHex: string;
  }
> = {
  biology: {
    name: 'Biology',
    short: 'Bio',
    text: 'text-emerald-700 dark:text-emerald-400',
    bgSoft: 'bg-emerald-500/8 dark:bg-emerald-400/10',
    borderSoft: 'border-emerald-500/20 dark:border-emerald-400/20',
    bar: 'bg-emerald-600 dark:bg-emerald-400',
    strokeHex: '#059669',
    strokeDarkHex: '#34D399',
  },
  physics: {
    name: 'Physics',
    short: 'Phy',
    text: 'text-orange-700 dark:text-orange-400',
    bgSoft: 'bg-orange-500/8 dark:bg-orange-400/10',
    borderSoft: 'border-orange-500/20 dark:border-orange-400/20',
    bar: 'bg-orange-600 dark:bg-orange-400',
    strokeHex: '#EA580C',
    strokeDarkHex: '#FB923C',
  },
  chemistry: {
    name: 'Chemistry',
    short: 'Chem',
    text: 'text-blue-700 dark:text-blue-400',
    bgSoft: 'bg-blue-500/8 dark:bg-blue-400/10',
    borderSoft: 'border-blue-500/20 dark:border-blue-400/20',
    bar: 'bg-blue-600 dark:bg-blue-400',
    strokeHex: '#2563EB',
    strokeDarkHex: '#60A5FA',
  },
};

export const CLASS_PRESETS: ClassPreset[] = [
  {
    id: 'bio-theory',
    subject: 'biology',
    title: 'Biology Theory',
    teacher: 'Sashanka Dhanujaya',
    kind: 'Theory',
  },
  {
    id: 'bio-paper',
    subject: 'biology',
    title: 'Biology Paper',
    teacher: 'Sashanka Dhanujaya',
    kind: 'Paper',
  },
  {
    id: 'phy-theory-rev',
    subject: 'physics',
    title: 'Physics Theory & Revision',
    teacher: 'Samitha Rathnayake',
    kind: 'Revision',
  },
  {
    id: 'phy-paper',
    subject: 'physics',
    title: 'Physics Paper',
    teacher: 'Sujith Liyanage',
    kind: 'Paper',
  },
  {
    id: 'chem-theory',
    subject: 'chemistry',
    title: 'Chemistry Theory',
    teacher: 'Amila Dasanayake',
    kind: 'Theory',
  },
  {
    id: 'chem-paper',
    subject: 'chemistry',
    title: 'Chemistry Paper',
    teacher: 'Amila Dasanayake',
    kind: 'Paper',
  },
];

export const DAYS_ORDER: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ALLOWED_APPS_ON_A07 = [
  { name: 'Phone', packageHint: 'com.samsung.android.dialer' },
  { name: 'Contacts', packageHint: 'com.samsung.android.app.contacts' },
  { name: 'Calculator', packageHint: 'com.sec.android.app.popupcalculator' },
  { name: 'Settings', packageHint: 'com.android.settings' },
  { name: 'This Week', packageHint: 'com.risinu.thisweek' },
];
