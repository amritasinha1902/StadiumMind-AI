import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import FanExperiencePage from '@/pages/FanExperiencePage';
import SecurityPage from '@/pages/SecurityPage';
import VolunteersPage from '@/pages/VolunteersPage';
import VenuePage from '@/pages/VenuePage';
import OrganizersPage from '@/pages/OrganizersPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import AccessibilityPage from '@/pages/AccessibilityPage';
import FanCopilotPage from '@/pages/FanCopilotPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public landing */}
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
              </Route>

              {/* Authenticated dashboard area */}
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="fans" element={<FanExperiencePage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="volunteers" element={<VolunteersPage />} />
                <Route path="venue" element={<VenuePage />} />
                <Route path="organizers" element={<OrganizersPage />} />
                <Route path="ai-assistant" element={<AIAssistantPage />} />
                <Route path="accessibility" element={<AccessibilityPage />} />
                <Route path="fan-copilot" element={<FanCopilotPage />} />
              </Route>

              {/* 404 */}
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0D1B2E',
                  color: '#F0F6FF',
                  border: '1px solid rgba(30, 58, 95, 0.6)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#F0F6FF' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#F0F6FF' },
                },
              }}
            />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
