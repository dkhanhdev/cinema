import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { RoleGuard } from './components/common/RoleGuard';
import { UserRole } from './types';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { MoviesPage } from './pages/public/MoviesPage';
import { MovieDetailPage } from './pages/public/MovieDetailPage';
import { CinemasPage } from './pages/public/CinemasPage';
import { ShowtimesPage } from './pages/public/ShowtimesPage';

// Booking Flow
import { SeatSelectionPage } from './pages/booking/SeatSelectionPage';
import { CheckoutPage } from './pages/booking/CheckoutPage';
import { BookingSuccessPage } from './pages/booking/BookingSuccessPage';

// User & Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { TicketsPage } from './pages/user/TicketsPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { BookingHistoryPage } from './pages/user/BookingHistoryPage';

// Staff & Admin
import { StaffCheckinPage } from './pages/staff/StaffCheckinPage';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage';
import { AdminShowtimesPage } from './pages/admin/AdminShowtimesPage';
import { AdminCinemasPage } from './pages/admin/AdminCinemasPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';

const App: React.FC = () => {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  return (
    <Router>
      <div className="min-h-screen bg-[#07070b] text-neutral-100 flex flex-col font-sans selection:bg-brand-600 selection:text-white">
        {/* Persistent Global Header */}
        <Navbar />

        {/* Dynamic Main View */}
        <main className="flex-1 w-full pb-16">
          <Routes>
            {/* Public Discovery Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/showtimes" element={<ShowtimesPage />} />

            {/* Realtime Booking Routes */}
            <Route path="/seats/:showtimeId" element={<SeatSelectionPage />} />
            <Route path="/booking/showtimes/:showtimeId" element={<SeatSelectionPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route
              path="/tickets"
              element={
                <RoleGuard allowedRoles={[UserRole.USER, UserRole.STAFF, UserRole.ADMIN]}>
                  <TicketsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleGuard allowedRoles={[UserRole.USER, UserRole.STAFF, UserRole.ADMIN]}>
                  <ProfilePage />
                </RoleGuard>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <RoleGuard allowedRoles={[UserRole.USER, UserRole.STAFF, UserRole.ADMIN]}>
                  <BookingHistoryPage />
                </RoleGuard>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/checkin"
              element={
                <RoleGuard allowedRoles={[UserRole.STAFF, UserRole.ADMIN]}>
                  <StaffDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.STAFF, UserRole.ADMIN]}>
                  <StaffDashboardPage />
                </RoleGuard>
              }
            />

            {/* Admin Center Routes (Strict RBAC Protected) */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminMoviesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/showtimes"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminShowtimesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/cinemas"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminCinemasPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
                  <AdminBookingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminUsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <AdminCouponsPage />
                </RoleGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer & Toast System */}
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
