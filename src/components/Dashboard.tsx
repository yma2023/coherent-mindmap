import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Users, Clock, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

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
    { id: '1', name: 'Project Strategy', nodes: 12, updated: '2 hours ago', collaborators: 3 },
    { id: '2', name: 'Marketing Plan', nodes: 8, updated: '1 day ago', collaborators: 2 },
    { id: '3', name: 'Team Structure', nodes: 15, updated: '3 days ago', collaborators: 5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Map className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">MindFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" />
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcomeBack')}, {profile?.full_name || t('dashboard.welcomeThere')}!
          </h2>
          <p className="text-gray-600">
            {t('dashboard.readyToCreate')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCreateMindMap}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="h-8 w-8" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.createNewMindMap')}</h3>
            <p className="text-blue-100 text-sm">
              {t('dashboard.startWithBlank')}
            </p>
          </button>

          <button
            onClick={() => navigate('/advanced-mindmap')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="h-8 w-8" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.advancedMindMap')}</h3>
            <p className="text-green-100 text-sm">
              {t('dashboard.fullFeatured')}
            </p>
          </button>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.collaborators')}</h3>
            <p className="text-gray-600 text-sm">
              {t('dashboard.peopleWorking')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Map className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{recentMaps.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.totalMaps')}</h3>
            <p className="text-gray-600 text-sm">
              {t('dashboard.mapsCreated')}
            </p>
          </div>
        </div>

        {/* Recent Mind Maps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentMindMaps')}</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                {t('dashboard.viewAll')}
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentMaps.map((map) => (
              <div
                key={map.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={handleCreateMindMap}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Map className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{map.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">{map.nodes} {t('dashboard.nodes')}</span>
                        <span className="text-xs text-gray-500">{map.collaborators} {t('dashboard.collaborators')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
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
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noMapsYet')}</h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.createFirstMap')}
            </p>
            <button
              onClick={handleCreateMindMap}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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