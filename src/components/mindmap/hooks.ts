import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Connection, ViewState, ExportData } from './types';
import { 
  NODE_SPACING_X, 
  NODE_SPACING_Y, 
  LEVEL_SPACING_X, 
  MIN_SCALE, 
  MAX_SCALE,
  EXPAND_BUTTON_SIZE,
  COLLISION_DETECTION_BUFFER,
  PARENT_SPACING_INCREMENT,
  MIN_PARENT_SPACING,
} from './constants';

export const useMindMapState = () => {
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
      width: 0,
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
  const [editingContent, setEditingContent] = useState<{ [nodeId: string]: string }>({});
  
  const [showAICommand, setShowAICommand] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return {
    nodes,
    setNodes,
    connections,
    setConnections,
    viewState,
    setViewState,
    dragState,
    setDragState,
    navigationMode,
    setNavigationMode,
    nextNodeId,
    setNextNodeId,
    editingContent,
    setEditingContent,
    showAICommand,
    setShowAICommand,
    aiPrompt,
    setAIPrompt,
    sidebarVisible,
    setSidebarVisible,
  };
};

export const useMindMapLogic = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  nextNodeId: number,
  setNextNodeId: React.Dispatch<React.SetStateAction<number>>,
  editingContent: { [nodeId: string]: string },
  setEditingContent: React.Dispatch<React.SetStateAction<{ [nodeId: string]: string }>>,
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>,
  calculateNodeWidth: (content: string, isRoot?: boolean) => number
) => {
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  const measureTextWidth = useCallback((text: string, isRoot = false) => {
    if (!textMeasureRef.current) return 0;
    
    const measureElement = textMeasureRef.current;
    measureElement.style.fontSize = isRoot ? '24px' : '18px';
    measureElement.style.fontWeight = isRoot ? 'bold' : 'medium';
    measureElement.textContent = text || 'A';
    
    return measureElement.offsetWidth;
  }, []);

  const getDescendants = useCallback((nodeId: string): Node[] => {
    const descendants: Node[] = [];
    const visited = new Set<string>();

    const traverse = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);

      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) return;

      currentNode.children.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode) {
          descendants.push(childNode);
          traverse(childId);
        }
      });
    };

    traverse(nodeId);
    return descendants;
  }, [nodes]);

  const moveNodeGroup = useCallback((rootNodeId: string, deltaX: number, deltaY: number) => {
    const descendants = getDescendants(rootNodeId);
    const affectedNodeIds = [rootNodeId, ...descendants.map(n => n.id)];

    setNodes(prev => prev.map(node => {
      if (affectedNodeIds.includes(node.id)) {
        return {
          ...node,
          x: node.x + deltaX,
          y: node.y + deltaY
        };
      }
      return node;
    }));
  }, [getDescendants, setNodes]);

  const detectAndResolveCollisions = useCallback(() => {
    const rootNodes = nodes.filter(n => !n.parentId).sort((a, b) => a.y - b.y);
    if (rootNodes.length <= 1) return;

    const groups = rootNodes.map(root => {
      const allDescendants = getDescendants(root.id);
      const groupNodes = [root, ...allDescendants];
      
      if (groupNodes.length === 0) return null;

      const minX = Math.min(...groupNodes.map(n => n.x));
      const maxX = Math.max(...groupNodes.map(n => n.x + (n.width || calculateNodeWidth(n.content, !n.parentId))));
      const minY = Math.min(...groupNodes.map(n => n.y));
      const maxY = Math.max(...groupNodes.map(n => n.y + 40));

      return {
        rootId: root.id,
        bounds: { minX, maxX, minY, maxY },
        centerY: (minY + maxY) / 2,
        height: maxY - minY
      };
    }).filter(Boolean);

    let hasCollisions = true;
    let attempts = 0;
    const maxAttempts = 5;

    while (hasCollisions && attempts < maxAttempts) {
      hasCollisions = false;
      attempts++;

      for (let i = 0; i < groups.length - 1; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          const group1 = groups[i];
          const group2 = groups[j];
          
          if (!group1 || !group2) continue;

          const yOverlap = Math.max(0, 
            Math.min(group1.bounds.maxY, group2.bounds.maxY) - 
            Math.max(group1.bounds.minY, group2.bounds.minY)
          );

          if (yOverlap > 0) {
            hasCollisions = true;
            
            const lowerGroup = group1.centerY > group2.centerY ? group1 : group2;
            const moveDistance = yOverlap + COLLISION_DETECTION_BUFFER;
            
            moveNodeGroup(lowerGroup.rootId, 0, moveDistance);
            
            lowerGroup.bounds.minY += moveDistance;
            lowerGroup.bounds.maxY += moveDistance;
            lowerGroup.centerY += moveDistance;
          }
        }
      }
    }
  }, [nodes, getDescendants, calculateNodeWidth, moveNodeGroup]);

  const getOccupiedYRanges = useCallback((x: number, excludeParentId: string): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = [];
    const NODE_HEIGHT = 40;
    const COLLISION_MARGIN = COLLISION_DETECTION_BUFFER / 2;
    
    const parentNodes = nodes.filter(n => !n.parentId && n.id !== excludeParentId);
    
    parentNodes.forEach(parent => {
      if (parent.children.length > 0) {
        const parentWidth = parent.width || calculateNodeWidth(parent.content, true);
        const childX = parent.x + parentWidth + 60;
        
        if (Math.abs(childX - x) < 120) {
          parent.children.forEach(childId => {
            const child = nodes.find(n => n.id === childId);
            if (child) {
              const descendants = getDescendants(childId);
              const allNodes = [child, ...descendants];
              
              allNodes.forEach(node => {
                ranges.push({
                  start: node.y - COLLISION_MARGIN,
                  end: node.y + NODE_HEIGHT + COLLISION_MARGIN
                });
              });
            }
          });
        }
      }
    });
    
    const sortedRanges = ranges.sort((a, b) => a.start - b.start);
    const mergedRanges: { start: number; end: number }[] = [];
    
    sortedRanges.forEach(range => {
      if (mergedRanges.length === 0 || mergedRanges[mergedRanges.length - 1].end < range.start) {
        mergedRanges.push(range);
      } else {
        mergedRanges[mergedRanges.length - 1].end = Math.max(mergedRanges[mergedRanges.length - 1].end, range.end);
      }
    });
    
    return mergedRanges;
  }, [nodes, calculateNodeWidth, getDescendants]);

  const findClearYSpace = useCallback((preferredStartY: number, totalHeight: number, occupiedRanges: { start: number; end: number }[], spacing: number): number => {
    const preferredEndY = preferredStartY + totalHeight;
    const BUFFER = COLLISION_DETECTION_BUFFER;
    
    const hasCollision = occupiedRanges.some(range => 
      !(preferredEndY + BUFFER < range.start || preferredStartY - BUFFER > range.end)
    );
    
    if (!hasCollision) {
      return preferredStartY;
    }
    
    let bestY = preferredStartY;
    let minOffset = Infinity;
    
    occupiedRanges.forEach((range, index) => {
      const aboveY = range.start - totalHeight - BUFFER;
      const aboveOffset = Math.abs(aboveY - preferredStartY);
      if (aboveOffset < minOffset) {
        const aboveEndY = aboveY + totalHeight;
        const hasAboveCollision = occupiedRanges.some((otherRange, otherIndex) => 
          otherIndex !== index && !(aboveEndY + BUFFER < otherRange.start || aboveY - BUFFER > otherRange.end)
        );
        if (!hasAboveCollision) {
          bestY = aboveY;
          minOffset = aboveOffset;
        }
      }
      
      const belowY = range.end + BUFFER;
      const belowOffset = Math.abs(belowY - preferredStartY);
      if (belowOffset < minOffset) {
        const belowEndY = belowY + totalHeight;
        const hasBelowCollision = occupiedRanges.some((otherRange, otherIndex) => 
          otherIndex !== index && !(belowEndY + BUFFER < otherRange.start || belowY - BUFFER > otherRange.end)
        );
        if (!hasBelowCollision) {
          bestY = belowY;
          minOffset = belowOffset;
        }
      }
    });
    
    return bestY;
  }, []);

  const calculateBalancedChildPositions = useCallback((parentNode: Node, useFixedDistance = true): { x: number; y: number }[] => {
    const childCount = parentNode.children.length;
    if (childCount === 0) return [];

    const parentWidth = parentNode.width || calculateNodeWidth(parentNode.content, !parentNode.parentId);
    

    const baseX = useFixedDistance 
      ? parentNode.x + parentWidth + 60
      : parentNode.x + NODE_SPACING_X;
    
    const positions: { x: number; y: number }[] = [];

    if (childCount === 1) {
      positions.push({ x: baseX, y: parentNode.y });
    } else {
      const baseSpacing = Math.max(60, NODE_SPACING_Y - Math.max(0, (childCount - 2) * 5));
      let spacing = baseSpacing;
              
      const otherRootNodes = nodes.filter(n => !n.parentId && n.id !== (parentNode.parentId || parentNode.id));
      const hasNearbyGroups = otherRootNodes.some(root => {
        const rootDescendants = getDescendants(root.id);
        const anyChildNearX = rootDescendants.some(desc => Math.abs(desc.x - baseX) < 150);
        return anyChildNearX;
      });
              
      if (hasNearbyGroups) {
        spacing = Math.max(spacing, 80);
      }     

      const totalHeight = (childCount - 1) * spacing;
      const startY = parentNode.y - totalHeight / 2;

      const occupiedRanges = getOccupiedYRanges(baseX, parentNode.id);
      let adjustedStartY = startY;
      
      if (occupiedRanges.length > 0) {
        adjustedStartY = findClearYSpace(startY, totalHeight, occupiedRanges, spacing);
      }

      for (let i = 0; i < childCount; i++) {
        positions.push({
          x: baseX,
          y: adjustedStartY + i * spacing
        });
      }
    }

    return positions;
  }, [calculateNodeWidth, nodes, getDescendants, getOccupiedYRanges, findClearYSpace]);


  const moveDescendantsVertically = useCallback((parentNodeId: string, deltaY: number) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0 || deltaY === 0) return;

    setNodes(prev => prev.map(node => {
      if (parentNode.children.includes(node.id)) {
        const updatedNode = {
          ...node,
          y: node.y + deltaY
        };
        
        if (node.children.length > 0) {
          setTimeout(() => moveDescendantsVertically(node.id, deltaY), 0);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes, setNodes]);

  const adjustChildPositionsAfterParentChange = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode || parentNode.children.length === 0) return;

    const newPositions = calculateBalancedChildPositions(parentNode, true);
    
    setNodes(prev => prev.map(node => {
      const childIndex = parentNode.children.indexOf(node.id);
      if (childIndex !== -1 && newPositions[childIndex]) {
        const oldPosition = { x: node.x, y: node.y };
        const newPosition = newPositions[childIndex];
        const deltaX = newPosition.x - oldPosition.x;
        const deltaY = newPosition.y - oldPosition.y;
        
        const updatedNode = {
          ...node,
          x: newPosition.x,
          y: newPosition.y
        };
        
        if (deltaX !== 0 || deltaY !== 0) {
          moveDescendants(node.id, deltaX, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes, calculateBalancedChildPositions, setNodes]);

  const moveDescendants = useCallback((parentNodeId: string, deltaX: number, deltaY: number) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0) return;

    setNodes(prev => prev.map(node => {
      if (parentNode.children.includes(node.id)) {
        const updatedNode = {
          ...node,
          x: node.x + deltaX,
          y: node.y + deltaY
        };
        
        if (node.children.length > 0) {
          moveDescendants(node.id, deltaX, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes, setNodes]);

  return {
    textMeasureRef,
    measureTextWidth,
    getDescendants,
    moveNodeGroup,
    detectAndResolveCollisions,
    getOccupiedYRanges,
    findClearYSpace,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    adjustChildPositionsAfterParentChange,
    moveDescendants,
  };
};

export const useMindMapActions = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  nextNodeId: number,
  setNextNodeId: React.Dispatch<React.SetStateAction<number>>,
  editingContent: { [nodeId: string]: string },
  setEditingContent: React.Dispatch<React.SetStateAction<{ [nodeId: string]: string }>>,
  calculateNodeWidth: (content: string, isRoot?: boolean) => number,
  calculateBalancedChildPositions: (parentNode: Node, useFixedDistance?: boolean) => { x: number; y: number }[],
  moveDescendantsVertically: (parentNodeId: string, deltaY: number) => void,
  detectAndResolveCollisions: () => void,
  adjustChildPositionsAfterParentChange: (parentId: string) => void
) => {
  const updateNodeWidth = useCallback((nodeId: string, content: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const isRoot = !node.parentId;
    const oldWidth = node.width || 0;
    const newWidth = calculateNodeWidth(content, isRoot);
    
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, width: newWidth } : n
    ));

    if (node.children.length > 0 && Math.abs(newWidth - oldWidth) > 5) {
      setTimeout(() => {
        adjustChildPositionsAfterParentChange(nodeId);
        setTimeout(detectAndResolveCollisions, 100);
      }, 0);
    }
  }, [nodes, calculateNodeWidth, adjustChildPositionsAfterParentChange, 
detectAndResolveCollisions, setNodes]);

  const createChildNode = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const tempUpdatedParent = {
      ...parentNode,
      children: [...parentNode.children, nextNodeId.toString()]
    };
    
    const newPositions = calculateBalancedChildPositions(tempUpdatedParent, true);
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

    setEditingContent(prev => ({
      ...prev,
      [newNode.id]: ''
    }));

    setTimeout(() => {
      const newChildren = [...parentNode.children, newNode.id];  
      const finalUpdatedParent = { ...parentNode, children: newChildren };
      const allPositions = calculateBalancedChildPositions(finalUpdatedParent, true);
              
      setNodes(prev => prev.map(n => {
        const childIndex = newChildren.indexOf(n.id);
        if (childIndex !== -1 && allPositions[childIndex]) {
          const newPos = allPositions[childIndex];
          const deltaY = newPos.y - n.y;
                  
          if (deltaY !== 0) {
            moveDescendantsVertically(n.id, deltaY);
          }
      
                  
          return {
            ...n,
            x: newPos.x,
            y: newPos.y
          };
        }
        return n;
      }));
              
      setTimeout(detectAndResolveCollisions, 150);
    }, 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateBalancedChildPositions, calculateNodeWidth, 
    moveDescendantsVertically, detectAndResolveCollisions, setNodes, setEditingContent, setNextNodeId]);

  const createSiblingNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parentNode = nodes.find(n => n.id === node.parentId);
    if (!parentNode) return;

    const currentNodeIndex = parentNode.children.indexOf(nodeId);
    if (currentNodeIndex === -1) return;

    const newChildren = [...parentNode.children];
    newChildren.splice(currentNodeIndex + 1, 0, nextNodeId.toString());

    const tempUpdatedParent = {
      ...parentNode,
      children: newChildren
    };
    
    const newPositions = calculateBalancedChildPositions(tempUpdatedParent, true);
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

    setEditingContent(prev => ({
      ...prev,
      [newNode.id]: ''
    }));

    // Use enhanced real-time layout adjustment
    setTimeout(() => {
      const finalUpdatedParent = { ...parentNode, children: [...parentNode.children, 
        nextNodeId.toString()] };
        
        const allPositions = calculateBalancedChildPositions(finalUpdatedParent, true);
                  
        setNodes(prev => prev.map(node => {
          const childIndex = finalUpdatedParent.children.indexOf(node.id);
          if (childIndex !== -1 && allPositions[childIndex]) {
            const newPos = allPositions[childIndex];
            const deltaY = newPos.y - node.y;
              
            if (deltaY !== 0) {
              moveDescendantsVertically(node.id, deltaY);
            }
          
            return {
              ...node,
              x: newPos.x,
              y: newPos.y
            };
          }
          return node;
        }));
                  
        setTimeout(detectAndResolveCollisions, 150);
      }, 0);

         setNextNodeId(prev => prev + 1);
        }, [nodes, nextNodeId, calculateBalancedChildPositions, calculateNodeWidth, 
          moveDescendantsVertically, detectAndResolveCollisions, setNodes, setEditingContent, setNextNodeId]);

  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete?.parentId) {
      return;
    }
    
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

    setEditingContent(prev => {
      const newState = { ...prev };
      delete newState[nodeId];
      return newState;
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
  }, [nodes, moveDescendantsVertically, calculateBalancedChildPositions, setNodes, setEditingContent]);

  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    const trimmedContent = content.trim();
    if (trimmedContent === '') {
      deleteNode(nodeId);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const isRoot = !node.parentId;
    const oldWidth = node.width || 0;
    const newWidth = calculateNodeWidth(trimmedContent, isRoot);

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          content: trimmedContent,
          isEditing: false,
          width: newWidth,
        };
      }
      return n;
    }));

    setEditingContent(prev => {
      const newState = { ...prev };
      delete newState[nodeId];
      return newState;
    });

    if (node.children.length > 0 && Math.abs(newWidth - oldWidth) > 5) {
      setTimeout(() => {
        adjustChildPositionsAfterParentChange(nodeId);
      }, 0);
    }
  }, [nodes, deleteNode, calculateNodeWidth, adjustChildPositionsAfterParentChange, setNodes, 
    setEditingContent]);

  const handleEditingContentChange = useCallback((nodeId: string, content: string) => {
    setEditingContent(prev => ({
      ...prev,
      [nodeId]: content
    }));
    
    updateNodeWidth(nodeId, content);
  }, [updateNodeWidth, setEditingContent]);

  const selectNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isSelected: node.id === nodeId,
      isEditing: false,
    })));
  }, [setNodes]);

  const startNodeEditing = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setNodes(prev => prev.map(n => ({
      ...n,
      isEditing: n.id === nodeId,
      isSelected: n.id === nodeId,
    })));

    setEditingContent(prev => ({
      ...prev,
      [nodeId]: node.content === 'New Node' ? '' : node.content
    }));
  }, [nodes, setNodes, setEditingContent]);

  const cancelEditing = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const currentEditingContent = editingContent[nodeId] || '';
    
    if (node && currentEditingContent.trim() === '') {
      deleteNode(nodeId);
    } else {
      setNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, isEditing: false } : n
      ));
      
      setEditingContent(prev => {
        const newState = { ...prev };
        delete newState[nodeId];
        return newState;
      });
    }
  }, [nodes, editingContent, deleteNode, setNodes, setEditingContent]);

  const toggleChildrenVisibility = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isCollapsed: !node.isCollapsed }
        : node
    ));
  }, [setNodes]);

  return {
    updateNodeWidth,
    createChildNode,
    createSiblingNode,
    deleteNode,
    updateNodeContent,
    handleEditingContentChange,
    selectNode,
    startNodeEditing,
    cancelEditing,
    toggleChildrenVisibility,
  };
};

