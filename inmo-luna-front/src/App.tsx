import { Routes, Route, Navigate } from "react-router";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}