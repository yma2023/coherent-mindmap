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
  Home,
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
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Group */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium mr-2"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Redo className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Center Group */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBackToDashboard}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Back to Dashboard"
            >
              <Home className="w-4 h-4" />
            </button>
            <span className="text-gray-400">/</span>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMap?.name || 'Untitled Mind Map'}
            </h2>
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Right Group */}
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Layout className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Palette className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};