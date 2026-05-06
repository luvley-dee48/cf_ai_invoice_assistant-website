import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Chat from "./pages/dashboard/Chat";
import Tracker from "./pages/dashboard/Tracker";
import Memory from "./pages/dashboard/Memory";
import Tasks from "./pages/dashboard/Tasks";
import Settings from "./pages/dashboard/Settings";
import Billing from "./pages/dashboard/Billing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="chat" element={<Chat />} />
            <Route path="tracker" element={<Tracker />} />
            <Route path="memory" element={<Memory />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
