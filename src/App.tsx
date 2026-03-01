import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequirePermission from "@/components/RequirePermission";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Features from "./pages/Features";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SuperAdminLogin from "./pages/super-admin/SuperAdminLogin";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import Tenants from "./pages/super-admin/Tenants";
import Users from "./pages/super-admin/users/Users";
import Plans from "./pages/super-admin/Plans";
import Subscriptions from "./pages/super-admin/Subscriptions";
import Transactions from "./pages/super-admin/Transactions";
import AdminPaymentMethods from "./pages/super-admin/AdminPaymentMethods";
import AdminChangePassword from "./pages/super-admin/AdminChangePassword";
import ClinicSelection from "./pages/ClinicSelection";
import Dashboard from "./pages/dashboard/Dashboard";
import XrayAnalysis from "./pages/dashboard/xray-analysis/XrayAnalysis";
import AITestAnalysis from "./pages/dashboard/ai-test-analysis/AITestAnalysis";
import AITestComparison from "./pages/dashboard/ai-test-comparison/AITestComparison";
import Patients from "./pages/dashboard/patients/Patients";
import Appointments from "./pages/dashboard/appointments/Appointments";
import Billing from "./pages/dashboard/billing/Billing";
import Leads from "./pages/dashboard/leads/Leads";
import Services from "./pages/dashboard/services/Services";
import Inventory from "./pages/dashboard/inventory/Inventory";
import Staff from "./pages/dashboard/staff/Staff";
import Invoices from "./pages/dashboard/invoices/Invoices";
import Payments from "./pages/dashboard/payments/Payments";
import Payroll from "./pages/dashboard/payroll/Payroll";
import Expenses from "./pages/dashboard/expenses/Expenses";
import Performance from "./pages/dashboard/performance/Performance";
import Prescriptions from "./pages/dashboard/prescriptions/Prescriptions";
import Odontograms from "./pages/dashboard/odontograms/Odontograms";
import Analytics from "./pages/dashboard/analytics/Analytics";
import TestReports from "./pages/dashboard/test-reports/TestReports";
import Tests from "./pages/dashboard/tests/Tests";
import LabVendors from "./pages/dashboard/lab-vendors/LabVendors";
import Methodology from "./pages/dashboard/test-modules/methodology/Methodology";
import TurnaroundTime from "./pages/dashboard/test-modules/turnaround-time/TurnaroundTime";
import SampleType from "./pages/dashboard/test-modules/sample-type/SampleType";
import Category from "./pages/dashboard/test-modules/category/Category";
import Calendar from "./pages/dashboard/calendar/Calendar";

import Profile from "./pages/dashboard/profile/Profile";
import Departments from "./pages/dashboard/departments/Departments";
import Clinics from "./pages/dashboard/clinics/Clinics";
import Permissions from "./pages/dashboard/permissions/Permissions";
import PatientDashboard from "./pages/dashboard/patient/PatientDashboard";
import NotFound from "./pages/NotFound";

