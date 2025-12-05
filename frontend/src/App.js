import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/User/Dashboard";
import Recovery from "./pages/Recovery";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import StaffProtectedRoute from "./components/StaffProtectedRoute";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffLostApproval from "./pages/Staff/StaffLostApproval";
import StaffFoundApproval from "./pages/Staff/StaffFoundApproval";
import StaffPendingClaim from "./pages/Staff/StaffPendingClaim";
import LostItemPage from "./pages/User/LostItemPage";
import ReportFoundItemPage from "./pages/User/ReportFoundItemPage";
import ReportLostItemPage from "./pages/User/ReportLostItemPage";
import FoundItemPage from "./pages/User/FoundItemPage";
import ReportSuccessPage from "./pages/User/ReportSuccessPage";
import ClaimFoundItemPage from "./pages/User/ClaimFoundItemPage";
import StaffClaimReview from "./pages/Staff/StaffClaimReview";
import LostReportPage from "./pages/User/LostReportPage";






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route 
        path="/Dashboard" 
        element={
          <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>} />

        <Route 
        path="/register" 
        element={
          
          <Register />
          } />

        <Route 
        path="/recovery" 
        element={
          <Recovery />
          } />

          
        <Route 
        path="/reset-password/:token"
        element={
        <ResetPassword />} />


        <Route 
        path="/StaffLostApproval" 
        element={
          <ProtectedRoute>
          <StaffLostApproval />
          </ProtectedRoute>}/>

        <Route 
        path="/StaffFoundApproval" 
        element={
          <ProtectedRoute>
          <StaffFoundApproval />
          </ProtectedRoute>}/>

        <Route 
        path="/StaffPendingClaim" 
        element={
          <ProtectedRoute>
          <StaffPendingClaim />
          </ProtectedRoute>}/>

        <Route 
        path="/LostItemPage" 
        element={
          <ProtectedRoute>
          <LostItemPage />
          </ProtectedRoute>}/>

        <Route 
        path="/ReportFoundItemPage" 
        element={
          <ProtectedRoute>
          <ReportFoundItemPage />
          </ProtectedRoute>}/>

        <Route 
        path="/ReportLostItemPage" 
        element={
          <ProtectedRoute>
          <ReportLostItemPage />
          </ProtectedRoute>}/>

        <Route 
        path="/FoundItemPage" 
        element={
          <ProtectedRoute>
          <FoundItemPage />
          </ProtectedRoute>}/>

        <Route 
        path="/ReportSuccessPage" 
        element={
          <ProtectedRoute>
          <ReportSuccessPage />
          </ProtectedRoute>}/>

        <Route 
        path="/ClaimFoundItemPage/:foundId" 
        element={
          <ProtectedRoute>
          <ClaimFoundItemPage />
          </ProtectedRoute>}/>

        <Route 
        path="/StaffDashboard" 
        element={
          <StaffProtectedRoute>
          <StaffDashboard />
          </StaffProtectedRoute>}/>


        <Route 
        path="/AdminDashboard" 
        element={
          <AdminProtectedRoute>
          <AdminDashboard />
          </AdminProtectedRoute>}/>

        <Route
        path="/StaffClaimReview/:claimId"
        element={
          <StaffProtectedRoute>
            <StaffClaimReview />
          </StaffProtectedRoute>
        }
        />

        <Route
        path="/LostReportPage/:id"
        element={
          <ProtectedRoute>
            <LostReportPage />
          </ProtectedRoute>
        }/>
        

        
      </Routes>
    </Router>
  );
}

export default App;
