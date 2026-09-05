import { MotionConfig } from 'motion/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components';
import { ConfigProvider } from './config/ConfigProvider';
import { DEFAULT_TRANSITION } from './lib/motion';
import { AppShell } from './layouts/AppShell';
import { TeamAccessPage } from './features/admin/TeamAccessPage';
import { AuthProvider, RequireAuth } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { DraftResultPage } from './features/generate/DraftResultPage';
import { GeneratorPage } from './features/generate/GeneratorPage';
import { HistoryPage } from './features/history/HistoryPage';
import { CompanyProfilePage } from './features/profile/CompanyProfilePage';
import { ToolsHomePage } from './features/tools/ToolsHomePage';

export function App() {
  return (
    /* Two things this buys us globally:
       - `transition` makes a tween the default, so no animation silently falls
         back to Motion's spring. Springs overshoot; this system doesn't bounce.
       - `reducedMotion="user"` disables transform/layout animation for anyone
         with the OS setting on, matching the CSS rule in base.css. */
    <MotionConfig transition={DEFAULT_TRANSITION} reducedMotion="user">
      {/* Outermost so the theme is on :root before the first paint, and so the
          login screen can read branding before anyone has signed in. */}
      <ConfigProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* AppShell is a layout route so the chrome mounts once. RequireAuth
                  wraps it rather than each page, so there is one place a signed-out
                  visitor can be turned away and one place to change it. */}
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route index element={<ToolsHomePage />} />
                <Route path="/tools/:toolKey" element={<GeneratorPage />} />
                <Route path="/tools/:toolKey/result/:generationId" element={<DraftResultPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<CompanyProfilePage />} />
                <Route path="/admin/access" element={<TeamAccessPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ConfigProvider>
    </MotionConfig>
  );
}
