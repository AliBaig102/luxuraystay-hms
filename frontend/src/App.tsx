import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/custom/ProtectedRoute";
import { PublicRoute } from "@/components/custom/PublicRoute";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Dashboard } from "@/pages/Dashboard";
import { Unauthorized } from "@/pages/Unauthorized";
import { NotFound } from "@/pages/NotFound";
import { Layout } from "./components/dashboard/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - redirect to dashboard if authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected Routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  {/* <Route path="products" element={<Products />} />
                <Route path="services" element={<Services />} />
                <Route path="categories" element={<Categories />} />
                <Route path="customers" element={<Customers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} /> */}
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Unauthorized page for role-based access */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
