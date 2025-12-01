import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { ContentLibrary } from '@/pages/ContentLibrary';
import { EditorPage } from '@/pages/EditorPage';
import { MediaLibrary } from '@/pages/MediaLibrary';
import { ContentTypes } from '@/pages/ContentTypes';
import { Settings } from '@/pages/Settings';
import { DemoPage } from '@/pages/DemoPage'; // Keep demo page for now
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/library",
    element: <ContentLibrary />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/editor/:entryId",
    element: <EditorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/editor",
    element: <EditorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/media",
    element: <MediaLibrary />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/types",
    element: <ContentTypes />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/demo", // Keep demo page accessible
    element: <DemoPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);