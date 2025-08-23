import React, { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMindMapStore } from '../stores/mindMapStore';
import { useTranslation } from '../hooks/useTranslation';
import { MIN_SCALE, MAX_SCALE } from './mindmap/constants';
import { 
  useMindMapState,
  useMindMapLogic,
  useMindMapActions,
  useMindMapUtils,
  useMindMapImportExport
} from './mindmap/hooks';
import { 
  Toolbar,
  Sidebar,
  NodeComponent,
  Connections,
  ExpandButton,
  NavigationModeDisplay,
  AICommandInput,
  FloatingActionButton,
  ZoomDisplay
} from './mindmap/components';

export const MindMapCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentMap, hasUnsavedChanges } = useMindMapStore();
  
  const {
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
  } = useMindMapState();

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateNodeWidth = useCallback((content: string, isRoot = false) => {
    const padding = 24;
    const minWidth = isRoot ? 80 : 60;
    
    if (!content || content.trim() === '') {
      return minWidth;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = isRoot ? 'bold 24px sans-serif' : '500 18px sans-serif';
      const textWidth = context.measureText(content).width;
      return Math.max(minWidth, textWidth + padding);
    }
    
    return minWidth;
  }, []);

  const {
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
    calculateChildrenCenter,
    adjustParentToChildrenCenter,
    adjustSiblingSpacing,
    recursiveParentAdjustment,
    triggerFullLayoutAdjustment,
  } = useMindMapLogic(
    nodes,
    setNodes,
    calculateNodeWidth
  );

  const {
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
  } = useMindMapActions(
    nodes,
    setNodes,
    nextNodeId,
    setNextNodeId,
    editingContent,
    setEditingContent,
    calculateNodeWidth,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    detectAndResolveCollisions,
    adjustChildPositionsAfterParentChange,
    recursiveParentAdjustment,
    triggerFullLayoutAdjustment
  );

  const {
    getVisibleNodes,
    getExpandButtonPosition,
    shouldShowExpandButton,
    calculateConnections,
    getDistance,
    findNearestNode,
  } = useMindMapUtils(nodes, calculateNodeWidth);

  const {
    exportMindMap,
    importMindMap,
  } = useMindMapImportExport(
    nodes,
    setNodes,
    setNextNodeId,
    setViewState,
    setNavigationMode,
    setEditingContent,
    calculateNodeWidth
  );

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
  }, [nodes, viewState, selectNode, setDragState]);

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
  }, [dragState, viewState.scale, setViewState]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, [setDragState]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta)),
    }));
  }, [setViewState]);

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
        case ' ':
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
        case 'Tab':
          e.preventDefault();
          createChildNode(selectedNode.id);
          setNavigationMode(false);
          return;
        case 'Enter':
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
  }, [nodes, navigationMode, cancelEditing, selectNode, startNodeEditing, findNearestNode, deleteNode, createChildNode, createSiblingNode, showAICommand, setShowAICommand, setAIPrompt, setNavigationMode]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, handleWheel]);

  const handleAICommand = useCallback(async () => {
    if (!aiPrompt.startsWith('/ai ')) return;
    
    const prompt = aiPrompt.substring(4);
    setShowAICommand(false);
    setAIPrompt('');
    
    const selectedNode = nodes.find(n => n.isSelected) || nodes[0];
    if (selectedNode) {
      createChildNode(selectedNode.id);
      
      setTimeout(() => {
        const newNode = nodes.find(n => n.isEditing);
        if (newNode) {
          updateNodeContent(newNode.id, `AI: ${prompt}`);
        }
      }, 100);
    }
  }, [aiPrompt, nodes, createChildNode, updateNodeContent, setShowAICommand, setAIPrompt]);

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

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

  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections, setConnections]);

  useEffect(() => {
    setNodes(prev => prev.map(node => ({
      ...node,
      width: calculateNodeWidth(node.content, !node.parentId)
    })));
  }, [calculateNodeWidth, setNodes]);

  const visibleNodes = getVisibleNodes();
  

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <span
        ref={textMeasureRef}
        className="absolute -top-1000 left-0 opacity-0 pointer-events-none whitespace-nowrap"
        style={{ fontFamily: 'inherit' }}
      />
      
      <Toolbar
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        triggerImport={triggerImport}
        exportMindMap={exportMindMap}
        handleBackToDashboard={handleBackToDashboard}
        currentMapName={currentMap?.name}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importMindMap}
        className="hidden"
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarVisible && (
          <Sidebar currentMapId={currentMap?.id} />
        )}

        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
                transformOrigin: '0 0',
                minWidth: '5000px',
                minHeight: '5000px',
                overflow: 'visible',
              }}
            >
              <Connections connections={connections} />
            </svg>

            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
                transformOrigin: '0 0',
              }}
            >
              {visibleNodes.map(node => {
                const currentContent = node.isEditing ? (editingContent[node.id] || '') : node.content;
                const currentWidth = node.width || calculateNodeWidth(currentContent, !node.parentId);
                
                return (
                  <div key={node.id}>
                    <NodeComponent
                      node={node}
                      currentContent={currentContent}
                      currentWidth={currentWidth}
                      navigationMode={navigationMode}
                      dragState={dragState}
                      editingContent={editingContent}
                      onSelectNode={selectNode}
                      onStartNodeEditing={startNodeEditing}
                      onHandleEditingContentChange={handleEditingContentChange}
                      onUpdateNodeContent={updateNodeContent}
                      onCancelEditing={cancelEditing}
                      onDeleteNode={deleteNode}
                      onCreateChildNode={createChildNode}
                      onCreateSiblingNode={createSiblingNode}
                      onSetNavigationMode={setNavigationMode}
                    />
                    
                    <ExpandButton
                      node={node}
                      getExpandButtonPosition={getExpandButtonPosition}
                      shouldShowExpandButton={shouldShowExpandButton}
                      onToggleChildrenVisibility={toggleChildrenVisibility}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <NavigationModeDisplay navigationMode={navigationMode} />

      <AICommandInput
        showAICommand={showAICommand}
        aiPrompt={aiPrompt}
        setAIPrompt={setAIPrompt}
        onHandleAICommand={handleAICommand}
        onClose={() => {
          setShowAICommand(false);
          setAIPrompt('');
        }}
      />

      <FloatingActionButton onShowAICommand={() => setShowAICommand(true)} />

      <ZoomDisplay scale={viewState.scale} />
    </div>
  );
};