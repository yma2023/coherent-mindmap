import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, X } from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  content: string;
  isEditing: boolean;
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

interface HoverZone {
  direction: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
  parentNodeId: string;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const NODE_SPACING = 150;
const HOVER_ZONE_SIZE = 40;

export const InteractiveNodeCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      x: 400,
      y: 300,
      content: 'Start Here',
      isEditing: false,
    },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hoverZone, setHoverZone] = useState<HoverZone | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextNodeId, setNextNodeId] = useState(2);

  const getHoverZones = useCallback((node: Node): HoverZone[] => {
    return [
      {
        direction: 'top',
        x: node.x,
        y: node.y - NODE_SPACING / 2,
        parentNodeId: node.id,
      },
      {
        direction: 'bottom',
        x: node.x,
        y: node.y + NODE_SPACING / 2,
        parentNodeId: node.id,
      },
      {
        direction: 'left',
        x: node.x - NODE_SPACING / 2,
        y: node.y,
        parentNodeId: node.id,
      },
      {
        direction: 'right',
        x: node.x + NODE_SPACING / 2,
        y: node.y,
        parentNodeId: node.id,
      },
    ];
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let foundHoverZone: HoverZone | null = null;

      for (const node of nodes) {
        const hoverZones = getHoverZones(node);
        
        for (const zone of hoverZones) {
          const distance = Math.sqrt(
            Math.pow(mouseX - zone.x, 2) + Math.pow(mouseY - zone.y, 2)
          );
          
          if (distance <= HOVER_ZONE_SIZE) {
            // Check if there's already a node in this position
            const existingNode = nodes.find(n => 
              Math.abs(n.x - zone.x) < NODE_WIDTH / 2 && 
              Math.abs(n.y - zone.y) < NODE_HEIGHT / 2
            );
            
            if (!existingNode) {
              foundHoverZone = zone;
              break;
            }
          }
        }
        
        if (foundHoverZone) break;
      }

      setHoverZone(foundHoverZone);
    },
    [nodes, getHoverZones]
  );

  const createNode = useCallback(
    (zone: HoverZone) => {
      const newNode: Node = {
        id: nextNodeId.toString(),
        x: zone.x,
        y: zone.y,
        content: 'New Node',
        isEditing: true,
      };

      const newConnection: Connection = {
        id: `${zone.parentNodeId}-${newNode.id}`,
        fromNodeId: zone.parentNodeId,
        toNodeId: newNode.id,
      };

      setNodes(prev => [...prev, newNode]);
      setConnections(prev => [...prev, newConnection]);
      setNextNodeId(prev => prev + 1);
      setHoverZone(null);
    },
    [nextNodeId]
  );

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => 
      prev.filter(conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId)
    );
    setShowMenu(null);
  }, []);

  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId ? { ...node, content, isEditing: false } : node
      )
    );
  }, []);

  const startEditing = useCallback((nodeId: string) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId ? { ...node, isEditing: true } : node
      )
    );
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-default"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverZone(null)}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.fromNodeId);
            const toNode = nodes.find(n => n.id === connection.toNodeId);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={connection.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#6b7280"
                strokeWidth="2"
                strokeDasharray="none"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute bg-white border-2 border-blue-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
            style={{
              left: node.x - NODE_WIDTH / 2,
              top: node.y - NODE_HEIGHT / 2,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
            }}
          >
            {/* Three-dot menu button */}
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(showMenu === node.id ? null : node.id);
              }}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Menu dropdown */}
            {showMenu === node.id && (
              <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                >
                  <X className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* Node content */}
            <div className="w-full h-full flex items-center justify-center p-2">
              {node.isEditing ? (
                <input
                  type="text"
                  defaultValue={node.content}
                  className="w-full text-center text-sm font-medium bg-transparent border-none outline-none"
                  autoFocus
                  onBlur={(e) => updateNodeContent(node.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateNodeContent(node.id, e.currentTarget.value);
                    }
                  }}
                />
              ) : (
                <span
                  className="text-sm font-medium text-gray-800 cursor-pointer text-center"
                  onDoubleClick={() => startEditing(node.id)}
                >
                  {node.content}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Hover zone plus button */}
        {hoverZone && (
          <button
            className="absolute w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 shadow-lg animate-pulse"
            style={{
              left: hoverZone.x - 16,
              top: hoverZone.y - 16,
            }}
            onClick={() => createNode(hoverZone)}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md max-w-sm">
        <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Hover around nodes to see + buttons</li>
          <li>• Click + to create connected nodes</li>
          <li>• Double-click nodes to edit text</li>
          <li>• Click ⋯ menu to delete nodes</li>
        </ul>
      </div>
    </div>
  );
};