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
              <Dashboard />
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
