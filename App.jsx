import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";

function Private({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Private><NotesPage /></Private>} />
      <Route path="/login" element={<Public><AuthPage mode="login" /></Public>} />
      <Route path="/register" element={<Public><AuthPage mode="register" /></Public>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
