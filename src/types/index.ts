export type UserRole = 'RESIDENT' | 'ADMIN';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ComplaintStatusType = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unitNumber?: string | null;
  phone?: string | null;
}

export interface ComplaintData {
  id: string;
  title: string;
  description: string;
  category: string;
  photoUrl?: string | null;
  priority: PriorityLevel;
  status: ComplaintStatusType;
  residentId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt?: string | Date | null;
  resident?: {
    id: string;
    name: string;
    email: string;
    unitNumber?: string | null;
    phone?: string | null;
  };
  history?: ComplaintHistoryData[];
  isOverdue?: boolean;
  ageInDays?: number;
}

export interface ComplaintHistoryData {
  id: string;
  complaintId: string;
  previousStatus?: ComplaintStatusType | null;
  newStatus: ComplaintStatusType;
  actorId: string;
  actor?: {
    id: string;
    name: string;
    role: UserRole;
  };
  note?: string | null;
  timestamp: string | Date;
}

export interface NoticeData {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  authorId: string;
  author?: {
    id: string;
    name: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  highPriorityComplaints: number;
  recentComplaints: ComplaintData[];
  statusBreakdown: {
    status: ComplaintStatusType;
    count: number;
    percentage: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
  }[];
  pinnedNotices: NoticeData[];
  overdueThresholdDays: number;
}

export interface SystemConfigMap {
  OVERDUE_THRESHOLD_DAYS: number;
  SOCIETY_NAME: string;
  DEFAULT_PRIORITY: PriorityLevel;
  SOCIETY_ADDRESS?: string;
  CONTACT_PHONE?: string;
  CONTACT_EMAIL?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
