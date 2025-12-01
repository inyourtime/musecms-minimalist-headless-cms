import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { ContentLibrary } from '@/pages/ContentLibrary';
import { EditorPage } from '@/pages/EditorPage';
import { MediaLibrary } from '@/pages/MediaLibrary';
import { ContentTypes } from '@/pages/ContentTypes';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { DemoPage } from '@/pages/DemoPage';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute><HomePage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/library",
    element: <ProtectedRoute><ContentLibrary /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/editor/:entryId",
    element: <ProtectedRoute><EditorPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/editor",
    element: <ProtectedRoute><EditorPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/media",
    element: <ProtectedRoute><MediaLibrary /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/types",
    element: <ProtectedRoute><ContentTypes /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/demo",
    element: <ProtectedRoute><DemoPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);