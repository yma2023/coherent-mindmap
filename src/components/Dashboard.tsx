import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Users, Clock, LogOut, Brain, BarChart3, Zap } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './language/LanguageSwitcher';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateMindMap = () => {
    // Create a new mind map with a default name
    const newMap = {
      id: Date.now().toString(),
      name: 'Untitled Mind Map',
      nodes: [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ownerId: user?.id || '',
      collaborators: [],
    };
    
    // You would typically save this to the database here
    // For now, we'll just navigate to the mind map editor
    navigate('/mindmap', { state: { mindMap: newMap } });
  };

  // Mock data for demonstration
  const recentMaps = [
    { id: '1', name: 'Sample Mindmap', nodes: 0, updated: '0 hours ago', collaborators: 0 },
    { id: '2', name: 'Sample Mindmap', nodes: 0, updated: '0 day ago', collaborators: 0 },
    { id: '3', name: 'Sample Mindmap', nodes: 0, updated: '0 days ago', collaborators: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-slate-800">SOZO MAP</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" />
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{profile?.full_name || 'User'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {t('dashboard.welcomeBack')} {profile?.full_name || t('dashboard.welcomeThere')}
          </h2>
          <p className="text-slate-600 text-lg">
            {t('dashboard.readyToCreate')}
          </p>
        </div>

        {/* Quick Actions - EdrawMind Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleCreateMindMap}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-6 rounded-2xl transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-2xl">→</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('dashboard.createNewMindMap')}</h3>
            <p className="text-blue-100">
              {t('dashboard.startWithBlank')}
            </p>
          </button>

          <button
            onClick={handleCreateMindMap}
            className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-2xl transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-2xl">→</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('dashboard.createNewMindMap')}</h3>
            <p className="text-purple-100">
              {t('dashboard.startWithBlank')}
            </p>
          </button>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-800">3</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('dashboard.collaborators')}</h3>
            <p className="text-slate-600">
              {t('dashboard.peopleWorking')}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-800">{recentMaps.length}</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('dashboard.totalMaps')}</h3>
            <p className="text-slate-600">
              {t('dashboard.mapsCreated')}
            </p>
          </div>
        </div>

        {/* Recent Mind Maps */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="px-6 py-4 border-b border-white/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">{t('dashboard.recentMindMaps')}</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                {t('dashboard.viewAll')}
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-white/30">
            {recentMaps.map((map) => (
              <div
                key={map.id}
                className="px-6 py-4 hover:bg-white/50 cursor-pointer transition-colors"
                onClick={handleCreateMindMap}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Map className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{map.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-slate-500">{map.nodes} {t('dashboard.nodes')}</span>
                        <span className="text-sm text-slate-500">{map.collaborators} {t('dashboard.collaborators')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>{map.updated} {t('dashboard.updated')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (if no maps) */}
        {recentMaps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Map className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('dashboard.noMapsYet')}</h3>
            <p className="text-slate-600 mb-6">
              {t('dashboard.createFirstMap')}
            </p>
            <button
              onClick={handleCreateMindMap}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.createNewMindMap')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};