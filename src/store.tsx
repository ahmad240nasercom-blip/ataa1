import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  AppState,
  User,
  Circle,
  Student,
  AttendanceRecord,
  MemorizationRecord,
  Activity,
  PointsRecord,
  Announcement,
  CategoryCodes,
  Role,
} from './types';
import { initialState } from './data';

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);

export type CodeRoute =
  | { kind: 'admin' }
  | { kind: 'parent'; studentId: string }
  | { kind: 'staff'; role: 'teacher' | 'supervisor' }
  | { kind: 'invalid' };

interface Store {
  state: AppState;
  currentUser: User | null;
  // parent session
  parentStudents: Student[];
  activeStudentId: string | null;
  // pending registration session
  pendingUserId: string | null;

  login: (email: string, password: string) => User | null;
  loginAdminByCode: (code: string) => boolean;
  loginStaffByCode: (code: string) => boolean;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role: Role }) => string;
  resolveCode: (code: string) => CodeRoute;
  clearPending: () => void;
  linkParentStudent: (code: string) => boolean;
  setActiveStudent: (id: string) => void;
  clearParentSession: () => void;

  // admin
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  setCategoryCodes: (codes: CategoryCodes) => void;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  addActivity: (name: string, points: number) => void;
  deleteActivity: (id: string) => void;

  // teacher / supervisor
  addCircle: (name: string, workingDays: number[]) => string;
  renameCircle: (id: string, name: string) => void;
  deleteCircle: (id: string) => void;
  addStudent: (data: Omit<Student, 'id' | 'points' | 'createdAt' | 'circleId' | 'currentPage'>, circleId: string) => void;
  setAttendance: (studentId: string, date: string, present: boolean) => void;
  logMemorization: (studentId: string) => void;
  overridePage: (studentId: string, page: number) => void;
  assignPoints: (studentId: string, activityId: string) => void;

  // supervisor transfer
  transferStudents: (
    studentIds: string[],
    destCircleId: string,
    keepData: boolean
  ) => void;
}

