import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { MindMapCanvas } from "./components/MindMapCanvas";
import "@xyflow/react/dist/style.css";

// MindMapCanvasを開く関数
const MindMapApp: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <MindMapCanvas />
    </div>
  );
};

// main.tsxで呼び出すメイン関数
function App() {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    // 認証状態の初期化
    initialize();
  }, [initialize]);

  // ページ遷移(ルーティング)
  return (
    <Router>
      <Routes>
        {/* ランディングページ（エントリー画面） */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes - no authentication required */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mindmap" element={<MindMapApp />} />

        {/* Default redirect */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
