import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { UserProfile } from './components/auth/UserProfile';
import { Dashboard } from './components/Dashboard';
import { MindMapCanvas } from './components/MindMapCanvas';
import { InteractiveNodeCanvas } from './components/InteractiveNodeCanvas';
import { AdvancedMindMap } from './components/AdvancedMindMap';
import { LeftSidebar, RightSidebar } from './components/layout/Sidebar';
import { Toolbar } from './components/layout/Toolbar';
import '@xyflow/react/dist/style.css';

const MindMapApp: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 relative">
          <MindMapCanvas />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

function App() {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    // Initialize authentication state
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        {/* Public routes (redirect to dashboard if authenticated) */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <RegisterForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPasswordForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <ProtectedRoute requireAuth={false}>
              <ResetPasswordForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes (require authentication) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mindmap" 
          element={
            <ProtectedRoute>
              <MindMapApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interactive" 
          element={
            <ProtectedRoute>
              <AdvancedMindMap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advanced-mindmap" 
          element={
            <ProtectedRoute>
              <AdvancedMindMap />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;