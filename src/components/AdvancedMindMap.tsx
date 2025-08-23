import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronRight, Download, Upload, Save, FolderOpen } from 'lucide-react';
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
const LEVEL_SPACING_X = 180; // レベル間の固定距離
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const EXPAND_BUTTON_SIZE = 20;

// エクスポート用のデータ型定義
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
  
  const [navigationMode, setNavigationMode] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextNodeId, setNextNodeId] = useState(2);

  // インポート・エクスポート用のref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 編集中のノードの一時的な幅を管理
  const [editingNodeWidth, setEditingNodeWidth] = useState<{ [nodeId: string]: number }>({});

  // 編集完了時の処理
  const handleEditingComplete = useCallback((nodeId: string) => {
    // 編集中の幅情報をクリア
    setEditingNodeWidth(prev => {
      const newState = { ...prev };
      delete newState[nodeId];
      return newState;
    });
  }, []);

  // ノードの幅を計算する関数
  const calculateNodeWidth = useCallback((content: string, isRoot = false) => {
    // 文字数に基づいて幅を計算（文字列の実際の長さに合わせる）
    const charWidth = isRoot ? 16 : 12;
    const padding = 16; // 左右のパディング（8px × 2）
    const minWidth = isRoot ? 60 : 40; // 最小幅（空文字対応）
    
    if (!content || content.trim() === '') {
      return minWidth;
    }
    
    return Math.max(minWidth, content.length * charWidth + padding);
  }, []);

  // 子ノードの位置を自動計算（バランス配置）
  const calculateBalancedChildPositions = useCallback((parentNode: Node, useFixedDistance = true): { x: number; y: number }[] => {
    const childCount = parentNode.children.length;
    if (childCount === 0) return [];

    // 固定距離を使用する場合は、親ノードの幅に関係なく一定の距離を保つ
    const baseX = useFixedDistance 
      ? parentNode.x + LEVEL_SPACING_X 
      : parentNode.x + NODE_SPACING_X;
    const positions: { x: number; y: number }[] = [];

    if (childCount === 1) {
      // 1つの場合：親ノードと同じ高さ
      positions.push({ x: baseX, y: parentNode.y });
    } else {
      // 複数の場合：上下にバランス良く配置
      const spacing = Math.max(60, NODE_SPACING_Y - (childCount - 2) * 10); // 動的間隔調整
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
    const positions = calculateBalancedChildPositions(parentNode, true);
    return positions[parentNode.children.length] || {
      x: parentNode.x + LEVEL_SPACING_X,
      y: parentNode.y,
    };
  }, [calculateBalancedChildPositions]);

  // 子ノードの兄弟位置を計算（下方向）
  const calculateSiblingPosition = useCallback((parentNode: Node, siblingIndex: number): { x: number; y: number } => {
    return {
      x: parentNode.x + LEVEL_SPACING_X,
      y: parentNode.y + NODE_SPACING_Y * (siblingIndex + 1),
    };
  }, []);

  // 子ノード作成（右方向）
  const createChildNode = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    // 新しい子ノードを含めた全体の位置を計算
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

    // 既存の子ノードとその子孫の位置を再バランス調整
    setTimeout(() => {
      const updatedParent = { ...parentNode, children: [...parentNode.children, nextNodeId.toString()] };
      const allPositions = calculateBalancedChildPositions(updatedParent, true);
      
      setNodes(prev => prev.map(node => {
        const childIndex = parentNode.children.indexOf(node.id);
        if (childIndex !== -1 && allPositions[childIndex]) {
          const oldY = node.y;
          const newY = allPositions[childIndex].y;
          const deltaY = newY - oldY;
          
          // 子ノード自体の位置を更新
          const updatedNode = {
            ...node,
            x: allPositions[childIndex].x,
            y: newY
          };
          
          // この子ノードの子孫も同じ量だけY方向に移動
          if (deltaY !== 0) {
            moveDescendantsVertically(node.id, deltaY);
          }
          
          return updatedNode;
        }
        return node;
      }));
    }, 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateChildPosition, rebalanceChildNodes, calculateNodeWidth]);

  // 兄弟ノード作成（親の子として追加）
  const createSiblingNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parentNode = nodes.find(n => n.id === node.parentId);
    if (!parentNode) return;

    // 現在のノードの親の子リスト内での位置を取得
    const currentNodeIndex = parentNode.children.indexOf(nodeId);
    if (currentNodeIndex === -1) return;

    // 新しいノードを現在のノードの直後に挿入
    const newChildren = [...parentNode.children];
    newChildren.splice(currentNodeIndex + 1, 0, nextNodeId.toString());

    // 新しい兄弟ノードを含めた全体の位置を計算
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
      
      // 親ノードの子リストに追加
      const parentIndex = updated.findIndex(n => n.id === node.parentId);
      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          children: newChildren,
        };
      }
      
      return [...updated, newNode];
    });

    // 既存の兄弟ノードとその子孫の位置を再バランス調整
    setTimeout(() => {
      const updatedParent = { ...parentNode, children: newChildren };
      const allPositions = calculateBalancedChildPositions(updatedParent, true);
      
      setNodes(prev => prev.map(n => {
        const childIndex = newChildren.indexOf(n.id);
        if (childIndex !== -1 && allPositions[childIndex]) {
          const oldY = n.y;
          const newY = allPositions[childIndex].y;
          const deltaY = newY - oldY;
          
          // 兄弟ノード自体の位置を更新
          const updatedNode = {
            ...n,
            x: allPositions[childIndex].x,
            y: newY
          };
          
          // この兄弟ノードの子孫も同じ量だけY方向に移動
          if (deltaY !== 0) {
            moveDescendantsVertically(n.id, deltaY);
          }
          
          return updatedNode;
        }
        return n;
      }));
    }, 0);

    setNextNodeId(prev => prev + 1);
  }, [nodes, nextNodeId, calculateSiblingPosition, rebalanceChildNodes, calculateNodeWidth]);

  // 子孫ノードを垂直方向に移動する関数
  const moveDescendantsVertically = useCallback((parentNodeId: string, deltaY: number) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode || parentNode.children.length === 0) return;

    setNodes(prev => prev.map(node => {
      // 直接の子ノードかチェック
      if (parentNode.children.includes(node.id)) {
        // 子ノードの位置を更新
        const updatedNode = {
          ...node,
          y: node.y + deltaY
        };
        
        // 再帰的に子孫ノードも移動
        if (node.children.length > 0) {
          moveDescendantsVertically(node.id, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes]);

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
      setTimeout(() => {
        const parentNode = nodes.find(n => n.id === parentId);
        if (parentNode && parentNode.children.length > 1) {
          // 削除後の子ノード配置を再計算
          const remainingChildren = parentNode.children.filter(childId => childId !== nodeId);
          const updatedParent = { ...parentNode, children: remainingChildren };
          const newPositions = calculateBalancedChildPositions(updatedParent, true);
          
          setNodes(prev => prev.map(node => {
            const childIndex = remainingChildren.indexOf(node.id);
            if (childIndex !== -1 && newPositions[childIndex]) {
              const oldY = node.y;
              const newY = newPositions[childIndex].y;
              const deltaY = newY - oldY;
              
              // 子ノード自体の位置を更新
              const updatedNode = {
                ...node,
                x: newPositions[childIndex].x,
                y: newY
              };
              
              // この子ノードの子孫も同じ量だけY方向に移動
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
  }, [nodes, rebalanceChildNodes, moveDescendantsVertically, calculateBalancedChildPositions]);

  // ノード内容更新
  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    const trimmedContent = content.trim();
    if (trimmedContent === '') {
      // 空の場合はノードを削除
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

    handleEditingComplete(nodeId);
  }, [deleteNode, calculateNodeWidth, handleEditingComplete]);

  // エクスポート機能
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

  // インポート機能
  const importMindMap = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData: ExportData = JSON.parse(content);
        
        // データの検証
        if (!importData.nodes || !Array.isArray(importData.nodes)) {
          alert('無効なファイル形式です。');
          return;
        }

        // ノードデータの復元
        const importedNodes = importData.nodes.map(node => ({
          ...node,
          isEditing: false,
          isSelected: false,
        }));

        // 最大IDを計算して次のIDを設定
        const maxId = Math.max(...importedNodes.map(n => parseInt(n.id) || 0));
        setNextNodeId(maxId + 1);

        // ノードを設定
        setNodes(importedNodes);
        
        // ビューをリセット
        setViewState({
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        });

        // ナビゲーションモードを終了
        setNavigationMode(false);

        alert(`マインドマップをインポートしました。\nノード数: ${importedNodes.length}`);
      } catch (error) {
        console.error('Import error:', error);
        alert('ファイルの読み込みに失敗しました。正しいJSON形式のファイルを選択してください。');
      }
    };
    
    reader.readAsText(file);
    
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // インポートファイル選択をトリガー
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 編集中のノード幅変化を処理
  const handleEditingWidthChange = useCallback((nodeId: string, newContent: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const isRoot = !node.parentId;
    const oldWidth = node.width || calculateNodeWidth(node.content, isRoot);
    const newWidth = calculateNodeWidth(newContent, isRoot);

    // 編集中の幅を更新
    setEditingNodeWidth(prev => ({
      ...prev,
      [nodeId]: newWidth
    }));

    // 固定距離レイアウトでは、親ノードの幅変化による子ノードの位置調整は不要
  }, [nodes, calculateNodeWidth]);

  // 子ノードの位置を調整する関数
  const adjustChildNodesPosition = useCallback((parentNodeId: string, oldWidth: number, newWidth: number) => {
    // 固定距離レイアウトでは、親ノードの幅変化による子ノードの位置調整は不要
    // 子ノードは常に親ノードから固定距離（LEVEL_SPACING_X）に配置される
    return;
  }, []);

  // ノード編集開始
  const startNodeEditing = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => ({
      ...node,
      isEditing: node.id === nodeId,
      isSelected: node.id === nodeId,
    })));
  }, []);

  // 編集キャンセル
  const cancelEditing = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.content.trim() === '') {
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
    
    // 固定距離の中間点に展開ボタンを配置
    const buttonDistance = LEVEL_SPACING_X / 2;
    
    return {
      x: node.x + buttonDistance, // 親ノードと子ノードの中間点
      y: node.y,
    };
  }, []);

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

        const isRoot = !node.parentId;
        const nodeWidth = node.width || calculateNodeWidth(node.content, isRoot);
        
        // 親ノード（矩形）の右端中央の座標を正確に計算
        const NODE_HEIGHT = 40; // ノードの高さ
        const parentRightCenterX = node.x + nodeWidth; // 右端のX座標
        const parentRightCenterY = node.y; // 中央のY座標（ノードの中心）
        
        const expandButtonX = expandButtonPos.x;
        const expandButtonY = expandButtonPos.y;

        // 親ノードの右端中央から展開ボタンへの直線
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

        // 展開ボタンから各子ノードへの接続線
        for (let i = 0; i < node.children.length; i++) {
          const childId = node.children[i];
          const child = visibleNodes.find(n => n.id === childId);
          if (child) {
            // 子ノード（矩形）の左端中央の座標を正確に計算
            const childLeftCenterX = child.x; // 左端のX座標
            const childLeftCenterY = child.y; // 中央のY座標（ノードの中心）
            
            if (node.children.length === 1) {
              // 子ノードが1つの場合は直線
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
              // 複数の子ノードの場合は曲線
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

  // 接続線を更新
  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections]);

  // 2つのノード間の距離を計算
  const getDistance = useCallback((node1: Node, node2: Node): number => {
    return Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2));
  }, []);

  // 指定方向の最も近いノードを見つける関数
  const findNearestNode = useCallback((currentNode: Node, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
    const visibleNodes = getVisibleNodes().filter(n => n.id !== currentNode.id);
    if (visibleNodes.length === 0) return null;
    
    let candidates: Node[] = [];
    
    switch (direction) {
      case 'up':
        candidates = visibleNodes.filter(n => n.y < currentNode.y - 10); // 10px以上上にあるノード
        break;
      case 'down':
        candidates = visibleNodes.filter(n => n.y > currentNode.y + 10); // 10px以上下にあるノード
        break;
      case 'left':
        candidates = visibleNodes.filter(n => n.x < currentNode.x - 10); // 10px以上左にあるノード
        break;
      case 'right':
        candidates = visibleNodes.filter(n => n.x > currentNode.x + 10); // 10px以上右にあるノード
        break;
    }
    
    if (candidates.length === 0) return null;
    
    // 最も近いノードを見つける
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

  // マウスイベント処理
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // 個別ノードのドラッグは無効化し、キャンバス全体のドラッグのみ有効
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
      // ノードクリック時は選択のみ行う
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

    // キャンバス全体のドラッグのみ処理
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
    // 編集中の場合は通常のキーボード操作を優先
    const editingNode = nodes.find(n => n.isEditing);
    if (editingNode && e.key !== 'Escape') {
      return;
    }

    if (e.key === 'Escape') {
      if (editingNode) {
        cancelEditing(editingNode.id);
        return;
      }
      
      // ナビゲーションモードを切り替え
      setNavigationMode(prev => !prev);
      
      // ナビゲーションモードに入る時、選択されたノードがない場合は最初のノードを選択
      if (!navigationMode && nodes.length > 0) {
        const selectedNode = nodes.find(n => n.isSelected);
        if (!selectedNode) {
          selectNode(nodes[0].id);
        }
      }
      return;
    }
    
    // ナビゲーションモード時のカーソルキー操作
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
          // Enterキーで編集モードに入る
          startNodeEditing(selectedNode.id);
          setNavigationMode(false);
          return;
        case 'Delete':
        case 'Backspace':
          // DeleteキーまたはBackspaceキーでノードを削除
          if (selectedNode.parentId) { // ルートノード以外のみ削除可能
            // 削除前に次に選択するノードを決定
            const nextNodeId = findNearestNode(selectedNode, 'up') || 
                              findNearestNode(selectedNode, 'down') || 
                              findNearestNode(selectedNode, 'left') || 
                              findNearestNode(selectedNode, 'right') ||
                              selectedNode.parentId; // 最後の手段として親ノードを選択
            
            deleteNode(selectedNode.id);
            
            // 削除後に次のノードを選択
            if (nextNodeId) {
              setTimeout(() => {
                selectNode(nextNodeId);
              }, 0);
            }
          }
          return;
        case 'r':
        case 'R':
          // Rキーで右に子ノードを追加
          createChildNode(selectedNode.id);
          setNavigationMode(false); // 編集モードに移行するためナビゲーションモードを終了
          return;
        case 'd':
        case 'D':
          // Dキーで下に兄弟ノードを追加（親ノードがある場合のみ）
          if (selectedNode.parentId) {
            createSiblingNode(selectedNode.id);
            setNavigationMode(false); // 編集モードに移行するためナビゲーションモードを終了
          }
          return;
      }
      
      if (targetNodeId) {
        selectNode(targetNodeId);
      }
    }
  }, [nodes, navigationMode, cancelEditing, selectNode, startNodeEditing, findNearestNode, deleteNode]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const visibleNodes = getVisibleNodes();

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* 言語切り替え */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        {/* インポート・エクスポートボタン */}
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/50 px-3 py-2">
          <button
            onClick={triggerImport}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="マインドマップをインポート"
          >
            <Upload className="w-4 h-4" />
            <span>インポート</span>
          </button>
          <div className="w-px h-4 bg-gray-300"></div>
          <button
            onClick={exportMindMap}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="マインドマップをエクスポート"
          >
            <Download className="w-4 h-4" />
            <span>エクスポート</span>
          </button>
        </div>
        <LanguageSwitcher variant="compact" />
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importMindMap}
        className="hidden"
      />
      
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
              {/* ノード本体 */}
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
                  {/* 選択時の枠線 */}
                  {node.isSelected && (
                    <div className={`absolute -inset-2 border-2 rounded-lg pointer-events-none ${
                      navigationMode 
                        ? 'border-blue-600 bg-blue-100/50 shadow-lg' 
                        : 'border-blue-500 bg-blue-50/20'
                    }`} />
                  )}

                  {/* ノードテキスト */}
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
      
      {/* ナビゲーションモード表示 */}
      {navigationMode && (
        <div className="absolute top-20 right-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-sm">
          {/* ヘッダー */}
          <div className="px-4 py-3 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
              <span className="text-lg font-bold tracking-wide">ナビゲーションモード</span>
            </div>
          </div>
          
          {/* 操作説明 */}
          <div className="px-4 py-3 space-y-3">
            {/* 移動操作 */}
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
            
            {/* 追加操作 */}
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
            
            {/* 削除・終了操作 */}
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

      {/* ズーム表示 */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>
    </div>
  );
};