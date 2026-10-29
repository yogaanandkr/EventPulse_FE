import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />

      <Route element={<ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]} />}>
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/events/new" element={<CreateEventPage />} />
        <Route path="/organizer/events/:id/edit" element={<EditEventPage />} />
      </Route>
    </Routes>
  );
}

export default App;
