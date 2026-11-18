export type Role = 'admin' | 'supervisor' | 'teacher' | 'parent';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
}

export interface Circle {
  id: string;
  name: string;
  teacherId: string;
  workingDays: number[]; // 0=Sun ... 6=Sat
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  parentCode: string;
  circleId: string;
  currentPage: number; // memorization
  points: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
}

export interface MemorizationRecord {
  id: string;
  studentId: string;
  date: string;
  fromPage: number;
  toPage: number;
}

export interface Activity {
  id: string;
  name: string;
  points: number;
  createdAt: string;
}

export interface PointsRecord {
  id: string;
  studentId: string;
  activityId: string;
  activityName: string;
  points: number;
  date: string;
}

export type AnnouncementAudience = 'all' | 'parents' | 'teachers' | 'supervisors';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  createdAt: string;
}

export interface CategoryCodes {
  admin: string;
  supervisor: string;
  teacher: string;
}

export interface AppState {
  users: User[];
  circles: Circle[];
  students: Student[];
  attendance: AttendanceRecord[];
  memorization: MemorizationRecord[];
  activities: Activity[];
  pointsRecords: PointsRecord[];
  announcements: Announcement[];
  categoryCodes: CategoryCodes;
}

export type Screen =
  | 'landing'
  | 'register'
  | 'parent-login'
  | 'dashboard';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'students'
  | 'circles'
  | 'config'
  | 'analytics'
  | 'announcements';

export type SupervisorTab =
  | 'circles'
  | 'transfer';

export type TeacherTab =
  | 'circles'
  | 'circle';

export type ParentTab =
  | 'profile';
