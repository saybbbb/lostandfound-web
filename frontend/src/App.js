import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/user/Dashboard";
import Recovery from "./pages/Recovery";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import LostItem from "./pages/user/LostItem";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/lostitem" element={<LostItem />} />

        <Route 
        path="/AdminDashboard" 
        element={
          <AdminProtectedRoute>
          <AdminDashboard />
          </AdminProtectedRoute>}/>

        <ProtectedRoute>
          <Route path="/dashboard" element={ <Dashboard />} />
          <Route path="/lostitem" element={ <LostItem />} />
        </ProtectedRoute>
      </Routes>
    </Router>
  );
}

export default App;