export const useMindMapUtils = (
  nodes: Node[],
  calculateNodeWidth: (content: string, isRoot?: boolean) => number
) => {
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

  const getExpandButtonPosition = useCallback((node: Node) => {
    if (node.children.length === 0) return null;
    
    const nodeWidth = node.width || calculateNodeWidth(node.content, !node.parentId);
    const NODE_HEIGHT = 40;
    
    return {
      x: node.x + nodeWidth,
      y: node.y + NODE_HEIGHT / 2,
    };
  }, [calculateNodeWidth]);

  const shouldShowExpandButton = useCallback((node: Node) => {
    return node.children.length > 0;
  }, []);


  const calculateConnections = useCallback((): Connection[] => {
    const visibleNodes = getVisibleNodes();
    const newConnections: Connection[] = [];
    const NODE_HEIGHT = 40;
  
    visibleNodes.forEach(node => {
      if (node.children.length > 0 && !node.isCollapsed) {
        const isRoot = !node.parentId;
        const nodeWidth = node.width || calculateNodeWidth(node.content, isRoot);
  
        const parentRightCenterX = node.x + nodeWidth;
        const parentRightCenterY = node.y + NODE_HEIGHT / 2;
  
        const siblings = node.children
          .map(id => visibleNodes.find(n => n.id === id))
          .filter((c): c is Node => !!c);
  
        for (let i = 0; i < siblings.length; i++) {
          const child = siblings[i];
          const childIsRoot = !child.parentId;
          const childWidth = child.width || calculateNodeWidth(child.content, childIsRoot);
  
          const childLeftCenterX = child.x;
          const childLeftCenterY = child.y + NODE_HEIGHT / 2;
  
          const yDiff = childLeftCenterY - parentRightCenterY;
          const xDiff = childLeftCenterX - parentRightCenterX;
  
          // 水平判定：ほぼ同じ高さなら直線
          if (Math.abs(yDiff) < 5) {
            newConnections.push({
              id: `${node.id}-${child.id}`,
              fromNodeId: node.id,
              toNodeId: child.id,
              fromX: parentRightCenterX,
              fromY: parentRightCenterY,
              toX: childLeftCenterX,
              toY: childLeftCenterY,
              type: "child",
            });
            continue;
          }
  
          if (siblings.length === 1) {
            // 子が一つだけならシンプルに直線
            newConnections.push({
              id: `${node.id}-${child.id}`,
              fromNodeId: node.id,
              toNodeId: child.id,
              fromX: parentRightCenterX,
              fromY: parentRightCenterY,
              toX: childLeftCenterX,
              toY: childLeftCenterY,
              type: "child",
            });
          } else {
            // === 複合パス：直線 + ベジェ曲線 ===
            
            // 始点
            const startX = parentRightCenterX;
            const startY = parentRightCenterY;
            
            // 終点  
            const endX = childLeftCenterX;
            const endY = childLeftCenterY;
            
            // 曲がり角のX座標を、親ノードと子ノードの中間地点に設定
            const intermediateX = startX + (endX - startX) / 2;

            // この設計では、パスは以下の要素で構成されます。
            // 1. 直線部分： 親から中間点まで水平に引く
            //    (startX, startY) -> (intermediateX, startY)
            // 2. 曲線部分： 中間点から子までを2次ベジェ曲線で滑らかに繋ぐ
            //    始点: (intermediateX, startY), 制御点: (intermediateX, endY), 終点: (endX, endY)
            //
            // この制御点の位置設定により、曲線は垂直に曲がり始め、水平に子ノードへ到着するため、
            // 非常に自然で予測可能な「エルボー」形状になります。

            newConnections.push({
              id: `${node.id}-${child.id}`,
              fromNodeId: node.id,
              toNodeId: child.id,
              fromX: startX,
              fromY: startY,
              toX: endX,
              toY: endY,
              type: "composite",
              // 直線部分の終点
              lineEndX: intermediateX,
              lineEndY: startY,
              // ベジェ曲線部分
              curveStartX: intermediateX, // 直線の終点が曲線の始点
              curveStartY: startY,
              controlX: intermediateX,    // 曲がり角のX座標
              controlY: endY,           // 子ノードのY座標
              curveEndX: endX,
              curveEndY: endY,
            });
          }
        }
      }
    });
    console.log("visibleNodes:", visibleNodes.length);
    console.log("newConnections:", newConnections.length);
    return newConnections;
  }, [nodes, getVisibleNodes, calculateNodeWidth]);
  
  

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

  return {
    getVisibleNodes,
    getExpandButtonPosition,
    shouldShowExpandButton,
    calculateConnections,
    getDistance,
    findNearestNode,
  };
};

export const useMindMapImportExport = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setNextNodeId: React.Dispatch<React.SetStateAction<number>>,
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>,
  setNavigationMode: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingContent: React.Dispatch<React.SetStateAction<{ [nodeId: string]: string }>>,
  calculateNodeWidth: (content: string, isRoot?: boolean) => number
) => {
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
          width: calculateNodeWidth(node.content, !node.parentId),
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
        setEditingContent({});

        alert(`マインドマップをインポートしました。\nノード数: ${importedNodes.length}`);
      } catch (error) {
        console.error('Import error:', error);
        alert('ファイルの読み込みに失敗しました。正しいJSON形式のファイルを選択してください。');
      }
    };
    
    reader.readAsText(file);
  }, [calculateNodeWidth, setNodes, setNextNodeId, setViewState, setNavigationMode, setEditingContent]);

  return {
    exportMindMap,
    importMindMap,
  };
};