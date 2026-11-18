import type { AppState } from './types';

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const initialState: AppState = {
  categoryCodes: {
    admin: 'ADMIN123',
    supervisor: 'SUPER123',
    teacher: 'TEACH123',
  },
  users: [
    {
      id: 'u-admin',
      name: 'أبو عبد الله',
      email: 'admin@quran.center',
      password: 'admin123',
      role: 'admin',
      status: 'approved',
      createdAt: daysAgo(120),
    },
    {
      id: 'u-sup',
      name: 'أخوكم يوسف',
      email: 'yusuf@quran.center',
      password: 'super123',
      role: 'supervisor',
      status: 'approved',
      createdAt: daysAgo(90),
    },
    {
      id: 'u-teach1',
      name: 'الشيخ محمد العتيبي',
      email: 'mohammed@quran.center',
      password: 'teach123',
      role: 'teacher',
      status: 'approved',
      createdAt: daysAgo(60),
    },
    {
      id: 'u-teach2',
      name: 'الشيخ عبد الرحمن',
      email: 'abdulrahman@quran.center',
      password: 'teach123',
      role: 'teacher',
      status: 'approved',
      createdAt: daysAgo(45),
    },
    {
      id: 'u-pending1',
      name: 'أحمد الزهراني',
      email: 'ahmed@quran.center',
      password: 'teach123',
      role: 'teacher',
      status: 'pending',
      createdAt: daysAgo(2),
    },
    {
      id: 'u-pending2',
      name: 'سعد بن خالد',
      email: 'saad@quran.center',
      password: 'super123',
      role: 'supervisor',
      status: 'pending',
      createdAt: daysAgo(1),
    },
  ],
  circles: [
    {
      id: 'c1',
      name: 'حلقة الفجر',
      teacherId: 'u-teach1',
      workingDays: [0, 1, 2, 3], // Sun..Wed
      createdAt: daysAgo(55),
    },
    {
      id: 'c2',
      name: 'حلقة النور',
      teacherId: 'u-teach1',
      workingDays: [1, 3, 5],
      createdAt: daysAgo(30),
    },
    {
      id: 'c3',
      name: 'حلقة الباقيات الصالحات',
      teacherId: 'u-teach2',
      workingDays: [0, 2, 4],
      createdAt: daysAgo(40),
    },
  ],
  students: [
    // Circle c1
    { id: 's1', name: 'عبد الله محمد العتيبي', fatherName: 'محمد', motherName: 'فاطمة', parentPhone: '0551112222', parentCode: 'QC-1A2B', circleId: 'c1', currentPage: 24, points: 185, createdAt: daysAgo(50) },
    { id: 's2', name: 'سارة محمد العتيبي', fatherName: 'محمد', motherName: 'فاطمة', parentPhone: '0551112222', parentCode: 'QC-3C4D', circleId: 'c1', currentPage: 19, points: 160, createdAt: daysAgo(50) },
    { id: 's3', name: 'خالد إبراهيم', fatherName: 'إبراهيم', motherName: 'عائشة', parentPhone: '0553334444', parentCode: 'QC-5E6F', circleId: 'c1', currentPage: 31, points: 210, createdAt: daysAgo(48) },
    { id: 's4', name: 'ريم إبراهيم', fatherName: 'إبراهيم', motherName: 'عائشة', parentPhone: '0553334444', parentCode: 'QC-7G8H', circleId: 'c1', currentPage: 12, points: 95, createdAt: daysAgo(48) },
    // Circle c2
    { id: 's5', name: 'يوسف عبد العزيز', fatherName: 'عبد العزيز', motherName: 'منى', parentPhone: '0555556666', parentCode: 'QC-9I0J', circleId: 'c2', currentPage: 8, points: 70, createdAt: daysAgo(28) },
    { id: 's6', name: 'مريم عبد العزيز', fatherName: 'عبد العزيز', motherName: 'منى', parentPhone: '0555556666', parentCode: 'QC-K1L2', circleId: 'c2', currentPage: 15, points: 120, createdAt: daysAgo(28) },
    { id: 's7', name: 'بلال سعيد', fatherName: 'سعيد', motherName: 'هدى', parentPhone: '0557778888', parentCode: 'QC-M3N4', circleId: 'c2', currentPage: 5, points: 45, createdAt: daysAgo(20) },
    // Circle c3
    { id: 's8', name: 'عائشة عبد الرحمن', fatherName: 'عبد الرحمن', motherName: 'زينب', parentPhone: '0559990000', parentCode: 'QC-O5P6', circleId: 'c3', currentPage: 42, points: 240, createdAt: daysAgo(38) },
    { id: 's9', name: 'عمر عبد الرحمن', fatherName: 'عبد الرحمن', motherName: 'زينب', parentPhone: '0559990000', parentCode: 'QC-Q7R8', circleId: 'c3', currentPage: 27, points: 175, createdAt: daysAgo(38) },
    { id: 's10', name: 'حفصة ناصر', fatherName: 'ناصر', motherName: 'سمية', parentPhone: '0551212121', parentCode: 'QC-S9T0', circleId: 'c3', currentPage: 33, points: 195, createdAt: daysAgo(35) },
    { id: 's11', name: 'أنس ناصر', fatherName: 'ناصر', motherName: 'سمية', parentPhone: '0551212121', parentCode: 'QC-U1V2', circleId: 'c3', currentPage: 10, points: 60, createdAt: daysAgo(35) },
  ],
  attendance: (() => {
    const recs: { id: string; studentId: string; date: string; present: boolean }[] = [];
    let id = 1;
    const c1Students = ['s1', 's2', 's3', 's4'];
    const c2Students = ['s5', 's6', 's7'];
    const c3Students = ['s8', 's9', 's10', 's11'];
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      const date = iso(d);
      // c1: Sun..Wed (0,1,2,3)
      if ([0, 1, 2, 3].includes(dow)) {
        c1Students.forEach((sid, idx) => {
          recs.push({ id: `a${id++}`, studentId: sid, date, present: (i + idx) % 5 !== 0 });
        });
      }
      // c2: 1,3,5
      if ([1, 3, 5].includes(dow)) {
        c2Students.forEach((sid, idx) => {
          recs.push({ id: `a${id++}`, studentId: sid, date, present: (i + idx) % 4 !== 0 });
        });
      }
      // c3: 0,2,4
      if ([0, 2, 4].includes(dow)) {
        c3Students.forEach((sid, idx) => {
          recs.push({ id: `a${id++}`, studentId: sid, date, present: (i + idx) % 6 !== 0 });
        });
      }
    }
    return recs;
  })(),
  memorization: [
    { id: 'm1', studentId: 's1', date: daysAgo(1), fromPage: 23, toPage: 24 },
    { id: 'm2', studentId: 's3', date: daysAgo(1), fromPage: 30, toPage: 31 },
    { id: 'm3', studentId: 's8', date: daysAgo(2), fromPage: 41, toPage: 42 },
    { id: 'm4', studentId: 's9', date: daysAgo(2), fromPage: 26, toPage: 27 },
    { id: 'm5', studentId: 's6', date: daysAgo(3), fromPage: 14, toPage: 15 },
    { id: 'm6', studentId: 's10', date: daysAgo(4), fromPage: 32, toPage: 33 },
    { id: 'm7', studentId: 's2', date: daysAgo(5), fromPage: 18, toPage: 19 },
  ],
  activities: [
    { id: 'act1', name: 'الحضور المبكر', points: 5, createdAt: daysAgo(80) },
    { id: 'act2', name: 'إتمام الورد', points: 10, createdAt: daysAgo(80) },
    { id: 'act3', name: 'السلوك الحسن', points: 7, createdAt: daysAgo(80) },
    { id: 'act4', name: 'المشاركة الفعّالة', points: 8, createdAt: daysAgo(80) },
    { id: 'act5', name: 'حفظ سورة كاملة', points: 20, createdAt: daysAgo(80) },
    { id: 'act6', name: 'مراجعة شاملة', points: 15, createdAt: daysAgo(80) },
  ],
  pointsRecords: [
    { id: 'p1', studentId: 's1', activityId: 'act1', activityName: 'الحضور المبكر', points: 5, date: daysAgo(1) },
    { id: 'p2', studentId: 's1', activityId: 'act2', activityName: 'إتمام الورد', points: 10, date: daysAgo(3) },
    { id: 'p3', studentId: 's3', activityId: 'act5', activityName: 'حفظ سورة كاملة', points: 20, date: daysAgo(2) },
    { id: 'p4', studentId: 's8', activityId: 'act6', activityName: 'مراجعة شاملة', points: 15, date: daysAgo(4) },
    { id: 'p5', studentId: 's6', activityId: 'act3', activityName: 'السلوك الحسن', points: 7, date: daysAgo(5) },
    { id: 'p6', studentId: 's10', activityId: 'act4', activityName: 'المشاركة الفعّالة', points: 8, date: daysAgo(6) },
    { id: 'p7', studentId: 's2', activityId: 'act1', activityName: 'الحضور المبكر', points: 5, date: daysAgo(7) },
  ],
  announcements: [
    { id: 'an1', title: 'مرحباً بكم في مركز عطاء', body: 'نسأل الله أن ينفع بكم وأن يجعلكم من أهل القرآن. لا تنسوا الورد اليومي.', audience: 'all', createdAt: daysAgo(10) },
    { id: 'an2', title: 'اجتماع المعلمين', body: 'يُعقد اجتماع المعلمين يوم الأحد القادم بعد صلاة العصر في قاعة الدروس.', audience: 'teachers', createdAt: daysAgo(5) },
    { id: 'an3', title: 'تقرير أولياء الأمور', body: 'يمكنكم متابعة تقدم أبنائكم في الحفظ والنقاط عبر بوابة ولي الأمر باستخدام رمز الطالب.', audience: 'parents', createdAt: daysAgo(3) },
    { id: 'an4', title: 'مهام المشرفين', body: 'يرجى من المشرفين مراجعة الحلقات هذا الأسبوع وإعداد تقرير النقل بين الحلقات.', audience: 'supervisors', createdAt: daysAgo(2) },
    { id: 'an5', title: 'مسابقة ختم القرآن', body: 'تبدأ مسابقة ختم القرآن الكريم مطلع الشهر القادم. جوائز قيّمة للفائزين!', audience: 'all', createdAt: daysAgo(1) },
  ],
};
