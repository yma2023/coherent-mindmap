import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, Move } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  parentId?: string;
  children: string[];
  isEditing: boolean;
  isSelected: boolean;
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MIN_NODE_WIDTH = 120;
const MIN_NODE_HEIGHT = 40;
const NODE_SPACING = 150;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;

export const AdvancedMindMap: React.FC = () => {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      x: 400,
      y: 300,
      width: MIN_NODE_WIDTH,
      height: MIN_NODE_HEIGHT,
      content: t('mindMap.newNode'),
      children: [],
      isEditing: false,
      isSelected: false,
    },
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'node' | 'canvas';
    nodeId?: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextNodeId, setNextNodeId] = useState(2);

  // Calculate node position to avoid overlaps
  const calculateNewNodePosition = useCallback((parentNode: Node, direction: 'top' | 'bottom' | 'left' | 'right'): { x: number; y: number } => {
    let baseX = parentNode.x;
    let baseY = parentNode.y;
    
    // Calculate base position based on direction
    switch (direction) {
      case 'top':
        baseY -= NODE_SPACING;
        break;
      case 'bottom':
        baseY += NODE_SPACING;
        break;
      case 'left':
        baseX -= NODE_SPACING;
        break;
      case 'right':
        baseX += NODE_SPACING;
        break;
    }

    // Check for collisions and adjust position
    let finalX = baseX;
    let finalY = baseY;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const hasCollision = nodes.some(node => {
        const distance = Math.sqrt(
          Math.pow(finalX - node.x, 2) + Math.pow(finalY - node.y, 2)
        );
        return distance < NODE_SPACING * 0.8;
      });

      if (!hasCollision) break;

      // Adjust position in a spiral pattern
      const angle = (attempts * 45) * (Math.PI / 180);
      const radius = NODE_SPACING * 0.5 * (1 + attempts * 0.2);
      finalX = baseX + Math.cos(angle) * radius;
      finalY = baseY + Math.sin(angle) * radius;
      attempts++;
    }

    return { x: finalX, y: finalY };
  }, [nodes]);

  // Calculate text dimensions for dynamic node sizing
  const calculateTextDimensions = useCallback((text: string): { width: number; height: number } => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return { width: MIN_NODE_WIDTH, height: MIN_NODE_HEIGHT };
    
    context.font = '14px system-ui, -apple-system, sans-serif';
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    // Calculate height based on line breaks
    const lines = text.split('\n');
    const lineHeight = 20;
    const textHeight = lines.length * lineHeight;
    
    return {
      width: Math.max(MIN_NODE_WIDTH, textWidth + 40),
      height: Math.max(MIN_NODE_HEIGHT, textHeight + 20),
    };
  }, []);

  // Create new node
  const createNode = useCallback((parentId: string, direction: 'top' | 'bottom' | 'left' | 'right') => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const position = calculateNewNodePosition(parentNode, direction);
    const dimensions = calculateTextDimensions('New Node');
    
    const newNode: Node = {
      id: nextNodeId.toString(),
      x: position.x,
      y: position.y,
      width: dimensions.width,
      height: dimensions.height,
      content: t('mindMap.newNode'),
      parentId,
      children: [],
      isEditing: true,
      isSelected: true,
    };

    setNodes(prev => {
      const updated = prev.map(node => ({
        ...node,
        isSelected: node.id === newNode.id,
        isEditing: false,
      }));
      
      // Update parent's children
      const parentIndex = updated.findIndex(n => n.id === parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: [...updated[parentIndex].children, newNode.id],
        };
      }
      
      return [...updated, newNode];
    });

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateNewNodePosition, calculateTextDimensions]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const nodeToDelete = prev.find(n => n.id === nodeId);
      if (!nodeToDelete) return prev;

      // Remove from parent's children
      const updated = prev.map(node => {
        if (node.children.includes(nodeId)) {
          return {
            ...node,
            children: node.children.filter(childId => childId !== nodeId),
          };
        }
        return node;
      });

      // Remove the node and its descendants
      const nodesToRemove = new Set([nodeId]);
      const findDescendants = (id: string) => {
        const node = updated.find(n => n.id === id);
        if (node) {
          node.children.forEach(childId => {
            nodesToRemove.add(childId);
            findDescendants(childId);
          });
        }
      };
      findDescendants(nodeId);

      return updated.filter(node => !nodesToRemove.has(node.id));
    });
  }, []);

  // Update node content
  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const dimensions = calculateTextDimensions(content);
        return {
          ...node,
          content,
          width: dimensions.width,
          height: dimensions.height,
          isEditing: false,
        };
      }
      return node;
    }));
  }, [calculateTextDimensions]);

  // Select node
  const selectNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isSelected: node.id === nodeId,
      isEditing: false,
    })));
  }, []);

  // Start editing node
  const startEditing = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isEditing: node.id === nodeId,
      isSelected: node.id === nodeId,
    })));
  }, []);

  // Calculate connections
  const calculateConnections = useCallback((): Connection[] => {
    const newConnections: Connection[] = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent) {
          newConnections.push({
            id: `${parent.id}-${node.id}`,
            fromNodeId: parent.id,
            toNodeId: node.id,
            fromX: parent.x,
            fromY: parent.y,
            toX: node.x,
            toY: node.y,
          });
        }
      }
    });
    
    return newConnections;
  }, [nodes]);

  // Update connections when nodes change
  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setDragState({
          isDragging: true,
          dragType: 'node',
          nodeId,
          startX: clientX,
          startY: clientY,
          initialX: node.x,
          initialY: node.y,
        });
        selectNode(nodeId);
      }
    } else {
      setDragState({
        isDragging: true,
        dragType: 'canvas',
        startX: clientX,
        startY: clientY,
        initialX: viewState.offsetX,
        initialY: viewState.offsetY,
      });
    }
  }, [nodes, viewState, selectNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState?.isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const deltaX = (clientX - dragState.startX) / viewState.scale;
    const deltaY = (clientY - dragState.startY) / viewState.scale;

    if (dragState.dragType === 'node' && dragState.nodeId) {
      setNodes(prev => prev.map(node => 
        node.id === dragState.nodeId
          ? {
              ...node,
              x: dragState.initialX + deltaX,
              y: dragState.initialY + deltaY,
            }
          : node
      ));
    } else if (dragState.dragType === 'canvas') {
      setViewState(prev => ({
        ...prev,
        offsetX: dragState.initialX + deltaX,
        offsetY: dragState.initialY + deltaY,
      }));
    }
  }, [dragState, viewState.scale]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Wheel event for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta)),
    }));
  }, []);

  // Generate SVG path for curved connections
  const generateConnectionPath = useCallback((connection: Connection): string => {
    const { fromX, fromY, toX, toY } = connection;
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    // Control points for smooth bezier curve
    const cp1x = fromX + dx * 0.5;
    const cp1y = fromY;
    const cp2x = toX - dx * 0.5;
    const cp2y = toY;
    
    return `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* 言語切り替え */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="compact" />
      </div>
      
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* SVG for connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
            transformOrigin: '0 0',
          }}
        >
          {connections.map(connection => (
            <path
              key={connection.id}
              d={generateConnectionPath(connection)}
              stroke="#888"
              strokeWidth="2"
              fill="none"
              className="transition-all duration-200"
            />
          ))}
        </svg>

        {/* Nodes */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
            transformOrigin: '0 0',
          }}
        >
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute bg-white rounded-lg shadow-md border-2 transition-all duration-200 group ${
                node.isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                left: node.x - node.width / 2,
                top: node.y - node.height / 2,
                width: node.width,
                height: node.height,
                cursor: dragState?.dragType === 'node' ? 'grabbing' : 'grab',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, node.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragState?.isDragging) {
                  selectNode(node.id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                startEditing(node.id);
              }}
            >
              {/* Delete button */}
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>

              {/* Plus buttons */}
              {['top', 'bottom', 'left', 'right'].map(direction => (
                <button
                  key={direction}
                  className={`absolute w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-blue-600 z-10 ${
                    direction === 'top' ? '-top-3 left-1/2 -translate-x-1/2' :
                    direction === 'bottom' ? '-bottom-3 left-1/2 -translate-x-1/2' :
                    direction === 'left' ? 'top-1/2 -left-3 -translate-y-1/2' :
                    'top-1/2 -right-3 -translate-y-1/2'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    createNode(node.id, direction as 'top' | 'bottom' | 'left' | 'right');
                  }}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('common.delete')}</span>
              ))}

              {/* Node content */}
              <div className="w-full h-full flex items-center justify-center p-3">
                {node.isEditing ? (
                  <textarea
                    className="w-full h-full resize-none border-none outline-none bg-transparent text-center text-sm font-medium"
                    defaultValue={node.content}
                    autoFocus
                    onBlur={(e) => updateNodeContent(node.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        updateNodeContent(node.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setNodes(prev => prev.map(n => 
                          n.id === node.id ? { ...n, isEditing: false } : n
                        ));
                      }
                    }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800 text-center whitespace-pre-wrap">
                    {node.content}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">{t('mindMap.controls.title') || 'Mind Map Controls'}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{t('mindMap.controls.clickToSelect')}</p>
          <p>{t('mindMap.controls.doubleClickToEdit')}</p>
          <p>{t('mindMap.controls.hoverForButtons')}</p>
          <p>{t('mindMap.controls.dragToMove')}</p>
          <p>{t('mindMap.controls.scrollToZoom')}</p>
          <p>{t('mindMap.controls.dragCanvas')}</p>
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>
    </div>
  );
};