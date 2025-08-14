import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Map, Settings, Share2, Brain, Clock, Users, Star } from 'lucide-react';
import { useMindMapStore } from '../../stores/mindMapStore';

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { maps, currentMap } = useMindMapStore();

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/50 h-full flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MindFlow</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search maps..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Maps List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Recent Maps</h2>
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
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                    : 'hover:bg-white/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Map className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{map.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>{map.nodes} nodes</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{map.updated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/30">
        <div className="flex items-center justify-between mb-3">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-800">Pro Plan</span>
          </div>
          <p className="text-xs text-amber-700">Unlimited maps & collaboration</p>
        </div>
      </div>
    </div>
  );
};

export const RightSidebar: React.FC = () => {
  const { comments, selectedNodeId } = useMindMapStore();

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-white/50 h-full flex flex-col shadow-lg">
      {/* Tabs */}
      <div className="flex border-b border-white/30">
        <button className="flex-1 px-4 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 bg-blue-50/50">
          Comments
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
          Tasks
        </button>
      </div>

      {/* Comments Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNodeId ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 mb-4 font-medium">
              Comments for selected node
            </div>
            
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">{comment.userName}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Select a node and add a comment</p>
              </div>
            )}

            {/* Add Comment */}
            <div className="border-t border-white/30 pt-4">
              <textarea
                placeholder="Add a comment..."
                className="w-full p-3 bg-white/50 border border-white/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm"
                rows={3}
              />
              <button className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md">
                Add Comment
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">
            <p className="text-sm">Select a node to view comments</p>
          </div>
        )}
      </div>
    </div>
  );
};