const UNIFIED_STAFF_CODES: Record<'teacher' | 'supervisor', string> = {
  teacher: '12345678',
  supervisor: '11223344',
};

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [parentStudentIds, setParentStudentIds] = useState<string[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === currentUserId) ?? null,
    [state.users, currentUserId]
  );

  const parentStudents = useMemo(
    () => state.students.filter((s) => parentStudentIds.includes(s.id)),
    [state.students, parentStudentIds]
  );

  const store: Store = {
    state,
    currentUser,
    parentStudents,
    activeStudentId,
    pendingUserId,

    login: (email, password) => {
      const u = state.users.find(
        (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
      );
      if (u && u.status === 'approved') {
        setCurrentUserId(u.id);
        setPendingUserId(null);
        return u;
      }
      return null;
    },

    loginAdminByCode: (code) => {
      const c = code.trim().toUpperCase();
      if (c !== state.categoryCodes.admin.toUpperCase()) return false;
      const admin = state.users.find((u) => u.role === 'admin' && u.status === 'approved');
      if (!admin) return false;
      setCurrentUserId(admin.id);
      return true;
    },

    loginStaffByCode: (code) => {
      const cc = code.trim().toUpperCase();
      const role: 'teacher' | 'supervisor' | null =
        cc === UNIFIED_STAFF_CODES.teacher ||
        cc === state.categoryCodes.teacher.toUpperCase()
          ? 'teacher'
          : cc === UNIFIED_STAFF_CODES.supervisor ||
              cc === state.categoryCodes.supervisor.toUpperCase()
            ? 'supervisor'
            : null;
      if (!role) return false;
      const user = state.users.find((u) => u.role === role && u.status === 'approved');
      if (!user) return false;
      setCurrentUserId(user.id);
      setPendingUserId(null);
      return true;
    },

    logout: () => setCurrentUserId(null),

    register: ({ name, email, password, role }) => {
      const id = uid('u');
      setState((s) => ({
        ...s,
        users: [
          ...s.users,
          {
            id,
            name,
            email,
            password,
            role,
            status: 'pending',
            createdAt: today(),
          },
        ],
      }));
      setPendingUserId(id);
      return id;
    },

    resolveCode: (code) => {
      const c = code.trim().toUpperCase();
      if (c === state.categoryCodes.admin.toUpperCase()) return { kind: 'admin' };
      if (c === state.categoryCodes.supervisor.toUpperCase()) return { kind: 'staff', role: 'supervisor' };
      if (c === state.categoryCodes.teacher.toUpperCase()) return { kind: 'staff', role: 'teacher' };
      const student = state.students.find((s) => s.parentCode.toUpperCase() === c);
      if (student) return { kind: 'parent', studentId: student.id };
      return { kind: 'invalid' };
    },

    clearPending: () => setPendingUserId(null),

    linkParentStudent: (code) => {
      const c = code.trim().toUpperCase();
      const s = state.students.find((x) => x.parentCode.toUpperCase() === c);
      if (!s) return false;
      setParentStudentIds((ids) => (ids.includes(s.id) ? ids : [...ids, s.id]));
      setActiveStudentId(s.id);
      return true;
    },

    setActiveStudent: (id) => setActiveStudentId(id),
    clearParentSession: () => {
      setParentStudentIds([]);
      setActiveStudentId(null);
    },

    approveUser: (id) =>
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? { ...u, status: 'approved' } : u)),
      })),

    rejectUser: (id) =>
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? { ...u, status: 'rejected' } : u)),
      })),

    setCategoryCodes: (codes) => setState((s) => ({ ...s, categoryCodes: codes })),

    addAnnouncement: (a) =>
      setState((s) => ({
        ...s,
        announcements: [
          { ...a, id: uid('an'), createdAt: today() },
          ...s.announcements,
        ],
      })),

    deleteAnnouncement: (id) =>
      setState((s) => ({
        ...s,
        announcements: s.announcements.filter((a) => a.id !== id),
      })),

    addActivity: (name, points) =>
      setState((s) => ({
        ...s,
        activities: [
          ...s.activities,
          { id: uid('act'), name, points, createdAt: today() },
        ],
      })),

    deleteActivity: (id) =>
      setState((s) => ({
        ...s,
        activities: s.activities.filter((a) => a.id !== id),
      })),

    addCircle: (name, workingDays) => {
      const id = uid('c');
      setState((s) => ({
        ...s,
        circles: [
          ...s.circles,
          { id, name, teacherId: currentUserId ?? '', workingDays, createdAt: today() },
        ],
      }));
      return id;
    },

    renameCircle: (id, name) =>
      setState((s) => ({
        ...s,
        circles: s.circles.map((c) => (c.id === id ? { ...c, name } : c)),
      })),

    deleteCircle: (id) =>
      setState((s) => ({
        ...s,
        circles: s.circles.filter((c) => c.id !== id),
        students: s.students.filter((st) => st.circleId !== id),
      })),

    addStudent: (data, circleId) =>
      setState((s) => ({
        ...s,
        students: [
          ...s.students,
          { ...data, id: uid('s'), circleId, currentPage: 0, points: 0, createdAt: today() },
        ],
      })),

    setAttendance: (studentId, date, present) =>
      setState((s) => {
        const existing = s.attendance.find(
          (a) => a.studentId === studentId && a.date === date
        );
        if (existing) {
          return {
            ...s,
            attendance: s.attendance.map((a) =>
              a.id === existing.id ? { ...a, present } : a
            ),
          };
        }
        return {
          ...s,
          attendance: [
            ...s.attendance,
            { id: uid('a'), studentId, date, present },
          ],
        };
      }),

    logMemorization: (studentId) =>
      setState((s) => {
        const st = s.students.find((x) => x.id === studentId);
        if (!st) return s;
        const from = st.currentPage;
        const to = from + 1;
        return {
          ...s,
          students: s.students.map((x) =>
            x.id === studentId ? { ...x, currentPage: to } : x
          ),
          memorization: [
            ...s.memorization,
            { id: uid('m'), studentId, date: today(), fromPage: from, toPage: to },
          ],
        };
      }),

    overridePage: (studentId, page) =>
      setState((s) => ({
        ...s,
        students: s.students.map((x) =>
          x.id === studentId ? { ...x, currentPage: page } : x
        ),
      })),

    assignPoints: (studentId, activityId) =>
      setState((s) => {
        const act = s.activities.find((a) => a.id === activityId);
        if (!act) return s;
        return {
          ...s,
          students: s.students.map((x) =>
            x.id === studentId ? { ...x, points: x.points + act.points } : x
          ),
          pointsRecords: [
            ...s.pointsRecords,
            {
              id: uid('p'),
              studentId,
              activityId,
              activityName: act.name,
              points: act.points,
              date: today(),
            },
          ],
        };
      }),

    transferStudents: (studentIds, destCircleId, keepData) =>
      setState((s) => ({
        ...s,
        students: s.students.map((st) => {
          if (!studentIds.includes(st.id)) return st;
          if (keepData) return { ...st, circleId: destCircleId };
          return {
            ...st,
            circleId: destCircleId,
            points: 0,
            currentPage: 0,
          };
        }),
        attendance: keepData
          ? s.attendance
          : s.attendance.filter((a) => !studentIds.includes(a.studentId)),
        memorization: keepData
          ? s.memorization
          : s.memorization.filter((m) => !studentIds.includes(m.studentId)),
        pointsRecords: keepData
          ? s.pointsRecords
          : s.pointsRecords.filter((p) => !studentIds.includes(p.studentId)),
      })),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}

// helpers
export function genStudentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let s = 'QC-';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
