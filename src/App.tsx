import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Login } from '@/features/auth/pages/Login';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { routes } from '@/shared/components/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry auth/permission/validation failures - it only delays the error message.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          {routes.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={<ProtectedRoute requiredRole={r.requiredRole}>{r.element}</ProtectedRoute>}
            />
          ))}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
