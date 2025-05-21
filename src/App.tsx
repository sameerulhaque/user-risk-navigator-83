
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MainLayout from "./components/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Company pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyConfiguration from "./pages/company/CompanyConfiguration";
import CompanyUsers from "./pages/company/CompanyUsers";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import UserSubmission from "./pages/user/UserSubmission";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    <Route element={<MainLayout />}>
      <Route path="/home" element={<Home />} />
      
      {/* Protected Company Routes - Admin only */}
      <Route path="/company/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <CompanyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/company/configuration" element={
        <ProtectedRoute requireAdmin={true}>
          <CompanyConfiguration />
        </ProtectedRoute>
      } />
      <Route path="/company/users" element={
        <ProtectedRoute requireAdmin={true}>
          <CompanyUsers />
        </ProtectedRoute>
      } />
      
      {/* Protected User Routes - Any authenticated user */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/submission" element={
        <ProtectedRoute>
          <UserSubmission />
        </ProtectedRoute>
      } />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
