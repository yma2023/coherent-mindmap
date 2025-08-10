import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Map, Settings, Share2 } from 'lucide-react';
import { useMindMapStore } from '../../stores/mindMapStore';

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { maps, currentMap } = useMindMapStore();

  const handleCreateNewMap = () => {
    navigate('/dashboard');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            MindFlow
          </button>
          <button 
            onClick={handleCreateNewMap}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="Create New Mind Map"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search maps..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Maps List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Recent Maps</h2>
          <div className="space-y-2">
            {[
              { id: '1', name: 'Project Strategy', nodes: 12, updated: '2 hours ago' },
              { id: '2', name: 'Marketing Plan', nodes: 8, updated: '1 day ago' },
              { id: '3', name: 'Team Structure', nodes: 15, updated: '3 days ago' },
            ].map((map) => (
              <div
                key={map.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentMap?.id === map.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Map className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{map.name}</p>
                    <p className="text-xs text-gray-500">{map.nodes} nodes • {map.updated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const RightSidebar: React.FC = () => {
  const { comments, selectedNodeId } = useMindMapStore();

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Comments
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Tasks
        </button>
      </div>

      {/* Comments Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNodeId ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Comments for selected node
            </div>
            
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Select a node and add a comment</p>
              </div>
            )}

            {/* Add Comment */}
            <div className="border-t border-gray-200 pt-4">
              <textarea
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={3}
              />
              <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                Add Comment
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Select a node to view comments</p>
          </div>
        )}
      </div>
    </div>
  );
};