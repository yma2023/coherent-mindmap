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
import { Plus, Zap, ArrowLeft } from 'lucide-react';
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

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
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