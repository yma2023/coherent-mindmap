import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Users,
  Palette,
  Layout,
  FileText,
  ArrowLeft,
  Home, Brain,
} from 'lucide-react';
import { useMindMapStore } from '../../stores/mindMapStore';

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const { currentMap, hasUnsavedChanges } = useMindMapStore();

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left Group */}
        <div className="flex items-center space-x-1">
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <Redo className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2" />
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Center Group */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <button 
              onClick={handleBackToDashboard}
              className="text-slate-500 hover:text-slate-700 transition-colors"
              title="Back to Dashboard"
            >
              <Home className="w-4 h-4" />
            </button>
            <span className="text-slate-400">/</span>
            <h2 className="text-lg font-semibold text-slate-800">
              {currentMap?.name || 'Untitled Mind Map'}
            </h2>
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 rounded-full font-semibold">
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Right Group */}
        <div className="flex items-center space-x-1">
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <Layout className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
            <Palette className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2" />
          <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 rounded-lg transition-colors text-sm font-semibold">
            <FileText className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md">
            <Users className="w-4 h-4" />
            <span>Share</span>
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2" />
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors text-sm font-semibold"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};