import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { Plus, Zap, ArrowLeft, Menu, X, Home, Brain } from 'lucide-react';
import { TextNode } from './nodes/TextNode';
import { useMindMapStore } from '../stores/mindMapStore';
import { NodeData, MindMapNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  textNode: TextNode,
};

const MindMapCanvasInner: React.FC = () => {
  const navigate = useNavigate();
  const { currentMap, addNode, addEdge: addStoreEdge, hasUnsavedChanges } = useMindMapStore();
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(currentMap?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentMap?.edges || []);
  const [showAICommand, setShowAICommand] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback((params: Connection | Edge) => {
    const newEdge = {
      id: uuidv4(),
      ...params,
      type: 'smoothstep',
      animated: true,
    } as Edge;
    setEdges((eds) => addEdge(newEdge, eds));
    addStoreEdge(newEdge);
  }, [setEdges, addStoreEdge]);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.detail === 2) { // Double click
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeData: NodeData = {
        id: uuidv4(),
        type: 'text',
        content: 'New Node',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newNode: MindMapNode = {
        id: newNodeData.id,
        type: 'textNode',
        position,
        data: newNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
      addNode(newNode);
    }
  }, [screenToFlowPosition, setNodes, addNode]);

  const handleAICommand = useCallback(async () => {
    if (!aiPrompt.startsWith('/ai ')) return;
    
    const prompt = aiPrompt.substring(4);
    setShowAICommand(false);
    setAIPrompt('');
    
    // TODO: Implement AI integration
    console.log('AI prompt:', prompt);
    
    // Mock AI response - create a new node
    const position = screenToFlowPosition({ x: 400, y: 200 });
    const newNodeData: NodeData = {
      id: uuidv4(),
      type: 'text',
      content: `AI: ${prompt}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newNode: MindMapNode = {
      id: newNodeData.id,
      type: 'textNode',
      position,
      data: newNodeData,
    };

    setNodes((nds) => [...nds, newNode]);
    addNode(newNode);
  }, [aiPrompt, screenToFlowPosition, setNodes, addNode]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === '/' && !showAICommand) {
      setShowAICommand(true);
      setAIPrompt('/ai ');
    }
  }, [showAICommand]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle browser back button and page refresh
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
        );
        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href);
          return;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left Group */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors mr-2"
              title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {sidebarVisible ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-2" />
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebarVisible && (
          <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/50 h-full flex flex-col shadow-lg">
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
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{map.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span>{map.nodes} nodes</span>
                            <span>•</span>
                            <span>{map.updated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              nodeColor="#3b82f6"
            />
          </ReactFlow>
        </div>
      </div>

      {/* AI Command Input */}
      {showAICommand && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[400px]">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
            </div>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAICommand();
                if (e.key === 'Escape') {
                  setShowAICommand(false);
                  setAIPrompt('');
                }
              }}
              placeholder="/ai Generate project management methods..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Type your AI command and press Enter</span>
              <span>ESC to cancel</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={() => setShowAICommand(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export const MindMapCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner />
    </ReactFlowProvider>
  );
};