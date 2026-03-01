import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import ReceptionistDashboard from "./ReceptionistDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect patients to their own dashboard
  useEffect(() => {
    if (user?.role === 'patient') {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  // If user is a patient, show loading while redirecting
  if (user?.role === 'patient') {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to Patient Dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (user?.role) {
    case "doctor":
      return <DoctorDashboard />;
    case "receptionist":
      return <ReceptionistDashboard />;
    case "nurse":
      return <ReceptionistDashboard />; // Nurses use similar interface to reception
    case "accountant":
      return <AdminDashboard />; // Accountants use admin-like dashboard with financial focus
    case "staff":
      return <AdminDashboard />; // Staff use admin-like dashboard with financial focus
    case "admin":
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
