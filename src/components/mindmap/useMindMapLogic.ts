import { useCallback, useRef} from 'react';
import { Node } from './types';
import { 
  NODE_SPACING_X, 
} from './constants';


// ==============================================
// マインドマップのレイアウト・配置ロジック
// ==============================================
export const useMindMapLogic = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  calculateNodeWidth: (content: string, isRoot?: boolean) => number
) => {
  // テキスト幅測定用のref
  const textMeasureRef = useRef<HTMLSpanElement>(null);


  // 指定ノードの全子孫ノードを取得
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

  // 指定ノードとその全子孫を縦方向に移動
  const moveNodeAndDescendantsVertically = useCallback((nodeId: string, deltaY: number) => {
    if (deltaY === 0) return;
    
    const descendants = getDescendants(nodeId);
    const affectedNodeIds = [nodeId, ...descendants.map(n => n.id)];

    setNodes(prev => prev.map(node => {
      if (affectedNodeIds.includes(node.id)) {
        return {
          ...node,
          y: node.y + deltaY
        };
      }
      return node;
    }));
  }, [getDescendants, setNodes]);


  // 階層的Y軸調整（δ1を事前計算済みの場合に使用）
  const applyHierarchicalYAdjustment = useCallback((parentId: string, upwardExpansion: number, downwardExpansion: number) => {
    // 全ての移動対象ノードとその移動量を収集
    const nodesToMove: { nodeId: string; deltaY: number }[] = [];
    
    // 階層を上に向かって辿り、移動対象を収集
    const collectAdjustments = (currentParentId: string, upDelta: number, downDelta: number) => {
      const currentParent = nodes.find(n => n.id === currentParentId);
      if (!currentParent || !currentParent.parentId) return;
      if (upDelta === 0 && downDelta === 0) return;

      const grandParent = nodes.find(n => n.id === currentParent.parentId);
      if (!grandParent) return;

      // 現在の親ノードの兄弟グループを取得
      const parentSiblings = grandParent.children
        .map(childId => nodes.find(n => n.id === childId))
        .filter((node): node is Node => !!node)
        .sort((a, b) => a.y - b.y);

      const currentParentIndex = parentSiblings.findIndex(n => n.id === currentParentId);
      if (currentParentIndex === -1) return;

      // 上の兄弟を上に移動（上方向拡張分だけ）
      if (upDelta > 0) {
        for (let i = 0; i < currentParentIndex; i++) {
          nodesToMove.push({ nodeId: parentSiblings[i].id, deltaY: -upDelta });
        }
      }

      // 下の兄弟を下に移動（下方向拡張分だけ）
      if (downDelta > 0) {
        for (let i = currentParentIndex + 1; i < parentSiblings.length; i++) {
          nodesToMove.push({ nodeId: parentSiblings[i].id, deltaY: downDelta });
        }
      }

      // さらに上の階層に伝播
      collectAdjustments(currentParent.parentId, upDelta, downDelta);
    };

    // 移動対象を収集
    collectAdjustments(parentId, upwardExpansion, downwardExpansion);
    
    // 収集した全ての移動を一括で適用
    if (nodesToMove.length > 0) {
      // 各ノードの全子孫を取得して移動対象に追加
      const allNodesToMove: { nodeId: string; deltaY: number }[] = [];
      
      nodesToMove.forEach(({ nodeId, deltaY }) => {
        const descendants = getDescendants(nodeId);
        allNodesToMove.push({ nodeId, deltaY });
        descendants.forEach(desc => {
          allNodesToMove.push({ nodeId: desc.id, deltaY });
        });
      });
      
      console.log(`Moving ${allNodesToMove.length} nodes (including descendants)`);
      
      // 一括でY座標を更新
      setNodes(prev => prev.map(node => {
        const moveInstruction = allNodesToMove.find(m => m.nodeId === node.id);
        if (moveInstruction) {
          return {
            ...node,
            y: node.y + moveInstruction.deltaY
          };
        }
        return node;
      }));
    }
  }, [nodes, getDescendants, setNodes]);


  // 親ノードに対する子ノードのバランスの良い配置を計算
  const calculateBalancedChildPositions = useCallback((parentNode: Node, useFixedDistance = true): { x: number; y: number }[] => {
    const childCount = parentNode.children.length;
    if (childCount === 0) return [];

    const parentWidth = parentNode.width || calculateNodeWidth(parentNode.content, !parentNode.parentId);
    
    // 子ノードのX座標（親の右側 + 60px）
    const baseX = useFixedDistance 
      ? parentNode.x + parentWidth + 60
      : parentNode.x + NODE_SPACING_X;
    
    const positions: { x: number; y: number }[] = [];

    if (childCount === 1) {
      // 子が1つなら親と同じ高さ
      positions.push({ x: baseX, y: parentNode.y });
    } else {
      // 複数の子ノードを親のY座標を中心に均等配置
      const spacing = 60; // 固定間隔
      const totalHeight = (childCount - 1) * spacing;
      const startY = parentNode.y - totalHeight / 2;

      // 各子ノードの位置を計算
      for (let i = 0; i < childCount; i++) {
        positions.push({
          x: baseX,
          y: startY + i * spacing
        });
      }
    }

    return positions;
  }, [calculateNodeWidth]);

  // 子孫ノードを縦方向に移動
  const moveDescendantsVertically = useCallback((parentNodeId: string, deltaY: number) => {
    if (deltaY === 0) return;
    
    const descendants = getDescendants(parentNodeId);
    if (descendants.length === 0) return;

    setNodes(prev => prev.map(node => {
      if (descendants.some(desc => desc.id === node.id)) {
        return {
          ...node,
          y: node.y + deltaY
        };
      }
      return node;
    }));
  }, [nodes, getDescendants, setNodes]);

  // 親ノード変更後の子ノード位置調整
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
        
        // 子孫も一緒に移動
        if (deltaX !== 0 || deltaY !== 0) {
          moveDescendants(node.id, deltaX, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes, calculateBalancedChildPositions, setNodes]);

  // 子孫ノードを移動（X、Y両方向）
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
        
        // 再帰的に子孫も移動
        if (node.children.length > 0) {
          moveDescendants(node.id, deltaX, deltaY);
        }
        
        return updatedNode;
      }
      return node;
    }));
  }, [nodes, setNodes]);


  const triggerFullLayoutAdjustment = useCallback(() => {
  }, []);

  return {
    textMeasureRef,
    getDescendants,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    moveNodeAndDescendantsVertically,
    applyHierarchicalYAdjustment,
    adjustChildPositionsAfterParentChange,
    triggerFullLayoutAdjustment,
  };
};
