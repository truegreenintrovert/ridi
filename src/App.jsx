
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/pages/Dashboard";
import Layout from "@/components/Layout";
import Patients from "@/pages/Patients";
import PatientDetails from "@/pages/PatientDetails";
import Doctors from "@/pages/Doctors";
import Staff from "@/pages/Staff";
import Profile from "@/pages/Profile";
import Appointments from "@/pages/Appointments";
import Prescriptions from "@/pages/Prescriptions";
import Payments from "@/pages/Payments";
import InvoiceHistory from "@/pages/InvoiceHistory";
import PatientHealthRecords from "@/pages/PatientHealthRecords";
import LabTests from "@/pages/LabTests";
import Inventory from "@/pages/Inventory";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import AuthCallback from "@/pages/auth/AuthCallback";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth/signin" />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <Layout>
                    <Patients />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <PatientDetails />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <PrivateRoute>
                  <Layout>
                    <Doctors />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <PrivateRoute>
                  <Layout>
                    <Staff />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Layout>
                    <Appointments />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <PrivateRoute>
                  <Layout>
                    <Prescriptions />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute>
                  <Layout>
                    <Payments />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PrivateRoute>
                  <Layout>
                    <InvoiceHistory />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/health-records"
              element={
                <PrivateRoute>
                  <Layout>
                    <PatientHealthRecords />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/lab-tests"
              element={
                <PrivateRoute>
                  <Layout>
                    <LabTests />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
