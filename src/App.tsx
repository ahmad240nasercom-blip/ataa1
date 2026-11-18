import { AppProvider, useStore } from './store';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentPortal } from './components/ParentPortal';

function Router() {
  const { currentUser, parentStudents, pendingUserId } = useStore();

  if (currentUser) {
    if (currentUser.role === 'admin') return <AdminDashboard />;
    if (currentUser.role === 'supervisor') return <SupervisorDashboard />;
    if (currentUser.role === 'teacher') return <TeacherDashboard />;
  }

  if (parentStudents.length > 0) return <ParentPortal />;

  // While a registration is pending approval, keep showing the pending screen
  if (pendingUserId) return <AuthScreen />;

  return <AuthScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
