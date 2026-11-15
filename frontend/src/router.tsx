import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";

/* Cada página vira um chunk próprio: o carregamento inicial fica mais leve. */
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const AppointmentsPage = lazy(() =>
  import("./pages/AppointmentsPage").then((module) => ({ default: module.AppointmentsPage })),
);
const ClientsPage = lazy(() =>
  import("./pages/ClientsPage").then((module) => ({ default: module.ClientsPage })),
);
const WorkersPage = lazy(() =>
  import("./pages/WorkersPage").then((module) => ({ default: module.WorkersPage })),
);
const TasksPage = lazy(() =>
  import("./pages/TasksPage").then((module) => ({ default: module.TasksPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);

function RouteSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando página…</span>
      <div className="h-8 w-52 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-surface" />
    </div>
  );
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(DashboardPage) },
      { path: "agendamentos", element: withSuspense(AppointmentsPage) },
      { path: "clientes", element: withSuspense(ClientsPage) },
      { path: "tecnicos", element: withSuspense(WorkersPage) },
      { path: "servicos", element: withSuspense(TasksPage) },
      { path: "*", element: withSuspense(NotFoundPage) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
