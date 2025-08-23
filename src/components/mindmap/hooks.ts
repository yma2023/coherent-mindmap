import { useState, useCallback, useRef} from 'react';
import { Node, Connection, ViewState, ExportData } from './types';
import { 
  NODE_SPACING_X, 
  NODE_SPACING_Y, 
  COLLISION_DETECTION_BUFFER,
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

  const detectGlobalYCollisions = useCallback(() => {
    const allNodes = nodes.filter(n => !n.isCollapsed);
    const NODE_HEIGHT = 40;
    const collisions: { node1: Node; node2: Node; yOverlap: number }[] = [];

    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const node1 = allNodes[i];
        const node2 = allNodes[j];
        
        // Only check nodes at similar X positions (same hierarchy level)
        const xDiff = Math.abs(node1.x - node2.x);
        if (xDiff < 150) {
          const yOverlap = Math.max(0, 
            Math.min(node1.y + NODE_HEIGHT, node2.y + NODE_HEIGHT) - 
            Math.max(node1.y, node2.y)
          );
          
          if (yOverlap > 0) {
            collisions.push({ node1, node2, yOverlap });
          }
        }
      }
    }
    
    return collisions;
  }, [nodes]);


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

  const calculateSubtreeBounds = useCallback((nodeId: string): { minY: number; maxY: number; height: number } => {
    const getAllDescendants = (id: string): Node[] => {
      const node = nodes.find(n => n.id === id);
      if (!node) return [];
      
      let descendants = [node];
      node.children.forEach(childId => {
        descendants = descendants.concat(getAllDescendants(childId));
      });
      return descendants;
    };

    const subtreeNodes = getAllDescendants(nodeId);
    if (subtreeNodes.length === 0) return { minY: 0, maxY: 40, height: 40 };

    const minY = Math.min(...subtreeNodes.map(n => n.y));
    const maxY = Math.max(...subtreeNodes.map(n => n.y + 40)); // NODE_HEIGHT = 40
    
    return { minY, maxY, height: maxY - minY };
  }, [nodes]);

  const calculateChildrenCenter = useCallback((parentNodeId: string): number | null => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0) return null;

    const childNodes = parentNode.children
      .map(childId => nodes.find(n => n.id === childId))
      .filter((node): node is Node => !!node);

    if (childNodes.length === 0) return null;

    // Calculate the bounds of the entire children subtree
    let minY = Infinity;
    let maxY = -Infinity;
    
    childNodes.forEach(child => {
      const subtreeBounds = calculateSubtreeBounds(child.id);
      minY = Math.min(minY, subtreeBounds.minY);
      maxY = Math.max(maxY, subtreeBounds.maxY);
    });
    
    return (minY + maxY) / 2;
  }, [nodes, calculateSubtreeBounds]);

  const adjustParentToChildrenCenter = useCallback((parentNodeId: string): number => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0) return 0;

    const childrenCenter = calculateChildrenCenter(parentNodeId);
    if (childrenCenter === null) return 0;

    const currentParentCenter = parentNode.y + 20; // NODE_HEIGHT / 2
    const deltaY = childrenCenter - currentParentCenter;

    if (Math.abs(deltaY) < 5) return 0; // No significant change needed

    // Move the parent node
    setNodes(prev => prev.map(node => 
      node.id === parentNodeId 
        ? { ...node, y: node.y + deltaY }
        : node
    ));

    return deltaY;
  }, [nodes, calculateChildrenCenter, setNodes]);

  const adjustSiblingSpacing = useCallback((parentNodeId: string, parentDeltaY: number) => {
    const grandParentNode = nodes.find(n => n.children.includes(parentNodeId));
    if (!grandParentNode || grandParentNode.children.length <= 1) return;

    const siblings = grandParentNode.children
      .map(childId => nodes.find(n => n.id === childId))
      .filter((node): node is Node => !!node)
      .sort((a, b) => a.y - b.y);

    const movedParentIndex = siblings.findIndex(n => n.id === parentNodeId);
    if (movedParentIndex === -1) return;

    const BASE_SPACING_BUFFER = 60; // Increased from 40 for better separation
    
    // Calculate subtree bounds for all siblings
    const siblingBounds = siblings.map(sibling => ({
      id: sibling.id,
      node: sibling,
      bounds: calculateSubtreeBounds(sibling.id)
    }));

    // Calculate the total expanded height needed for all siblings
    const totalRequiredHeight = siblingBounds.reduce((total, siblingBound, index) => {
      const spacing = index > 0 ? BASE_SPACING_BUFFER : 0;
      return total + spacing + siblingBound.bounds.height;
    }, 0);

    // Calculate dynamic spacing based on available space and subtree complexity
    const getAdaptiveSpacing = (currentBounds: any, nextBounds: any) => {
      const currentComplexity = Math.min(currentBounds.height / 40, 10); // Max 10 levels
      const nextComplexity = Math.min(nextBounds.height / 40, 10);
      const complexityFactor = Math.max(currentComplexity, nextComplexity);
      
      // Exponential spacing increase for deeper subtrees
      return BASE_SPACING_BUFFER + (complexityFactor * 15);
    };

    const newPositions: { id: string; y: number }[] = [];
    
    // Start positioning from the moved parent (which is already positioned correctly)
    const anchorIndex = movedParentIndex;
    const anchorY = siblings[anchorIndex].y;
    newPositions.push({ id: siblings[anchorIndex].id, y: anchorY });

    // Position siblings above the anchor with enhanced spacing
    let currentY = anchorY;
    for (let i = anchorIndex - 1; i >= 0; i--) {
      const currentSubtreeBounds = siblingBounds[i].bounds;
      const belowSubtreeBounds = siblingBounds[i + 1].bounds;
      
      // Use adaptive spacing that considers subtree complexity
      const adaptiveSpacing = getAdaptiveSpacing(currentSubtreeBounds, belowSubtreeBounds);
      const requiredSpacing = (currentSubtreeBounds.height / 2) + (belowSubtreeBounds.height / 2) + adaptiveSpacing;
      
      currentY = currentY - requiredSpacing;
      newPositions.push({ id: siblings[i].id, y: currentY });
    }

    // Position siblings below the anchor with enhanced spacing
    currentY = anchorY;
    for (let i = anchorIndex + 1; i < siblings.length; i++) {
      const currentSubtreeBounds = siblingBounds[i].bounds;
      const aboveSubtreeBounds = siblingBounds[i - 1].bounds;
      
      // Use adaptive spacing that considers subtree complexity
      const adaptiveSpacing = getAdaptiveSpacing(currentSubtreeBounds, aboveSubtreeBounds);
      const requiredSpacing = (currentSubtreeBounds.height / 2) + (aboveSubtreeBounds.height / 2) + adaptiveSpacing;
      
      currentY = currentY + requiredSpacing;
      newPositions.push({ id: siblings[i].id, y: currentY });
    }

    // Apply the new positions with improved collision detection
    setNodes(prev => prev.map(node => {
      const newPos = newPositions.find(p => p.id === node.id);
      if (newPos && Math.abs(newPos.y - node.y) > 3) { // Reduced threshold for more responsive updates
        const deltaY = newPos.y - node.y;
        // Also move all descendants of this sibling
        setTimeout(() => moveDescendants(node.id, 0, deltaY), 0);
        return { ...node, y: newPos.y };
      }
      return node;
    }));
  }, [nodes, setNodes, moveDescendants, calculateSubtreeBounds]);

  const triggerParentHierarchyAdjustment = useCallback((nodeId: string) => {
    let currentNode = nodes.find(n => n.id === nodeId);
    const adjustedParents = new Set<string>();
    
    while (currentNode?.parentId && !adjustedParents.has(currentNode.parentId)) {
      const parentId = currentNode.parentId;
      const parent = nodes.find(n => n.id === parentId);
      if (parent) {
        adjustedParents.add(parent.id);
        adjustParentToChildrenCenter(parent.id);
        adjustSiblingSpacing(parent.id, 0);
        currentNode = parent;
      } else {
        break;
      }
    }
  }, [nodes, adjustParentToChildrenCenter, adjustSiblingSpacing]);

  const recursiveParentAdjustment = useCallback((nodeId: string, depth: number = 0) => {
    if (depth > 10) return; // Prevent infinite recursion
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    // Adjust the immediate parent to center on its children
    const parentDeltaY = adjustParentToChildrenCenter(node.parentId);
    
    // Always check sibling spacing when a parent adjustment occurs, even for small movements
    if (Math.abs(parentDeltaY) > 1) { // Reduced threshold for more responsive adjustments
      // If parent moved, adjust sibling spacing at this level
      adjustSiblingSpacing(node.parentId, parentDeltaY);
      
      // Propagate the adjustment up the hierarchy with optimized delays
      setTimeout(() => {
        recursiveParentAdjustment(node.parentId!, depth + 1);
      }, 50 + (depth * 20)); // Reduced base delay for faster propagation
    } else {
      // Even if parent didn't move significantly, check if siblings need spacing adjustment
      // This handles cases where children expanded but parent is already well-positioned
      const parentNode = nodes.find(n => n.id === node.parentId);
      if (parentNode && parentNode.parentId) {
        const grandParentNode = nodes.find(n => n.id === parentNode.parentId);
        if (grandParentNode && grandParentNode.children.length > 1) {
          // Check if any sibling has subtrees that might be overlapping
          const siblings = grandParentNode.children
            .map(childId => nodes.find(n => n.id === childId))
            .filter((n): n is Node => !!n);
          
          if (siblings.length > 1) {
            const siblingBounds = siblings.map(sibling => ({
              id: sibling.id,
              bounds: calculateSubtreeBounds(sibling.id)
            }));
            
            // Check for any overlaps between sibling subtrees
            let hasOverlap = false;
            for (let i = 0; i < siblingBounds.length - 1; i++) {
              const current = siblingBounds[i].bounds;
              const next = siblingBounds[i + 1].bounds;
              if (current.maxY + 10 > next.minY) { // 10px minimum gap
                hasOverlap = true;
                break;
              }
            }
            
            if (hasOverlap) {
              adjustSiblingSpacing(node.parentId, 0); // Force spacing adjustment
              setTimeout(() => {
                recursiveParentAdjustment(node.parentId!, depth + 1);
              }, 50 + (depth * 20));
            }
          }
        }
      }
    }
  }, [nodes, adjustParentToChildrenCenter, adjustSiblingSpacing, calculateSubtreeBounds]);

  const detectAndAdjustParentLevelSpacing = useCallback(() => {
    const crossGroupCollisions = detectGlobalYCollisions().filter(({ node1, node2 }) => {
      // Only detect collisions between nodes from different root groups
      const getRootParent = (nodeId: string): string => {
        let current = nodes.find(n => n.id === nodeId);
        while (current?.parentId) {
          current = nodes.find(n => n.id === current!.parentId);
        }
        return current?.id || nodeId;
      };
      
      return getRootParent(node1.id) !== getRootParent(node2.id);
    });

    if (crossGroupCollisions.length === 0) return;

    // Group collisions by their root parents
    const rootParentCollisions = new Map<string, { conflicts: string[], minMoveDistance: number }>();
    
    crossGroupCollisions.forEach(({ node1, node2, yOverlap }) => {
      const getRootParent = (nodeId: string): string => {
        let current = nodes.find(n => n.id === nodeId);
        while (current?.parentId) {
          current = nodes.find(n => n.id === current!.parentId);
        }
        return current?.id || nodeId;
      };
      
      const root1 = getRootParent(node1.id);
      const root2 = getRootParent(node2.id);
      const lowerNode = node1.y > node2.y ? node1 : node2;
      const lowerRoot = getRootParent(lowerNode.id);
      const moveDistance = yOverlap + COLLISION_DETECTION_BUFFER;
      
      if (!rootParentCollisions.has(lowerRoot)) {
        rootParentCollisions.set(lowerRoot, { conflicts: [], minMoveDistance: 0 });
      }
      
      const existing = rootParentCollisions.get(lowerRoot)!;
      existing.conflicts.push(lowerRoot === root1 ? root2 : root1);
      existing.minMoveDistance = Math.max(existing.minMoveDistance, moveDistance);
    });

    // Find the common grandparent level where spacing needs adjustment
    rootParentCollisions.forEach(({ conflicts, minMoveDistance }, lowerRootId) => {
      const lowerRoot = nodes.find(n => n.id === lowerRootId);
      if (!lowerRoot) return;

      // Instead of moving the entire group, adjust parent-level spacing
      // Find if these root nodes are siblings under a common parent
      const rootNodes = nodes.filter(n => !n.parentId);
      
      if (rootNodes.length > 1) {
        // Sort root nodes by Y position
        const sortedRoots = rootNodes.sort((a, b) => a.y - b.y);
        const lowerRootIndex = sortedRoots.findIndex(n => n.id === lowerRootId);
        
        if (lowerRootIndex > 0) {
          // Calculate required spacing between root groups
          const currentRoot = sortedRoots[lowerRootIndex];
          const aboveRoots = sortedRoots.slice(0, lowerRootIndex);
          
          // Move the current root and all roots below it
          const moveDistance = minMoveDistance;
          for (let i = lowerRootIndex; i < sortedRoots.length; i++) {
            moveNodeGroup(sortedRoots[i].id, 0, moveDistance);
          }
        }
      }
    });
  }, [detectGlobalYCollisions, nodes, moveNodeGroup]);

  const triggerFullLayoutAdjustment = useCallback((fromNodeId: string) => {
    setTimeout(() => {
      recursiveParentAdjustment(fromNodeId);
      
      setTimeout(() => {
        detectAndResolveCollisions();
        
        setTimeout(() => {
          detectAndAdjustParentLevelSpacing();
          
          setTimeout(() => {
            const node = nodes.find(n => n.id === fromNodeId);
            if (node && node.parentId) {
              recursiveParentAdjustment(fromNodeId, 0);
            }
          }, 100);
        }, 200);
      }, 400);
    }, 100);
  }, [recursiveParentAdjustment, detectAndResolveCollisions, detectAndAdjustParentLevelSpacing, nodes]);

  return {
    textMeasureRef,
    measureTextWidth,
    getDescendants,
    moveNodeGroup,
    detectAndResolveCollisions,
    detectGlobalYCollisions,
    detectAndAdjustParentLevelSpacing,
    triggerParentHierarchyAdjustment,
    getOccupiedYRanges,
    findClearYSpace,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    adjustChildPositionsAfterParentChange,
    moveDescendants,
    calculateSubtreeBounds,
    calculateChildrenCenter,
    adjustParentToChildrenCenter,
    adjustSiblingSpacing,
    recursiveParentAdjustment,
    triggerFullLayoutAdjustment,
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
  adjustChildPositionsAfterParentChange: (parentId: string) => void,
  recursiveParentAdjustment: (nodeId: string) => void,
  triggerFullLayoutAdjustment: (fromNodeId: string) => void
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
              
      setTimeout(() => {
        triggerFullLayoutAdjustment(newNode.id);
      }, 150);
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
                  
        setTimeout(() => {
          triggerFullLayoutAdjustment(newNode.id);
        }, 150);
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
  
          const childLeftCenterX = child.x;
          const childLeftCenterY = child.y + NODE_HEIGHT / 2;
  
          const yDiff = childLeftCenterY - parentRightCenterY;
  
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