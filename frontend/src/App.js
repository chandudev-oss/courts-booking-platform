
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourts from './pages/admin/AdminCourts';
import AdminCoaches from './pages/admin/AdminCoaches';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminPricingRules from './pages/admin/AdminPricingRules';
import AdminBookings from './pages/admin/AdminBookings';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <Bookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/courts"
              element={
                <PrivateRoute adminOnly>
                  <AdminCourts />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/coaches"
              element={
                <PrivateRoute adminOnly>
                  <AdminCoaches />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/equipment"
              element={
                <PrivateRoute adminOnly>
                  <AdminEquipment />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pricing-rules"
              element={
                <PrivateRoute adminOnly>
                  <AdminPricingRules />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <PrivateRoute adminOnly>
                  <AdminBookings />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

