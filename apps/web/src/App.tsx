import { BrowserRouter, Route, Routes } from "react-router";
import AdminAssociationsPage from "@/pages/admin/associations";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminFacultiesPage from "@/pages/admin/faculties";
import AdminRequestsPage from "@/pages/admin/requests";
import AdminUsersPage from "@/pages/admin/users";
import AssociationEventsPage from "@/pages/association/events";
import AssociationHomePage from "@/pages/association/home";
import AssociationServicesPage from "@/pages/association/services";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/not-found";
import { AdminRoute } from "@/routes/admin-route";
import { ProtectedRoute } from "@/routes/protected-route";
import { PublicOnlyRoute } from "@/routes/public-only-route";
import { SidebarLayoutRoute } from "@/routes/sidebar-layout-route";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayoutRoute />}>
            <Route path="/" element={<HomePage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route
                path="/admin/associations"
                element={<AdminAssociationsPage />}
              />
              <Route path="/admin/faculties" element={<AdminFacultiesPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/requests" element={<AdminRequestsPage />} />
            </Route>

            <Route path="/:associationUUID" element={<AssociationHomePage />} />
            <Route
              path="/:associationUUID/services"
              element={<AssociationServicesPage />}
            />
            <Route
              path="/:associationUUID/events"
              element={<AssociationEventsPage />}
            />
          </Route>
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