// Payment Pages
import PaymentSuccess from "./pages/payments/PaymentSuccess";
import PaymentCancelled from "./pages/payments/PaymentCancelled";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Global error handler for Google Translate DOM conflicts
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && 
          (event.error.message?.includes('removeChild') || 
           event.error.message?.includes('Node') ||
           event.error.message?.includes('translate'))) {
        
        console.warn('Google Translate DOM conflict caught globally:', event.error.message);
        
        // Prevent the error from propagating and crashing the app
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
          (event.reason.message?.includes('removeChild') || 
           event.reason.message?.includes('Node') ||
           event.reason.message?.includes('translate'))) {
        
        console.warn('Google Translate DOM conflict caught (promise rejection):', event.reason.message);
        
        // Prevent the error from propagating
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="clinicpro-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <ClinicProvider>
                <CurrencyProvider>
                <TimezoneProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Super Admin routes */}
            <Route path="/admin" element={<SuperAdminLogin />} />
            
            {/* Super Admin Dashboard routes */}
            <Route path="/admin/dashboard" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
            </Route>
            <Route path="/admin/tenants" element={<SuperAdminLayout />}>
              <Route index element={<Tenants />} />
            </Route>
            <Route path="/admin/users" element={<SuperAdminLayout />}>
              <Route index element={<Users />} />
            </Route>
            <Route path="/admin/plans" element={<SuperAdminLayout />}>
              <Route index element={<Plans />} />
            </Route>
            <Route path="/admin/subscriptions" element={<SuperAdminLayout />}>
              <Route index element={<Subscriptions />} />
            </Route>
            <Route path="/admin/transactions" element={<SuperAdminLayout />}>
              <Route index element={<Transactions />} />
            </Route>
            <Route path="/admin/payment-methods" element={<SuperAdminLayout />}>
              <Route index element={<AdminPaymentMethods />} />
            </Route>
            <Route path="/admin/change-password" element={<SuperAdminLayout />}>
              <Route index element={<AdminChangePassword />} />
            </Route>
            
            {/* Payment Result Pages - public routes for Stripe redirects */}
            <Route path="/payments/success" element={<PaymentSuccess />} />
            <Route path="/payments/cancelled" element={<PaymentCancelled />} />

            {/* Clinic selection - requires auth but no clinic context */}
            <Route
              path="/select-clinic"
              element={
                <ProtectedRoute requireClinic={false}>
                  <ClinicSelection />
                </ProtectedRoute>
              }
            />

            {/* Patient Dashboard - separate route for patients */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected dashboard routes with role-based access */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - accessible to all authenticated users */}
              <Route index element={<Dashboard />} />

              {/* Dental AI X-ray Analysis - requires xray_analysis.view permission */}
              <Route
                path="xray-analysis"
                element={
                  <RequirePermission permissions="xray_analysis.view">
                    <XrayAnalysis />
                  </RequirePermission>
                }
              />

              {/* AI Test Report Analysis - requires test_reports.view permission */}
              <Route
                path="ai-test-analysis"
                element={
                  <RequirePermission permissions="test_reports.view">
                    <AITestAnalysis />
                  </RequirePermission>
                }
              />

              {/* AI Test Report Comparison - requires test_reports.view permission */}
              <Route
                path="ai-test-comparison"
                element={
                  <RequirePermission permissions="test_reports.view">
                    <AITestComparison />
                  </RequirePermission>
                }
              />

              {/* Patients - requires patients.view permission */}
              <Route
                path="patients"
                element={
                  <RequirePermission permissions="patients.view">
                    <Patients />
                  </RequirePermission>
                }
              />

              {/* Appointments - requires appointments.view permission */}
              <Route
                path="appointments"
                element={
                  <RequirePermission permissions="appointments.view">
                    <Appointments />
                  </RequirePermission>
                }
              />

              {/* Leads - requires leads.view permission */}
              <Route
                path="leads"
                element={
                  <RequirePermission permissions="leads.view">
                    <Leads />
                  </RequirePermission>
                }
              />

              {/* Billing - requires invoice or payment view permissions */}
              <Route
                path="billing"
                element={
                  <RequirePermission permissions={["invoices.view", "payments.view"]} operator="OR">
                    <Billing />
                  </RequirePermission>
                }
              />

              {/* Financial Management - require specific permissions */}
              <Route
                path="invoices"
                element={
                  <RequirePermission permissions="invoices.view">
                    <Invoices />
                  </RequirePermission>
                }
              />

              <Route
                path="payments"
                element={
                  <RequirePermission permissions="payments.view">
                    <Payments />
                  </RequirePermission>
                }
              />

              <Route
                path="payroll"
                element={
                  <RequirePermission permissions="payroll.view">
                    <Payroll />
                  </RequirePermission>
                }
              />

              <Route
                path="expenses"
                element={
                  <RequirePermission permissions="expenses.view">
                    <Expenses />
                  </RequirePermission>
                }
              />

              <Route
                path="performance"
                element={
                  <RequirePermission permissions="analytics.reports">
                    <Performance />
                  </RequirePermission>
                }
              />

              {/* Services - requires services.view permission */}
              <Route
                path="services"
                element={
                  <RequirePermission permissions="services.view">
                    <Services />
                  </RequirePermission>
                }
              />

              {/* Departments - requires departments.view permission */}
              <Route
                path="departments"
                element={
                  <RequirePermission permissions="departments.view">
                    <Departments />
                  </RequirePermission>
                }
              />

              {/* Clinics - requires clinics.view permission */}
              <Route
                path="clinics"
                element={
                  <RequirePermission permissions="clinics.view">
                    <Clinics />
                  </RequirePermission>
                }
              />

              {/* Permissions - requires permissions.view permission */}
              <Route
                path="permissions"
                element={
                  <RequirePermission permissions="permissions.view">
                    <Permissions />
                  </RequirePermission>
                }
              />

              {/* Inventory - requires inventory.view permission */}
              <Route
                path="inventory"
                element={
                  <RequirePermission permissions="inventory.view">
                    <Inventory />
                  </RequirePermission>
                }
              />

              {/* Staff Management - requires users.view permission */}
              <Route
                path="staff"
                element={
                  <RequirePermission permissions="users.view">
                    <Staff />
                  </RequirePermission>
                }
              />

              {/* Prescriptions - requires prescriptions.view permission */}
              <Route
                path="prescriptions"
                element={
                  <RequirePermission permissions="prescriptions.view">
                    <Prescriptions />
                  </RequirePermission>
                }
              />

              {/* Odontograms - requires odontogram.view permission */}
              <Route
                path="odontograms"
                element={
                  <RequirePermission permissions="odontogram.view">
                    <Odontograms />
                  </RequirePermission>
                }
              />

              {/* Tests - requires tests.view permission */}
              <Route
                path="tests"
                element={
                  <RequirePermission permissions="tests.view">
                    <Tests />
                  </RequirePermission>
                }
              />

              {/* Test Reports - requires test_reports.view permission */}
              <Route
                path="test-reports"
                element={
                  <RequirePermission permissions="test_reports.view">
                    <TestReports />
                  </RequirePermission>
                }
              />

              {/* Lab Vendors - requires lab_vendors.view permission */}
              <Route
                path="lab-vendors"
                element={
                  <RequirePermission permissions="lab_vendors.view">
                    <LabVendors />
                  </RequirePermission>
                }
              />

              {/* Test Modules - requires tests.view permission */}
              <Route
                path="test-modules/methodology"
                element={
                  <RequirePermission permissions="tests.view">
                    <Methodology />
                  </RequirePermission>
                }
              />
              <Route
                path="test-modules/turnaround-time"
                element={
                  <RequirePermission permissions="tests.view">
                    <TurnaroundTime />
                  </RequirePermission>
                }
              />
              <Route
                path="test-modules/sample-type"
                element={
                  <RequirePermission permissions="tests.view">
                    <SampleType />
                  </RequirePermission>
                }
              />
              <Route
                path="test-modules/category"
                element={
                  <RequirePermission permissions="tests.view">
                    <Category />
                  </RequirePermission>
                }
              />

              {/* Calendar - requires appointments.view permission */}
              <Route
                path="calendar"
                element={
                  <RequirePermission permissions="appointments.view">
                    <Calendar />
                  </RequirePermission>
                }
              />

              {/* Reports - requires analytics.dashboard permission */}
              <Route
                path="reports"
                element={
                  <RequirePermission permissions={["analytics.dashboard", "analytics.reports"]} operator="OR">
                    <Analytics />
                  </RequirePermission>
                }
              />





              {/* Profile - accessible to all authenticated users */}
              <Route
                path="profile"
                element={<Profile />}
              />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TimezoneProvider>
        </CurrencyProvider>
      </ClinicProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
