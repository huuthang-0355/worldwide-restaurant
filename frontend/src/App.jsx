import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { MenuProvider } from "./context/MenuContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ModifierProvider } from "./context/ModifierContext";
import { TableProvider } from "./context/TableContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ToastContainer from "./components/common/ToastContainer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MenuManagement from "./pages/admin/MenuManagementRefactored";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ModifierManagement from "./pages/admin/ModifierManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import StaffProfile from "./pages/admin/StaffProfile";
import TableManagement from "./pages/admin/TableManagement";
import StaffLogin from "./pages/auth/StaffLogin";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import NotFound from "./pages/NotFound";

/**
 * App - Root component with routing and context providers
 */
function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <MenuProvider>
                    <CategoryProvider>
                        <ModifierProvider>
                            <TableProvider>
                                <Router>
                                    <ToastContainer />
                                    <Routes>
                                        {/* Redirect root to admin menu */}
                                        <Route
                                            path="/"
                                            element={
                                                <Navigate
                                                    to="/admin/menu"
                                                    replace
                                                />
                                            }
                                        />

                                        {/* Auth Routes */}
                                        <Route
                                            path="/admin/login"
                                            element={<StaffLogin />}
                                        />
                                        <Route
                                            path="/admin/forgot-password"
                                            element={
                                                <ForgotPassword variant="staff" />
                                            }
                                        />
                                        <Route
                                            path="/admin/reset-password"
                                            element={
                                                <ResetPassword variant="staff" />
                                            }
                                        />
                                        <Route
                                            path="/admin/verify-email"
                                            element={
                                                <VerifyEmail variant="staff" />
                                            }
                                        />
                                        <Route
                                            path="/login"
                                            element={<CustomerLogin />}
                                        />
                                        <Route
                                            path="/register"
                                            element={<CustomerRegister />}
                                        />
                                        <Route
                                            path="/forgot-password"
                                            element={
                                                <ForgotPassword variant="customer" />
                                            }
                                        />
                                        <Route
                                            path="/reset-password"
                                            element={
                                                <ResetPassword variant="customer" />
                                            }
                                        />
                                        <Route
                                            path="/verify-email"
                                            element={
                                                <VerifyEmail variant="customer" />
                                            }
                                        />

                                        {/* Admin Routes (Protected) */}
                                        <Route
                                            path="/admin"
                                            element={
                                                <ProtectedRoute>
                                                    <AdminLayout />
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route
                                                index
                                                element={
                                                    <Navigate
                                                        to="/admin/menu"
                                                        replace
                                                    />
                                                }
                                            />
                                            <Route
                                                path="dashboard"
                                                element={<Dashboard />}
                                            />
                                            <Route
                                                path="menu"
                                                element={<MenuManagement />}
                                            />
                                            <Route
                                                path="categories"
                                                element={<CategoryManagement />}
                                            />
                                            <Route
                                                path="modifiers"
                                                element={<ModifierManagement />}
                                            />
                                            <Route
                                                path="tables"
                                                element={<TableManagement />}
                                            />
                                            <Route
                                                path="staff"
                                                element={
                                                    <ProtectedRoute
                                                        allowedRoles={["ADMIN"]}
                                                    >
                                                        <StaffManagement />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="profile"
                                                element={<StaffProfile />}
                                            />
                                        </Route>

                                        {/* 404 Not Found */}
                                        <Route
                                            path="*"
                                            element={<NotFound />}
                                        />
                                    </Routes>
                                </Router>
                            </TableProvider>
                        </ModifierProvider>
                    </CategoryProvider>
                </MenuProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
