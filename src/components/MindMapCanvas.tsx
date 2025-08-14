import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronDown, ChevronRight, Download, Upload, Save, FolderOpen, Zap, ArrowLeft, Menu, Home, Brain, Search, Map, Settings, Share2, Star, Clock, Users } from 'lucide-react';
import { useMindMapStore } from '../stores/mindMapStore';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Node {
  id: string;
  x: number;
  y: number;
  content: string;
  parentId?: string;
  children: string[];
  isEditing: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  level: number;
  width?: number;
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'child' | 'sibling';
  controlX?: number;
  controlY?: number;
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface ExportData {
  version: string;
  createdAt: string;
  nodes: Node[];
  metadata: {
    title: string;
    nodeCount: number;
    maxLevel: number;
  };
}

const NODE_SPACING_X = 200;
const NODE_SPACING_Y = 80;
const LEVEL_SPACING_X = 180;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const EXPAND_BUTTON_SIZE = 20;

export const MindMapCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentMap, hasUnsavedChanges } = useMindMapStore();
  
  // Advanced MindMap state
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      x: 200,
      y: 300,
      content: 'メインアイデア',
      children: [],
      isEditing: false,
      isSelected: false,
      isCollapsed: false,
      level: 0,
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
  
  const [navigationMode, setNavigationMode] = useState(false);
  const [nextNodeId, setNextNodeId] = useState(2);
  const [editingNodeWidth, setEditingNodeWidth] = useState<{ [nodeId: string]: number }>({});
  
  // UI state
  const [showAICommand, setShowAICommand] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Node width calculation
  const calculateNodeWidth = useCallback((content: string, isRoot = false) => {
    const charWidth = isRoot ? 16 : 12;
    const padding = 16;
    const minWidth = isRoot ? 60 : 40;
    
    if (!content || content.trim() === '') {
      return minWidth;
    }
    
    return Math.max(minWidth, content.length * charWidth + padding);
  }, []);

  // Child position calculation with balanced layout
  const calculateBalancedChildPositions = useCallback((parentNode: Node, useFixedDistance = true): { x: number; y: number }[] => {
    const childCount = parentNode.children.length;
    if (childCount === 0) return [];

    const baseX = useFixedDistance 
      ? parentNode.x + LEVEL_SPACING_X 
      : parentNode.x + NODE_SPACING_X;
    const positions: { x: number; y: number }[] = [];

    if (childCount === 1) {
      positions.push({ x: baseX, y: parentNode.y });
    } else {
      const spacing = Math.max(60, NODE_SPACING_Y - (childCount - 2) * 10);
      const totalHeight = (childCount - 1) * spacing;
      const startY = parentNode.y - totalHeight / 2;

      for (let i = 0; i < childCount; i++) {
        positions.push({
          x: baseX,
          y: startY + i * spacing
        });
      }
    }

    return positions;
  }, []);

  // Create child node
  const createChildNode = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const updatedParent = {
      ...parentNode,
      children: [...parentNode.children, nextNodeId.toString()]
    };
    const newPositions = calculateBalancedChildPositions(updatedParent, true);
    const position = newPositions[parentNode.children.length];
    
    const newNode: Node = {
      id: nextNodeId.toString(),
      x: position.x,
      y: position.y,
      content: '',
      parentId,
      children: [],
      isEditing: true,
      isSelected: true,
      isCollapsed: false,
      level: parentNode.level + 1,
      width: calculateNodeWidth('', false),
    };

    setNodes(prev => {
      const updated = prev.map(node => ({
        ...node,
        isSelected: node.id === newNode.id,
        isEditing: false,
      }));
      
      const parentIndex = updated.findIndex(n => n.id === parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: [...updated[parentIndex].children, newNode.id],
        };
      }
      
      return [...updated, newNode];
    });

    setTimeout(() => {
      const updatedParent = { ...parentNode, children: [...parentNode.children, nextNodeId.toString()] };
      const allPositions = calculateBalancedChildPositions(updatedParent, true);
      
      setNodes(prev => prev.map(node => {
        const childIndex = parentNode.children.indexOf(node.id);
        if (childIndex !== -1 && allPositions[childIndex]) {
          const oldY = node.y;
          const newY = allPositions[childIndex].y;
          const deltaY = newY - oldY;
          
          const updatedNode = {
            ...node,
            x: allPositions[childIndex].x,
            y: newY
          };
          
          if (deltaY !== 0) {
            moveDescendantsVertically(node.id, deltaY);
          }
          
          return updatedNode;
        }
        return node;
      }));
    }, 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateBalancedChildPositions, calculateNodeWidth]);

  // Create sibling node
  const createSiblingNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parentNode = nodes.find(n => n.id === node.parentId);
    if (!parentNode) return;

    const currentNodeIndex = parentNode.children.indexOf(nodeId);
    if (currentNodeIndex === -1) return;

    const newChildren = [...parentNode.children];
    newChildren.splice(currentNodeIndex + 1, 0, nextNodeId.toString());

    const updatedParent = {
      ...parentNode,
      children: newChildren
    };
    const newPositions = calculateBalancedChildPositions(updatedParent, true);
    const position = newPositions[currentNodeIndex + 1];
    
    const newNode: Node = {
      id: nextNodeId.toString(),
      x: position.x,
      y: position.y,
      content: '',
      parentId: node.parentId,
      children: [],
      isEditing: true,
      isSelected: true,
      isCollapsed: false,
      level: node.level,
      width: calculateNodeWidth(''),
    };

    setNodes(prev => {
      const updated = prev.map(n => ({
        ...n,
        isSelected: n.id === newNode.id,
        isEditing: false,
      }));
      
      const parentIndex = updated.findIndex(n => n.id === node.parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: newChildren,
        };
      }
      
      return [...updated, newNode];
    });

    setTimeout(() => {
      const updatedParent = { ...parentNode, children: newChildren };
      const allPositions = calculateBalancedChildPositions(updatedParent, true);
      
      setNodes(prev => prev.map(n => {
        const childIndex = newChildren.indexOf(n.id);
        if (childIndex !== -1 && allPositions[childIndex]) {
          const oldY = n.y;
          const newY = allPositions[childIndex].y;
          const deltaY = newY - oldY;
          
          const updatedNode = {
            ...n,
            x: allPositions[childIndex].x,
            y: newY
          };
          
          if (deltaY !== 0) {
            moveDescendantsVertically(n.id, deltaY);
          }
          
          return updatedNode;
        }
        return n;
      }));
    }, 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateBalancedChildPositions, calculateNodeWidth]);

  // Move descendants vertically
  const moveDescendantsVertically = useCallback((parentNodeId: string, deltaY: number) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0) return;

    setNodes(prev => prev.map(node => {
      if (parentNode.children.includes(node.id)) {
        const updatedNode = {
          ...node,
          y: node.y + deltaY
        };
        
        if (node.children.length > 0) {
          moveDescendantsVertically(node.id, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const parentId = nodeToDelete?.parentId;

    setNodes(prev => {
      const node = prev.find(n => n.id === nodeId);
      if (!node) return prev;

      const updated = prev.map(node => {
        if (node.children.includes(nodeId)) {
          return {
            ...node,
            children: node.children.filter(childId => childId !== nodeId),
          };
        }
        return node;
      });

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

    if (parentId) {
      setTimeout(() => {
        const parentNode = nodes.find(n => n.id === parentId);
        if (parentNode && parentNode.children.length > 1) {
          const remainingChildren = parentNode.children.filter(childId => childId !== nodeId);
          const updatedParent = { ...parentNode, children: remainingChildren };
          const newPositions = calculateBalancedChildPositions(updatedParent, true);
          
          setNodes(prev => prev.map(node => {
            const childIndex = remainingChildren.indexOf(node.id);
            if (childIndex !== -1 && newPositions[childIndex]) {
              const oldY = node.y;
              const newY = newPositions[childIndex].y;
              const deltaY = newY - oldY;
              
              const updatedNode = {
                ...node,
                x: newPositions[childIndex].x,
                y: newY
              };
              
              if (deltaY !== 0) {
                moveDescendantsVertically(node.id, deltaY);
              }
              
              return updatedNode;
            }
            return node;
          }));
        }
      }, 0);
    }
  }, [nodes, moveDescendantsVertically, calculateBalancedChildPositions]);

  // Update node content
  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    const trimmedContent = content.trim();
    if (trimmedContent === '') {
      deleteNode(nodeId);
      return;
    }

    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const isRoot = !node.parentId;
        return {
          ...node,
          content: trimmedContent,
          isEditing: false,
          width: calculateNodeWidth(trimmedContent, isRoot),
        };
      }
      return node;
    }));

    setEditingNodeWidth(prev => {
      const newState = { ...prev };
      delete newState[nodeId];
      return newState;
    });
  }, [deleteNode, calculateNodeWidth]);

  // Export functionality
  const exportMindMap = useCallback(() => {
    const exportData: ExportData = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      nodes: nodes,
      metadata: {
        title: nodes.find(n => !n.parentId)?.content || 'Untitled Mind Map',
        nodeCount: nodes.length,
        maxLevel: Math.max(...nodes.map(n => n.level)),
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindmap_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes]);

  // Import functionality
  const importMindMap = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData: ExportData = JSON.parse(content);
        
        if (!importData.nodes || !Array.isArray(importData.nodes)) {
          alert('無効なファイル形式です。');
          return;
        }

        const importedNodes = importData.nodes.map(node => ({
          ...node,
          isEditing: false,
          isSelected: false,
        }));

        const maxId = Math.max(...importedNodes.map(n => parseInt(n.id) || 0));
        setNextNodeId(maxId + 1);

        setNodes(importedNodes);
        
        setViewState({
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        });

        setNavigationMode(false);

        alert(`マインドマップをインポートしました。\nノード数: ${importedNodes.length}`);
      } catch (error) {
        console.error('Import error:', error);
        alert('ファイルの読み込みに失敗しました。正しいJSON形式のファイルを選択してください。');
      }
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Node selection and editing
  const selectNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isSelected: node.id === nodeId,
      isEditing: false,
    })));
  }, []);

  const startNodeEditing = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isEditing: node.id === nodeId,
      isSelected: node.id === nodeId,
    })));
  }, []);

  const cancelEditing = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.content.trim() === '') {
      deleteNode(nodeId);
    } else {
      setNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, isEditing: false } : n
      ));
    }
  }, [nodes, deleteNode]);

  // Toggle children visibility
  const toggleChildrenVisibility = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isCollapsed: !node.isCollapsed }
        : node
    ));
  }, []);

  // Get visible nodes
  const getVisibleNodes = useCallback(() => {
    const visibleNodes: Node[] = [];
    const processedNodes = new Set<string>();

    const processNode = (node: Node) => {
      if (processedNodes.has(node.id)) return;
      processedNodes.add(node.id);
      
      visibleNodes.push(node);

      if (!node.isCollapsed) {
        node.children.forEach(childId => {
          const childNode = nodes.find(n => n.id === childId);
          if (childNode) {
            processNode(childNode);
          }
        });
      }
    };

    const rootNodes = nodes.filter(n => !n.parentId);
    rootNodes.forEach(processNode);

    return visibleNodes;
  }, [nodes]);

  // Get expand button position
  const getExpandButtonPosition = useCallback((node: Node) => {
    if (node.children.length === 0) return null;
    
    const buttonDistance = LEVEL_SPACING_X / 2;
    
    return {
      x: node.x + buttonDistance,
      y: node.y,
    };
  }, []);

  const shouldShowExpandButton = useCallback((node: Node) => {
    return node.children.length > 0;
  }, []);

  // Calculate connections
  const calculateConnections = useCallback((): Connection[] => {
    const visibleNodes = getVisibleNodes();
    const newConnections: Connection[] = [];
    
    visibleNodes.forEach(node => {
      if (node.children.length > 0 && !node.isCollapsed) {
        const expandButtonPos = getExpandButtonPosition(node);
        if (!expandButtonPos) return;

        const isRoot = !node.parentId;
        const nodeWidth = node.width || calculateNodeWidth(node.content, isRoot);
        
        const NODE_HEIGHT = 40;
        const parentRightCenterX = node.x + nodeWidth;
        const parentRightCenterY = node.y;
        
        const expandButtonX = expandButtonPos.x;
        const expandButtonY = expandButtonPos.y;

        newConnections.push({
          id: `${node.id}-expand`,
          fromNodeId: node.id,
          toNodeId: 'expand',
          fromX: parentRightCenterX,
          fromY: parentRightCenterY,
          toX: expandButtonX - EXPAND_BUTTON_SIZE / 2,
          toY: expandButtonY,
          type: 'child',
        });

        for (let i = 0; i < node.children.length; i++) {
          const childId = node.children[i];
          const child = visibleNodes.find(n => n.id === childId);
          if (child) {
            const childLeftCenterX = child.x;
            const childLeftCenterY = child.y;
            
            if (node.children.length === 1) {
              newConnections.push({
                id: `expand-${child.id}`,
                fromNodeId: 'expand',
                toNodeId: child.id,
                fromX: expandButtonX + EXPAND_BUTTON_SIZE / 2,
                fromY: expandButtonY,
                toX: childLeftCenterX,
                toY: childLeftCenterY,
                type: 'child',
              });
            } else {
              const controlX = expandButtonX + (LEVEL_SPACING_X / 4);
              const controlY = expandButtonY + (child.y - expandButtonY) * 0.2;
              newConnections.push({
                id: `expand-${child.id}`,
                fromNodeId: 'expand',
                toNodeId: child.id,
                fromX: expandButtonX + EXPAND_BUTTON_SIZE / 2,
                fromY: expandButtonY,
                toX: childLeftCenterX,
                toY: childLeftCenterY,
                type: 'sibling',
                controlX: controlX,
                controlY: controlY,
              });
            }
          }
        }
      }
    });
    
    return newConnections;
  }, [nodes, getVisibleNodes, getExpandButtonPosition, calculateNodeWidth]);

  // Update connections
  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections]);

  // Find nearest node for navigation
  const getDistance = useCallback((node1: Node, node2: Node): number => {
    return Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2));
  }, []);

  const findNearestNode = useCallback((currentNode: Node, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
    const visibleNodes = getVisibleNodes().filter(n => n.id !== currentNode.id);
    if (visibleNodes.length === 0) return null;
    
    let candidates: Node[] = [];
    
    switch (direction) {
      case 'up':
        candidates = visibleNodes.filter(n => n.y < currentNode.y - 10);
        break;
      case 'down':
        candidates = visibleNodes.filter(n => n.y > currentNode.y + 10);
        break;
      case 'left':
        candidates = visibleNodes.filter(n => n.x < currentNode.x - 10);
        break;
      case 'right':
        candidates = visibleNodes.filter(n => n.x > currentNode.x + 10);
        break;
    }
    
    if (candidates.length === 0) return null;
    
    let nearestNode = candidates[0];
    let minDistance = getDistance(currentNode, nearestNode);
    
    for (let i = 1; i < candidates.length; i++) {
      const distance = getDistance(currentNode, candidates[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = candidates[i];
      }
    }
    
    return nearestNode.id;
  }, [getVisibleNodes, getDistance]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (!nodeId) {
      setDragState({
        isDragging: true,
        dragType: 'canvas',
        startX: clientX,
        startY: clientY,
        initialX: viewState.offsetX,
        initialY: viewState.offsetY,
      });
    } else {
      selectNode(nodeId);
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

    if (dragState.dragType === 'canvas') {
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

  // Wheel event (zoom)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta)),
    }));
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const editingNode = nodes.find(n => n.isEditing);
    if (editingNode && e.key !== 'Escape') {
      return;
    }

    if (e.key === '/') {
      setShowAICommand(true);
      setAIPrompt('/ai ');
      return;
    }

    if (e.key === 'Escape') {
      if (editingNode) {
        cancelEditing(editingNode.id);
        return;
      }
      
      if (showAICommand) {
        setShowAICommand(false);
        setAIPrompt('');
        return;
      }
      
      setNavigationMode(prev => !prev);
      
      if (!navigationMode && nodes.length > 0) {
        const selectedNode = nodes.find(n => n.isSelected);
        if (!selectedNode) {
          selectNode(nodes[0].id);
        }
      }
      return;
    }
    
    if (navigationMode) {
      const selectedNode = nodes.find(n => n.isSelected);
      if (!selectedNode) return;
      
      e.preventDefault();
      
      let targetNodeId: string | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
          targetNodeId = findNearestNode(selectedNode, 'up');
          break;
        case 'ArrowDown':
          targetNodeId = findNearestNode(selectedNode, 'down');
          break;
        case 'ArrowLeft':
          targetNodeId = findNearestNode(selectedNode, 'left');
          break;
        case 'ArrowRight':
          targetNodeId = findNearestNode(selectedNode, 'right');
          break;
        case 'Enter':
          startNodeEditing(selectedNode.id);
          setNavigationMode(false);
          return;
        case 'Delete':
        case 'Backspace':
          if (selectedNode.parentId) {
            const nextNodeId = findNearestNode(selectedNode, 'up') || 
                              findNearestNode(selectedNode, 'down') || 
                              findNearestNode(selectedNode, 'left') || 
                              findNearestNode(selectedNode, 'right') ||
                              selectedNode.parentId;
            
            deleteNode(selectedNode.id);
            
            if (nextNodeId) {
              setTimeout(() => {
                selectNode(nextNodeId);
              }, 0);
            }
          }
          return;
        case 'r':
        case 'R':
          createChildNode(selectedNode.id);
          setNavigationMode(false);
          return;
        case 'd':
        case 'D':
          if (selectedNode.parentId) {
            createSiblingNode(selectedNode.id);
            setNavigationMode(false);
          }
          return;
      }
      
      if (targetNodeId) {
        selectNode(targetNodeId);
      }
    }
  }, [nodes, navigationMode, cancelEditing, selectNode, startNodeEditing, findNearestNode, deleteNode, createChildNode, createSiblingNode, showAICommand]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // AI Command handling
  const handleAICommand = useCallback(async () => {
    if (!aiPrompt.startsWith('/ai ')) return;
    
    const prompt = aiPrompt.substring(4);
    setShowAICommand(false);
    setAIPrompt('');
    
    // Mock AI response - create a new node
    const selectedNode = nodes.find(n => n.isSelected) || nodes[0];
    if (selectedNode) {
      createChildNode(selectedNode.id);
      
      // Update the newly created node with AI content
      setTimeout(() => {
        const newNode = nodes.find(n => n.isEditing);
        if (newNode) {
          updateNodeContent(newNode.id, `AI: ${prompt}`);
        }
      }, 100);
    }
  }, [aiPrompt, nodes, createChildNode, updateNodeContent]);

  // Handle editing width change
  const handleEditingWidthChange = useCallback((nodeId: string, newContent: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const isRoot = !node.parentId;
    const newWidth = calculateNodeWidth(newContent, isRoot);

    setEditingNodeWidth(prev => ({
      ...prev,
      [nodeId]: newWidth
    }));
  }, [nodes, calculateNodeWidth]);

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  // Handle browser back button and page refresh
  useEffect(() => {
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

  const visibleNodes = getVisibleNodes();

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
            
            {/* Import/Export buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={triggerImport}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="マインドマップをインポート"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                onClick={exportMindMap}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="マインドマップをエクスポート"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
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
            <LanguageSwitcher variant="compact" />
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importMindMap}
        className="hidden"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebarVisible && (
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
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
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
                connection.type === 'sibling' && connection.controlX && connection.controlY ? (
                  <path
                    key={connection.id}
                    d={`M ${connection.fromX} ${connection.fromY} Q ${connection.controlX} ${connection.controlY} ${connection.toX} ${connection.toY}`}
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    fill="none"
                    className="transition-all duration-300"
                  />
                ) : (
                  <line
                    key={connection.id}
                    x1={connection.fromX}
                    y1={connection.fromY}
                    x2={connection.toX}
                    y2={connection.toY}
                    stroke="#4F46E5"
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                )
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
              {visibleNodes.map(node => (
                <div key={node.id}>
                  {/* Node body */}
                  <div
                    className={`absolute transition-all duration-300 group cursor-pointer ${
                      node.isSelected 
                        ? navigationMode 
                          ? 'text-blue-600 bg-blue-100 rounded-lg' 
                          : 'text-blue-600'
                        : 'text-gray-800 hover:text-blue-600'
                    }`}
                    style={{
                      left: node.x,
                      top: node.y,
                      minWidth: node.width || calculateNodeWidth(node.content),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectNode(node.id);
                    }}
                  >
                    <div
                      className={`px-1 py-1 rounded transition-colors cursor-pointer ${
                        !node.parentId 
                          ? 'text-2xl font-bold' 
                          : 'text-lg font-medium'
                      }`}
                      style={{
                        width: node.width || calculateNodeWidth(node.content, !node.parentId),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!dragState?.isDragging) {
                          startNodeEditing(node.id);
                        }
                      }}
                    >
                      {/* Selection border */}
                      {node.isSelected && (
                        <div className={`absolute -inset-2 border-2 rounded-lg pointer-events-none ${
                          navigationMode 
                            ? 'border-blue-600 bg-blue-100/50 shadow-lg' 
                            : 'border-blue-500 bg-blue-50/20'
                        }`} />
                      )}

                      {/* Node text */}
                      {node.isEditing ? (
                        <input
                          type="text"
                          defaultValue={node.content === 'New Node' ? '' : node.content}
                          className={`bg-transparent border-b-2 border-blue-500 outline-none px-1 w-full whitespace-nowrap overflow-hidden ${
                            !node.parentId ? 'text-2xl font-bold' : 'text-lg font-medium'
                          }`}
                          style={{
                            width: editingNodeWidth[node.id] ? `${editingNodeWidth[node.id]}px` : 'auto',
                            minWidth: '20px'
                          }}
                          autoFocus
                          onChange={(e) => handleEditingWidthChange(node.id, e.target.value)}
                          onBlur={(e) => updateNodeContent(node.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateNodeContent(node.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              cancelEditing(node.id);
                            }
                          }}
                        />
                      ) : (
                        <span className={`px-1 py-1 rounded transition-colors block whitespace-nowrap overflow-hidden text-ellipsis ${
                          !node.parentId ? 'text-2xl font-bold' : 'text-lg font-medium'
                        }`}
                        style={{
                          width: node.width || calculateNodeWidth(node.content, !node.parentId),
                        }}>
                          {node.content}
                        </span>
                      )}

                      {/* Delete button when selected */}
                      {node.isSelected && (
                        <button
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-20 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      {/* Child node add button (right) */}
                      {!node.isEditing && (
                        <button
                          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-blue-600 z-10"
                          style={{
                            right: -40,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            createChildNode(node.id);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}

                      {/* Sibling node add button (bottom) */}
                      {!node.isEditing && node.parentId && (
                        <button
                          className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-green-600 z-10"
                          style={{
                            bottom: -40,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            createSiblingNode(node.id);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse button */}
                  {shouldShowExpandButton(node) && (
                    <div
                      className="absolute z-10"
                      style={{
                        left: getExpandButtonPosition(node)?.x || 0,
                        top: getExpandButtonPosition(node)?.y || 0,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <button
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                          node.isCollapsed
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChildrenVisibility(node.id);
                        }}
                      >
                        {node.isCollapsed ? (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        ) : (
                          <div className="w-2 h-2 border border-blue-500 rounded-full" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation mode display */}
      {navigationMode && (
        <div className="absolute top-20 right-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-sm z-50">
          <div className="px-4 py-3 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
              <span className="text-lg font-bold tracking-wide">ナビゲーションモード</span>
            </div>
          </div>
          
          <div className="px-4 py-3 space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-blue-100 uppercase tracking-wider">移動</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">↑↓←→</kbd>
                  <span className="text-white/90">ノード移動</span>
                </div>
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Enter</kbd>
                  <span className="text-white/90">編集開始</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-green-200 uppercase tracking-wider">追加</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-green-500/30 rounded text-xs font-mono">R</kbd>
                  <span className="text-white/90">右に子ノード</span>
                </div>
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-green-500/30 rounded text-xs font-mono">D</kbd>
                  <span className="text-white/90">下に兄弟ノード</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-red-200 uppercase tracking-wider">操作</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-red-500/30 rounded text-xs font-mono">Del</kbd>
                  <span className="text-white/90">ノード削除</span>
                </div>
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-gray-500/30 rounded text-xs font-mono">Esc</kbd>
                  <span className="text-white/90">モード終了</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Zoom display */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>
    </div>
  );
};