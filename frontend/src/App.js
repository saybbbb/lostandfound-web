import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recovery from "./pages/Recovery";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import StaffDashboard from "./pages/StaffDashboard";
import StaffLostApproval from "./pages/StaffLostApproval";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/StaffLostApproval" element={<StaffLostApproval />}/>

  
        <Route path="/StaffDashboard" element={<StaffDashboard />}/>


        <Route 
        path="/AdminDashboard" 
        element={
          <AdminProtectedRoute>
          <AdminDashboard />
          </AdminProtectedRoute>}/>

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
