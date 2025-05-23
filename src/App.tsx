
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import CompanyDashboard from "@/pages/company/CompanyDashboard";
import CompanyConfiguration from "@/pages/company/CompanyConfiguration";
import CompanyUsers from "@/pages/company/CompanyUsers";
import UserDashboard from "@/pages/user/UserDashboard";
import UserSubmission from "@/pages/user/UserSubmission";
import VersionHistory from "@/pages/VersionHistory";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Version History */}
          <Route path="/versioning" element={<VersionHistory />} />
          
          {/* Company Routes */}
          <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/configuration" element={<ProtectedRoute><CompanyConfiguration /></ProtectedRoute>} />
          <Route path="/company/users" element={<ProtectedRoute><CompanyUsers /></ProtectedRoute>} />
          
          {/* User Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/submission" element={<ProtectedRoute><UserSubmission /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
