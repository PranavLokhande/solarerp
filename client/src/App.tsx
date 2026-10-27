import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { SurveysPage } from './pages/SurveysPage';
import { DesignQuotationPage } from './pages/DesignQuotationPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RegulatoryPage } from './pages/RegulatoryPage';
import { InventoryPage } from './pages/InventoryPage';
import { BillingPage } from './pages/BillingPage';
import { TicketsPage } from './pages/TicketsPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-solar-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="surveys" element={<SurveysPage />} />
            <Route path="designs" element={<DesignQuotationPage />} />
            <Route path="quotations" element={<DesignQuotationPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="regulatory" element={<RegulatoryPage />} />
            <Route path="loans" element={<RegulatoryPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="support" element={<TicketsPage />} />
            <Route path="customer-portal" element={<CustomerPortalPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
