import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { MediSyncProvider } from '@/lib/MediSyncContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Role Select (login page)
import RoleSelect from './pages/RoleSelect';

// Patient pages
import PatientLayout from './pages/patient/PatientLayout';
import PatientHome from './pages/patient/PatientHome';
import BookAppointment from './pages/patient/BookAppointment';
import HealthRecords from './pages/patient/HealthRecords';
import Prescriptions from './pages/patient/Prescriptions';
import VideoConsultation from './pages/patient/VideoConsultation';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor pages
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorHome from './pages/doctor/DoctorHome';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorPatients from './pages/doctor/DoctorPatients';
import Consultations from './pages/doctor/Consultations';
import WritePrescription from './pages/doctor/WritePrescription';
import DoctorVideoRooms from './pages/doctor/DoctorVideoRooms';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

const AuthenticatedApp = () => {
    // We are keeping AuthProvider to avoid breaking anything that depends on it,
    // but the actual auth data is currently driven by MediSyncContext.
    // We bypass the auth loading state if it errors.

    return (
        <Routes>
            {/* Default: role select / login */}
            <Route path="/" element={<RoleSelect />} />
            <Route path="/login" element={<RoleSelect />} />

            {/* Patient routes */}
            <Route path="/patient" element={<PatientLayout />}>
                <Route index element={<PatientHome />} />
                <Route path="book" element={<BookAppointment />} />
                <Route path="records" element={<HealthRecords />} />
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="video" element={<VideoConsultation />} />
                <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor routes */}
            <Route path="/doctor" element={<DoctorLayout />}>
                <Route index element={<DoctorHome />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="consultations" element={<Consultations />} />
                <Route path="prescribe" element={<WritePrescription />} />
                <Route path="video" element={<DoctorVideoRooms />} />
                <Route path="profile" element={<DoctorProfile />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="doctors" element={<AdminDoctors />} />
                <Route path="patients" element={<AdminPatients />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <MediSyncProvider>
                <QueryClientProvider client={queryClientInstance}>
                    <Router>
                        <AuthenticatedApp />
                    </Router>
                    <Toaster />
                </QueryClientProvider>
            </MediSyncProvider>
        </AuthProvider>
    )
}

export default App
