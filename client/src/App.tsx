import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Deliveries from './pages/Deliveries';
import SettingsPage from './pages/Settings';
import ResetPassword from './pages/ResetPassword';

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <Router>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#ffffff',
                                color: '#0f172a',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '12px',
                                fontSize: '14px',
                            },
                            success: { iconTheme: { primary: '#06b6d4', secondary: '#fff' } },
                            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                        }}
                    />
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Protected — App Layout */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/orders/new" element={<CreateOrder />} />
                            <Route path="/orders/:id" element={<OrderDetail />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/payments" element={<Payments />} />
                            <Route path="/reports" element={
                                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                    <Reports />
                                </ProtectedRoute>
                            } />
                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <UserManagement />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/deliveries" element={<Deliveries />} />
                            <Route path="/settings" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <SettingsPage />
                                </ProtectedRoute>
                            } />
                        </Route>

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
