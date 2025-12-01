import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/User/Dashboard";
import Recovery from "./pages/Recovery";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffLostApproval from "./pages/Staff/StaffLostApproval";
import StaffFoundApproval from "./pages/Staff/StaffFoundApproval";
import StaffPendingClaim from "./pages/Staff/StaffPendingClaim";
import LostItemPage from "./pages/User/LostItemPage";
import ReportFoundItemPage from "./pages/User/ReportFoundItemPage";
import ReportLostItemPage from "./pages/User/ReportLostItemPage";
import FoundItemPage from "./pages/User/FoundItemPage";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/StaffLostApproval" element={<StaffLostApproval />}/>
        <Route path="/StaffFoundApproval" element={<StaffFoundApproval />}/>
        <Route path="/StaffPendingClaim" element={<StaffPendingClaim />}/>
        <Route path="/LostItemPage" element={<LostItemPage />}/>
        <Route path="/ReportFoundItemPage" element={<ReportFoundItemPage />}/>
        <Route path="/ReportLostItemPage" element={<ReportLostItemPage />}/>
        <Route path="/FoundItemPage" element={<FoundItemPage />}/>



  
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
