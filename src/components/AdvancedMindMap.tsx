import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
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

const NODE_SPACING_X = 200;
const NODE_SPACING_Y = 80;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const EXPAND_BUTTON_SIZE = 20;

export const AdvancedMindMap: React.FC = () => {
  const { t } = useTranslation();
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextNodeId, setNextNodeId] = useState(2);

  // ノードの幅を計算する関数
  const calculateNodeWidth = useCallback((content: string) => {
    // 文字数に基づいて幅を計算（最小80px、最大300px）
    const baseWidth = 80;
    const charWidth = 12;
    return Math.min(Math.max(baseWidth, content.length * charWidth), 300);
  }, []);

  // 子ノードの位置を自動計算（バランス配置）
  const calculateBalancedChildPositions = useCallback((parentNode: Node): { x: number; y: number }[] => {
    const childCount = parentNode.children.length;
    if (childCount === 0) return [];

    const baseX = parentNode.x + NODE_SPACING_X;
    const positions: { x: number; y: number }[] = [];

    if (childCount === 1) {
      // 1つの場合：親ノードと同じ高さ
      positions.push({ x: baseX, y: parentNode.y });
    } else {
      // 複数の場合：上下にバランス良く配置
      const totalHeight = (childCount - 1) * NODE_SPACING_Y;
      const startY = parentNode.y - totalHeight / 2;

      for (let i = 0; i < childCount; i++) {
        positions.push({
          x: baseX,
          y: startY + i * NODE_SPACING_Y
        });
      }
    }

    return positions;
  }, []);

  // 子ノードの位置を再計算して更新
  const rebalanceChildNodes = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode || parentNode.children.length === 0) return;

    const newPositions = calculateBalancedChildPositions(parentNode);
    
    setNodes(prev => prev.map(node => {
      const childIndex = parentNode.children.indexOf(node.id);
      if (childIndex !== -1 && newPositions[childIndex]) {
        return {
          ...node,
          x: newPositions[childIndex].x,
          y: newPositions[childIndex].y
        };
      }
      return node;
    }));
  }, [nodes, calculateBalancedChildPositions]);

  // 子ノードの位置を計算（右方向）
  const calculateChildPosition = useCallback((parentNode: Node): { x: number; y: number } => {
    const positions = calculateBalancedChildPositions(parentNode);
    return positions[parentNode.children.length] || {
      x: parentNode.x + NODE_SPACING_X,
      y: parentNode.y,
    };
  }, [calculateBalancedChildPositions]);

  // 子ノードの兄弟位置を計算（下方向）
  const calculateSiblingPosition = useCallback((parentNode: Node, siblingIndex: number): { x: number; y: number } => {
    return {
      x: parentNode.x + NODE_SPACING_X,
      y: parentNode.y + NODE_SPACING_Y * (siblingIndex + 1),
    };
  }, []);

  // 子ノード作成（右方向）
  const createChildNode = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const childCount = parentNode.children.length;
    const position = childCount === 0 
      ? calculateChildPosition(parentNode)
      : calculateSiblingPosition(parentNode, childCount);
    
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
      width: calculateNodeWidth(''),
    };

    setNodes(prev => {
      const updated = prev.map(node => ({
        ...node,
        isSelected: node.id === newNode.id,
        isEditing: false,
      }));
      
      // 親ノードの子リストに追加
      const parentIndex = updated.findIndex(n => n.id === parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: [...updated[parentIndex].children, newNode.id],
        };
      }
      
      return [...updated, newNode];
    });

    // 子ノードの位置を再バランス
    setTimeout(() => rebalanceChildNodes(parentId), 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateChildPosition, rebalanceChildNodes, calculateNodeWidth]);

  // 兄弟ノード作成（親の子として追加）
  const createSiblingNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parentNode = nodes.find(n => n.id === node.parentId);
    if (!parentNode) return;

    const siblingIndex = parentNode.children.length;
    const position = calculateSiblingPosition(parentNode, siblingIndex);
    
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
      
      // 親ノードの子リストに追加
      const parentIndex = updated.findIndex(n => n.id === node.parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: [...updated[parentIndex].children, newNode.id],
        };
      }
      
      return [...updated, newNode];
    });

    // 子ノードの位置を再バランス
    setTimeout(() => rebalanceChildNodes(node.parentId!), 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateSiblingPosition, rebalanceChildNodes, calculateNodeWidth]);

  // ノード削除
  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const parentId = nodeToDelete?.parentId;

    setNodes(prev => {
      const node = prev.find(n => n.id === nodeId);
      if (!node) return prev;

      // 親から削除
      const updated = prev.map(node => {
        if (node.children.includes(nodeId)) {
          return {
            ...node,
            children: node.children.filter(childId => childId !== nodeId),
          };
        }
        return node;
      });

      // ノードとその子孫を削除
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

    // 親ノードの子ノードを再バランス
    if (parentId) {
      setTimeout(() => rebalanceChildNodes(parentId), 0);
    }
  }, [nodes, rebalanceChildNodes]);

  // ノード内容更新
  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    if (content.trim() === '') {
      // 空の場合はノードを削除
      deleteNode(nodeId);
      return;
    }

    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          content: content.trim(),
          isEditing: false,
          width: calculateNodeWidth(content.trim()),
        };
      }
      return node;
    }));
  }, [deleteNode, calculateNodeWidth]);

  // 編集キャンセル
  const cancelEditing = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && (node.content === '' || node.content === 'New Node')) {
      // 内容が空の場合はノードを削除
      deleteNode(nodeId);
    } else {
      setNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, isEditing: false } : n
      ));
    }
  }, [nodes, deleteNode]);

  // ノード選択
  const selectNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isSelected: node.id === nodeId,
      isEditing: false,
    })));
  }, []);

  // 兄弟ノードの表示・非表示切り替え
  const toggleChildrenVisibility = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isCollapsed: !node.isCollapsed }
        : node
    ));
  }, []);

  // 表示すべきノードをフィルタリング
  const getVisibleNodes = useCallback(() => {
    const visibleNodes: Node[] = [];
    const processedNodes = new Set<string>();

    const processNode = (node: Node) => {
      if (processedNodes.has(node.id)) return;
      processedNodes.add(node.id);
      
      visibleNodes.push(node);

      // 子ノードを処理（折りたたまれていない場合のみ）
      if (!node.isCollapsed) {
        node.children.forEach(childId => {
          const childNode = nodes.find(n => n.id === childId);
          if (childNode) {
            processNode(childNode);
          }
        });
      }
    };

    // ルートノードから開始
    const rootNodes = nodes.filter(n => !n.parentId);
    rootNodes.forEach(processNode);

    return visibleNodes;
  }, [nodes]);

  // 折りたたみボタンの位置を計算
  const getExpandButtonPosition = useCallback((node: Node) => {
    if (node.children.length === 0) return null;
    
    const nodeWidth = node.width || calculateNodeWidth(node.content);
    
    return {
      x: node.x + nodeWidth + 30, // ノードの右側に30px離して配置
      y: node.y,
    };
  }, [calculateNodeWidth]);

  // 展開ボタンを表示すべきかチェック
  const shouldShowExpandButton = useCallback((node: Node) => {
    return node.children.length > 0;
  }, []);

  // 接続線を計算
  const calculateConnections = useCallback((): Connection[] => {
    const visibleNodes = getVisibleNodes();
    const newConnections: Connection[] = [];
    
    visibleNodes.forEach(node => {
      if (node.children.length > 0 && !node.isCollapsed) {
        const expandButtonPos = getExpandButtonPosition(node);
        if (!expandButtonPos) return;

        const nodeWidth = node.width || calculateNodeWidth(node.content);
        const expandButtonX = expandButtonPos.x;
        const expandButtonY = expandButtonPos.y;

        // 親ノードから展開ボタンへの線
        newConnections.push({
          id: `${node.id}-expand`,
          fromNodeId: node.id,
          toNodeId: 'expand',
          fromX: node.x + nodeWidth,
          fromY: node.y,
          toX: expandButtonX - EXPAND_BUTTON_SIZE / 2,
          toY: expandButtonY,
          type: 'child',
        });

        // 展開されている場合のみ子ノードへの接続線を描画
        if (!node.isCollapsed) {
          for (let i = 0; i < node.children.length; i++) {
            const childId = node.children[i];
            const child = visibleNodes.find(n => n.id === childId);
            if (child) {
              if (node.children.length === 1) {
                // 子ノードが1つの場合は直線
                newConnections.push({
                  id: `expand-${child.id}`,
                  fromNodeId: 'expand',
                  toNodeId: child.id,
                  fromX: expandButtonX + EXPAND_BUTTON_SIZE / 2,
                  fromY: expandButtonY,
                  toX: child.x,
                  toY: child.y,
                  type: 'child',
                });
              } else {
                // 複数の子ノードの場合は曲線
                const controlX = expandButtonX + 60;
                const controlY = expandButtonY + (child.y - expandButtonY) * 0.3;
                newConnections.push({
                  id: `expand-${child.id}`,
                  fromNodeId: 'expand',
                  toNodeId: child.id,
                  fromX: expandButtonX + EXPAND_BUTTON_SIZE / 2,
                  fromY: expandButtonY,
                  toX: child.x,
                  toY: child.y,
                  type: 'sibling',
                  controlX: controlX,
                  controlY: controlY,
                });
              }
            }
          }
        }
      }
    });
    
    return newConnections;
  }, [nodes, getVisibleNodes, getExpandButtonPosition, calculateNodeWidth]);

  // 接続線を更新
  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections]);

  // マウスイベント処理
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

  // ホイールイベント（ズーム）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta)),
    }));
  }, []);

  // キーボードイベント
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // 編集中のノードをキャンセル
      const editingNode = nodes.find(n => n.isEditing);
      if (editingNode) {
        cancelEditing(editingNode.id);
      }
    }
  }, [nodes, cancelEditing]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const visibleNodes = getVisibleNodes();

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
                strokeWidth="2.5"
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
              {/* ノード本体 */}
              <div
                className={`absolute transition-all duration-300 group cursor-pointer ${
                  node.isSelected 
                    ? 'text-blue-600' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  minWidth: node.width || calculateNodeWidth(node.content),
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
              >
                {/* 選択時の枠線 */}
                {node.isSelected && (
                  <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg bg-blue-50/20 pointer-events-none" />
                )}

                {/* ノードテキスト */}
                {node.isEditing ? (
                  <input
                    type="text"
                    defaultValue={node.content === 'New Node' ? '' : node.content}
                    className="bg-transparent border-b-2 border-blue-500 outline-none text-xl font-medium min-w-[100px] px-1"
                    autoFocus
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
                  <span className="text-xl font-medium px-1 py-1 rounded transition-colors">
                    {node.content}
                  </span>
                )}

                {/* 選択時のみ表示される削除ボタン */}
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

                {/* 子ノード追加ボタン（右） */}
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

                {/* 兄弟ノード追加ボタン（下） */}
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

              {/* 展開・折りたたみボタン */}
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

      {/* 操作説明 */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">操作方法</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• ノードをクリックして選択</p>
          <p>• ホバーで青い+ボタン: 子ノード追加（右方向）</p>
          <p>• ホバーで緑の+ボタン: 兄弟ノード追加（下方向）</p>
          <p>• ⚪︎ボタン: 子ノードの表示・非表示</p>
          <p>• 選択時に削除ボタン表示</p>
          <p>• ESCキー: 編集キャンセル（空の場合は削除）</p>
        </div>
      </div>

      {/* ズーム表示 */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>
    </div>
  );
};