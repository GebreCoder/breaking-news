import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminNews from "./pages/AdminNews";
import CreateNews from "./pages/CreateNews";
import AdminCategories from "./pages/AdminCategories";
import NewsArticle from "./pages/NewsArticle";
import CategoryNews from "./pages/CategoryNews";
import SearchNews from "./pages/SearchNews";
import AdminBreakingNews from "./pages/AdminBreakingNews";
import AdminMedia from "./pages/AdminMedia";
import AdminSiteSettings from "./pages/AdminSiteSettings";
import AdminLogin from "./pages/AdminLogin";
import EditNews from "./pages/EditNews";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    PUBLIC WEBSITE
                ========================== */}

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/news/:slug"
                    element={<NewsArticle />}
                />

                <Route
                    path="/category/:slug"
                    element={<CategoryNews />}
                />

                <Route
                    path="/search"
                    element={<SearchNews />}
                />


                {/* =========================
                    ADMIN AUTHENTICATION
                ========================== */}

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />


                {/* =========================
                    ADMIN DASHBOARD
                ========================== */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    NEWS MANAGEMENT
                ========================== */}

                <Route
                    path="/admin/news"
                    element={
                        <ProtectedRoute>
                            <AdminNews />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/news/create"
                    element={
                        <ProtectedRoute>
                            <CreateNews />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/news/edit/:id"
                    element={
                       <ProtectedRoute>
                           <EditNews />
                       </ProtectedRoute>
                    }
               />


                {/* =========================
                    CATEGORY MANAGEMENT
                ========================== */}

                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedRoute>
                            <AdminCategories />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    BREAKING NEWS
                ========================== */}

                <Route
                    path="/admin/breaking-news"
                    element={
                        <ProtectedRoute>
                            <AdminBreakingNews />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    MEDIA
                ========================== */}

                <Route
                    path="/admin/media"
                    element={
                        <ProtectedRoute>
                            <AdminMedia />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    SITE SETTINGS
                ========================== */}

                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute>
                            <AdminSiteSettings />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;