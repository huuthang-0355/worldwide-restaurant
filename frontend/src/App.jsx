import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { MenuProvider } from "./context/MenuContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ModifierProvider } from "./context/ModifierContext";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MenuManagement from "./pages/admin/MenuManagementRefactored";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ModifierManagement from "./pages/admin/ModifierManagement";
import NotFound from "./pages/NotFound";

/**
 * App - Root component with routing and context providers
 */
function App() {
    return (
        <MenuProvider>
            <CategoryProvider>
                <ModifierProvider>
                    <Router>
                        <Routes>
                            {/* Redirect root to admin menu */}
                            <Route
                                path="/"
                                element={<Navigate to="/admin/menu" replace />}
                            />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route
                                    index
                                    element={
                                        <Navigate to="/admin/menu" replace />
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
                            </Route>

                            {/* 404 Not Found */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                </ModifierProvider>
            </CategoryProvider>
        </MenuProvider>
    );
}

export default App;
