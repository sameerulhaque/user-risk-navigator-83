
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MainLayout from "./components/MainLayout";

// Company pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyConfiguration from "./pages/company/CompanyConfiguration";
import CompanyUsers from "./pages/company/CompanyUsers";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import UserSubmission from "./pages/user/UserSubmission";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            
            {/* Company Routes */}
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/configuration" element={<CompanyConfiguration />} />
            <Route path="/company/users" element={<CompanyUsers />} />
            
            {/* User Routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/submission" element={<UserSubmission />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
