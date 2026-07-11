import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FanExperiencePage = lazy(() => import('@/pages/FanExperiencePage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const VolunteersPage = lazy(() => import('@/pages/VolunteersPage'));
const VenuePage = lazy(() => import('@/pages/VenuePage'));
const OrganizersPage = lazy(() => import('@/pages/OrganizersPage'));
const AIAssistantPage = lazy(() => import('@/pages/AIAssistantPage'));
const AccessibilityPage = lazy(() => import('@/pages/AccessibilityPage'));
const FanCopilotPage = lazy(() => import('@/pages/FanCopilotPage'));
const AIDigitalTwinPage = lazy(() => import('@/pages/AIDigitalTwinPage'));
const CommandCenterPage = lazy(() => import('@/pages/CommandCenterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageSpinner message="Loading StadiumMind AI..." />}>
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
                  <Route path="digital-twin" element={<AIDigitalTwinPage />} />
                  <Route path="command-center" element={<CommandCenterPage />} />
                </Route>

                {/* 404 */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>

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
