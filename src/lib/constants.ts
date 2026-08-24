export const COMPLAINT_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Security',
  'Lift/Elevator',
  'Water Supply',
  'Parking',
  'Common Area',
  'Maintenance',
  'Carpentry',
  'Pest Control',
  'Other',
] as const;

export const COMPLAINT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const COMPLAINT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export const NOTICE_CATEGORIES = [
  'General',
  'Emergency',
  'Maintenance',
  'Event',
  'Rules & Regulations',
  'Billing & Dues',
] as const;

export const DEFAULT_CONFIG = {
  OVERDUE_THRESHOLD_DAYS: 3,
  SOCIETY_NAME: 'Greenwood Heights Residents Association',
  DEFAULT_PRIORITY: 'MEDIUM',
  SOCIETY_ADDRESS: '42 Orchid Boulevard, Block 4, Silicon Oasis',
  CONTACT_PHONE: '+1 (555) 019-2834',
  CONTACT_EMAIL: 'helpdesk@greenwoodheights.org',
};

export const STATUS_COLORS = {
  OPEN: {
    bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Open',
    description: 'Complaint received and queued for assessment',
  },
  IN_PROGRESS: {
    bg: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'In Progress',
    description: 'Assigned to maintenance technician and actively being worked on',
  },
  RESOLVED: {
    bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'Resolved',
    description: 'Issue successfully fixed and marked closed',
  },
};

export const PRIORITY_COLORS = {
  LOW: {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    iconColor: 'text-slate-400',
    badge: 'border-slate-700 bg-slate-800 text-slate-300',
    label: 'Low',
  },
  MEDIUM: {
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    label: 'Medium',
  },
  HIGH: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    iconColor: 'text-rose-500',
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300 font-semibold shadow-sm',
    label: 'High Priority',
  },
};
