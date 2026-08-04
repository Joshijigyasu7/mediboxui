import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/patient" element={<PatientDashboard />} />

      <Route path="/doctor" element={<DoctorDashboard />} />

      <Route path="/chat/:id" element={<ChatRoom />} />
    </Routes>
  );
}

export default App;