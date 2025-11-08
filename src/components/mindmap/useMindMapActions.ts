import { useCallback } from "react";
import { Node } from "./types";

export const useMindMapActions = (
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  nextNodeId: number,
  setNextNodeId: React.Dispatch<React.SetStateAction<number>>,
  editingContent: { [nodeId: string]: string },
  setEditingContent: React.Dispatch<
    React.SetStateAction<{ [nodeId: string]: string }>
  >,
  calculateNodeWidth: (content: string, isRoot?: boolean) => number,
  getDescendants: (nodeId: string) => Node[],
  calculateBalancedChildPositions: (
    parentNode: Node,
    useFixedDistance?: boolean,
  ) => { x: number; y: number }[],
  moveDescendantsVertically: (parentNodeId: string, deltaY: number) => void,
  applyHierarchicalYAdjustment: (
    parentId: string,
    upwardExpansion: number,
    downwardExpansion: number,
  ) => void,
  adjustChildPositionsAfterParentChange: (parentId: string) => void,
  triggerFullLayoutAdjustment: () => void,
) => {
  /**
   * ノードの幅を更新し、必要に応じて子ノードの位置も調整
   */
  const updateNodeWidth = useCallback(
    (nodeId: string, content: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const isRoot = !node.parentId; // ルートノードかどうか判定
      const oldWidth = node.width || 0;
      const newWidth = calculateNodeWidth(content, isRoot);

      // ノードの幅を更新
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, width: newWidth } : n)),
      );

      // 幅の変化が大きい場合、子ノードの位置を調整
      if (node.children.length > 0 && Math.abs(newWidth - oldWidth) > 5) {
        setTimeout(() => {
          adjustChildPositionsAfterParentChange(nodeId);
        }, 0);
      }
    },
    [
      nodes,
      calculateNodeWidth,
      adjustChildPositionsAfterParentChange,
      setNodes,
    ],
  );

  // ==============================================
  // 子ノードを作成する
  // ==============================================
  const createChildNode = useCallback(
    (parentId: string) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      const tempUpdatedParent = {
        ...parentNode,
        children: [...parentNode.children, nextNodeId.toString()],
      };

      const newPositions = calculateBalancedChildPositions(
        tempUpdatedParent,
        true,
      );
      const position = newPositions[parentNode.children.length]; // 新しい子の位置

      // 新しいノードのオブジェクトを作成
      const newNode: Node = {
        id: nextNodeId.toString(),
        x: position.x,
        y: position.y,
        content: "",
        parentId,
        children: [],
        isEditing: true, // 作成直後は編集モード
        isSelected: true, // 作成直後は選択状態
        isCollapsed: false,
        level: parentNode.level + 1,
        width: calculateNodeWidth("", false),
      };

      // 全ノードの選択状態をリセットし、新ノードを追加
      setNodes((prev) => {
        const updated = prev.map((node) => ({
          ...node,
          isSelected: node.id === newNode.id,
          isEditing: false,
        }));

        // 親ノードに新しい子を追加
        const parentIndex = updated.findIndex((n) => n.id === parentId);
        if (parentIndex !== -1) {
          updated[parentIndex] = {
            ...updated[parentIndex],
            children: [...updated[parentIndex].children, newNode.id],
          };
        }

        return [...updated, newNode];
      });

      // 編集内容を初期化
      setEditingContent((prev) => ({
        ...prev,
        [newNode.id]: "",
      }));

      // 非同期で全ての子ノードの位置を再計算
      setTimeout(() => {
        const newChildren = [...parentNode.children, newNode.id];
        const finalUpdatedParent = { ...parentNode, children: newChildren };
        const allPositions = calculateBalancedChildPositions(
          finalUpdatedParent,
          true,
        );

        // 全ての子ノードの位置を更新
        setNodes((prev) =>
          prev.map((n) => {
            const childIndex = newChildren.indexOf(n.id);
            if (childIndex !== -1 && allPositions[childIndex]) {
              const newPos = allPositions[childIndex];
              const deltaY = newPos.y - n.y;

              // Y座標が変わった場合、子孫ノードも移動
              if (deltaY !== 0) {
                moveDescendantsVertically(n.id, deltaY);
              }

              return {
                ...n,
                x: newPos.x,
                y: newPos.y,
              };
            }
            return n;
          }),
        );

        // 全体のレイアウト調整をトリガー
        setTimeout(() => {
          triggerFullLayoutAdjustment();
        }, 150);
      }, 0);

      setNextNodeId((prev) => prev + 1); // 次のノードIDを更新
    },
    [
      nodes,
      nextNodeId,
      calculateBalancedChildPositions,
      calculateNodeWidth,
      moveDescendantsVertically,
      setNodes,
      setEditingContent,
      setNextNodeId,
    ],
  );

  // ==============================================
  // 兄弟ノードを作成する
  // ==============================================
  /**
   * 兄弟に子孫がいない場合の兄弟作成の処理
   */
  const handleSiblingCreationWithoutDescendants = useCallback(
    (tempUpdatedParent: Node, newChildren: string[], parentNode: Node) => {
      // 親の中心Yを基準としてノードを均等に並べ替えます（Y=0）。
      const allPositions = calculateBalancedChildPositions(
        tempUpdatedParent,
        true,
      );
      const parentCenterY = parentNode.y + 20;

      // 膨張量（δ1）を計算する
      const originalSiblings = parentNode.children
        .map((childId) => nodes.find((n) => n.id === childId))
        .filter((n): n is Node => !!n);

      let originalUpwardExtent = 0;
      let originalDownwardExtent = 0;

      if (originalSiblings.length > 0) {
        const originalMinY = Math.min(...originalSiblings.map((s) => s.y));
        const originalMaxY = Math.max(...originalSiblings.map((s) => s.y + 40));
        originalUpwardExtent =
          originalMinY < parentCenterY ? parentCenterY - originalMinY : 0;
        originalDownwardExtent =
          originalMaxY > parentCenterY ? originalMaxY - parentCenterY : 0;
      }

      const newMinY = Math.min(...allPositions.map((pos) => pos.y));
      const newMaxY = Math.max(...allPositions.map((pos) => pos.y + 40));
      const newUpwardExtent =
        newMinY < parentCenterY ? parentCenterY - newMinY : 0;
      const newDownwardExtent =
        newMaxY > parentCenterY ? newMaxY - parentCenterY : 0;

      const upwardExpansion = Math.max(
        0,
        newUpwardExtent - originalUpwardExtent,
      );
      const downwardExpansion = Math.max(
        0,
        newDownwardExtent - originalDownwardExtent,
      );

      // 兄弟の位置を更新する
      const allNodesToUpdate: { nodeId: string; newX: number; newY: number }[] =
        [];

      newChildren.forEach((childId, childIndex) => {
        if (allPositions[childIndex]) {
          allNodesToUpdate.push({
            nodeId: childId,
            newX: allPositions[childIndex].x,
            newY: allPositions[childIndex].y,
          });
        }
      });

      setNodes((prev) =>
        prev.map((node) => {
          const update = allNodesToUpdate.find((u) => u.nodeId === node.id);
          if (update) {
            return { ...node, x: update.newX, y: update.newY };
          }
          return node;
        }),
      );

      // 階層的なY軸調整を適用する
      setTimeout(() => {
        if (upwardExpansion > 0 || downwardExpansion > 0) {
          applyHierarchicalYAdjustment(
            parentNode.id,
            upwardExpansion,
            downwardExpansion,
          );
        }
      }, 50);
    },
    [
      nodes,
      calculateBalancedChildPositions,
      applyHierarchicalYAdjustment,
      setNodes,
    ],
  );

  /**
   * 兄弟に子孫がいる場合に兄弟の作成を処理する
   */
  const handleSiblingCreationWithDescendants = useCallback(
    (
      newChildren: string[],
      newNodeIndex: number,
      parentNodeId: string,
      shouldApplyCentering: boolean = false,
      rootNode?: Node,
      selectedNode?: Node,
    ) => {
      // 親ノードを取得
      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (!parentNode) {
        return;
      }

      // 新しい兄弟ノードのIDを取得
      const newSiblingId = newChildren[newNodeIndex];
      if (!newSiblingId) {
        return;
      }

      const nodeSpacing = 60;

      // 後続の全ての弟ノード（とその子孫）を下に移動
      const nodesToMove: { nodeId: string; newX: number; newY: number }[] = [];

      for (let i = newNodeIndex + 1; i < newChildren.length; i++) {
        const youngerSiblingId = newChildren[i];
        const youngerSibling = nodes.find((n) => n.id === youngerSiblingId);
        if (!youngerSibling) {
          continue;
        }

        // 弟ノードを下に移動
        nodesToMove.push({
          nodeId: youngerSiblingId,
          newX: youngerSibling.x,
          newY: youngerSibling.y + nodeSpacing,
        });

        // 弟ノードの全ての子孫も一緒に移動
        const descendants = getDescendants(youngerSiblingId);
        descendants.forEach((desc) => {
          nodesToMove.push({
            nodeId: desc.id,
            newX: desc.x,
            newY: desc.y + nodeSpacing,
          });
        });
      }

      // 親ノードレベルまで階層的に調整
      let currentAffectedNodeId = parentNode.id;

      while (currentAffectedNodeId) {
        const currentAffectedNode = nodes.find(
          (n) => n.id === currentAffectedNodeId,
        );
        if (!currentAffectedNode || !currentAffectedNode.parentId) break;

        const grandParent = nodes.find(
          (n) => n.id === currentAffectedNode.parentId,
        );
        if (!grandParent) break;

        // 祖父レベルで、影響を受けたノードより後にある弟ノードを見つける
        const grandParentChildren = grandParent.children;
        const affectedNodeIndex = grandParentChildren.indexOf(
          currentAffectedNodeId,
        );

        // 祖父レベルでの弟ノード（とその子孫）を下に移動
        for (
          let i = affectedNodeIndex + 1;
          i < grandParentChildren.length;
          i++
        ) {
          const youngerGrandSiblingId = grandParentChildren[i];
          const youngerGrandSibling = nodes.find(
            (n) => n.id === youngerGrandSiblingId,
          );
          if (!youngerGrandSibling) continue;

          // 弟ノード自体を移動
          nodesToMove.push({
            nodeId: youngerGrandSiblingId,
            newX: youngerGrandSibling.x,
            newY: youngerGrandSibling.y + nodeSpacing,
          });

          // その子孫も移動
          const grandSiblingDescendants = getDescendants(youngerGrandSiblingId);
          grandSiblingDescendants.forEach((desc) => {
            nodesToMove.push({
              nodeId: desc.id,
              newX: desc.x,
              newY: desc.y + nodeSpacing,
            });
          });
        }

        // 次の親レベルへ（ルートまで繰り返し）
        currentAffectedNodeId = currentAffectedNode.parentId;
      }

      // 実際にノードを移動する
      if (nodesToMove.length > 0) {
        setNodes((prev) =>
          prev.map((node) => {
            const moveData = nodesToMove.find((m) => m.nodeId === node.id);
            if (moveData) {
              return { ...node, x: moveData.newX, y: moveData.newY };
            }
            return node;
          }),
        );
      }

      // 特別条件: ルートノードの最初の子の兄弟作成時のセンタリング調整
      if (shouldApplyCentering && rootNode && selectedNode) {
        setTimeout(() => {
          setNodes((prev) => {
            const rootNodeInPrev = prev.find((n) => n.id === rootNode.id);
            const firstNode = prev.find((n) => n.id === newChildren[0]);
            const newSiblingNode = prev.find(
              (n) => n.id === newChildren[newNodeIndex],
            );

            if (!rootNodeInPrev || !firstNode || !newSiblingNode) {
              return prev;
            }

            const yDistance = Math.abs(newSiblingNode.y - firstNode.y);
            const rootCenterY = rootNodeInPrev.y;
            const targetFirstNodeY = rootCenterY - yDistance / 2;
            const yAdjustment = targetFirstNodeY - firstNode.y;

            if (yAdjustment !== 0) {
              return prev.map((node) => {
                if (node.id === firstNode.id) {
                  return { ...node, y: node.y + yAdjustment };
                }

                const firstNodeDescendants = getDescendants(firstNode.id);
                if (firstNodeDescendants.some((desc) => desc.id === node.id)) {
                  return { ...node, y: node.y + yAdjustment };
                }

                return node;
              });
            }

            return prev;
          });
        }, 50); // 短い遅延でノード移動完了を待つ
      }
    },
    [nodes, getDescendants, setNodes, applyHierarchicalYAdjustment],
  );

  /**
   * 兄弟ノードを作成する
   */
  const createSiblingNode = useCallback(
    (nodeId: string) => {
      // ノードの存在チェック
      const node = nodes.find((n) => n.id === nodeId);

      // ルートノードには兄弟を作れない
      if (!node || !node.parentId) return;

      // 親ノードの存在チェック
      const parentNode = nodes.find((n) => n.id === node.parentId);
      if (!parentNode) return;

      // 現在の位置をチェック
      const currentNodeIndex = parentNode.children.indexOf(nodeId);
      if (currentNodeIndex === -1) return;

      // 兄弟ノード作成
      const newChildren = [...parentNode.children];
      newChildren.splice(currentNodeIndex + 1, 0, nextNodeId.toString());

      // グループ内の他の兄弟ノードをチェックする
      const existingSiblings = parentNode.children
        .map((childId) => nodes.find((n) => n.id === childId))
        .filter((n): n is Node => !!n);

      // 兄弟ノードに子孫がいるかどうかを確認する
      const siblingHasDescendants = existingSiblings.some(
        (sibling) => getDescendants(sibling.id).length > 0,
      );

      // 更新された親ノード（後続関数で使用）
      const tempUpdatedParent = { ...parentNode, children: newChildren };

      // 新しいノードの初期位置を計算
      let initialX = node.x;
      let initialY = node.y;

      if (!siblingHasDescendants) {
        // 子孫がいない場合: calculateBalancedChildPositions で位置を決定
        const newPositions = calculateBalancedChildPositions(
          tempUpdatedParent,
          true,
        );
        const position = newPositions[currentNodeIndex + 1];
        if (position) {
          initialX = position.x;
          initialY = position.y;
        }
      } else {
        // 子孫がいる場合: 最下位の子孫ノードを基準に位置を決定
        const findBottommostDescendantRecursively = (
          nodeId: string,
        ): number => {
          const targetNode = nodes.find((n) => n.id === nodeId);
          if (!targetNode) {
            return 0;
          }

          // 直下の子を取得
          const directChildren = targetNode.children
            .map((childId) => nodes.find((n) => n.id === childId))
            .filter((n): n is Node => !!n)
            .sort((a, b) => a.y - b.y);

          // 直下の子がない場合、このノードが最下位
          if (directChildren.length === 0) {
            return targetNode.y; // ノードのY座標をそのまま返す
          }

          // 直下の子グループの最後のノード（最下位）を見つける
          const lastChild = directChildren[directChildren.length - 1];

          // 再帰的に最後の子ノードから最下位の子孫を見つける
          return findBottommostDescendantRecursively(lastChild.id);
        };

        // 現在選択されているノード（兄ノード）から最下位の子孫を探す
        const bottommostY = findBottommostDescendantRecursively(node.id);

        // 新しい兄弟ノードを最下位ノードの1つ下に配置
        const nodeSpacing = 60;
        initialY = bottommostY + nodeSpacing;
      }

      const newNode: Node = {
        id: nextNodeId.toString(),
        x: initialX,
        y: initialY,
        content: "",
        parentId: node.parentId,
        children: [],
        isEditing: true,
        isSelected: true,
        isCollapsed: false,
        level: node.level,
        width: calculateNodeWidth(""),
      };

      setNodes((prev) => {
        // 1. 全ノードの選択・編集状態をリセット
        const updated = prev.map((n) => ({
          ...n,
          isSelected: n.id === newNode.id,
          isEditing: false,
        }));

        // 2. 親ノードの children リストを更新
        const parentIndex = updated.findIndex((n) => n.id === node.parentId);
        if (parentIndex !== -1) {
          updated[parentIndex] = {
            ...updated[parentIndex],
            children: newChildren,
          };
        }

        // 3. 新しいノードを配列に追加して返す
        return [...updated, newNode];
      });

      setEditingContent((prev) => ({
        ...prev,
        [newNode.id]: "",
      }));

      setTimeout(() => {
        if (siblingHasDescendants) {
          // ルートノードを見つける
          let rootNode = parentNode;
          while (rootNode.parentId !== null) {
            const nextParent = nodes.find((n) => n.id === rootNode.parentId);
            if (!nextParent) break;
            rootNode = nextParent;
          }

          // 特別条件の判定
          const shouldApplyCentering = rootNode.children[0] === node.id;

          // 兄弟姉妹に子孫がいる場合の流れ
          handleSiblingCreationWithDescendants(
            newChildren,
            currentNodeIndex + 1,
            parentNode.id,
            shouldApplyCentering,
            rootNode,
            node,
          );
        } else {
          // 兄弟に子孫がいない場合の流れ
          handleSiblingCreationWithoutDescendants(
            tempUpdatedParent,
            newChildren,
            parentNode,
          );
        }
      }, 0);

      setNextNodeId((prev) => prev + 1);
    },
    [
      nodes,
      nextNodeId,
      calculateBalancedChildPositions,
      calculateNodeWidth,
      getDescendants,
      setNodes,
      setEditingContent,
      setNextNodeId,
      handleSiblingCreationWithDescendants,
      handleSiblingCreationWithoutDescendants,
    ],
  );

  // ==============================================
  // ノードを削除する
  // ==============================================
  /**
   * Simple node deletion - removes node and all its descendants
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      // ノードの存在チェック
      const node = nodes.find((n) => n.id === nodeId);

      // ルートノードは削除できない
      if (!node || !node.parentId) return;

      // 親ノードの存在チェック
      const parentNode = nodes.find((n) => n.id === node.parentId);
      if (!parentNode) return;

      // 削除対象のノードとその子孫を特定
      const nodesToRemove = new Set([nodeId]);
      const findDescendants = (id: string) => {
        const targetNode = nodes.find((n) => n.id === id);
        if (targetNode) {
          targetNode.children.forEach((childId: string) => {
            nodesToRemove.add(childId);
            findDescendants(childId);
          });
        }
      };
      findDescendants(nodeId);

      // ノードとその子孫を削除
      setNodes((prev) => {
        // 親ノードから削除対象の子を除去
        const updated = prev.map((n) => {
          if (n.children.includes(nodeId)) {
            return {
              ...n,
              children: n.children.filter((childId) => childId !== nodeId),
            };
          }
          return n;
        });

        // 削除対象のノードとその子孫を除去
        return updated.filter((n) => !nodesToRemove.has(n.id));
      });

      // 編集内容からも削除
      setEditingContent((prev) => {
        const newState = { ...prev };
        nodesToRemove.forEach((id) => delete newState[id]);
        return newState;
      });
    },
    [nodes, setNodes, setEditingContent],
  );

  // ==============================================
  // その他
  // ==============================================
  /**
   * ノードの内容を更新する
   */
  const updateNodeContent = useCallback(
    (nodeId: string, content: string) => {
      const trimmedContent = content.trim();
      if (trimmedContent === "") {
        deleteNode(nodeId); // 内容が空の場合は削除
        return;
      }

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const isRoot = !node.parentId;
      const oldWidth = node.width || 0;
      const newWidth = calculateNodeWidth(trimmedContent, isRoot);

      // ノードの内容と幅を更新し、編集モードを終了
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              content: trimmedContent,
              isEditing: false,
              width: newWidth,
            };
          }
          return n;
        }),
      );

      // 編集内容をクリア
      setEditingContent((prev) => {
        const newState = { ...prev };
        delete newState[nodeId];
        return newState;
      });

      // 幅の変化が大きい場合、子ノードの位置を調整
      if (node.children.length > 0 && Math.abs(newWidth - oldWidth) > 5) {
        setTimeout(() => {
          adjustChildPositionsAfterParentChange(nodeId);
        }, 0);
      }
    },
    [
      nodes,
      deleteNode,
      calculateNodeWidth,
      adjustChildPositionsAfterParentChange,
      setNodes,
      setEditingContent,
    ],
  );

  /**
   * 編集中の内容を変更し、リアルタイムで幅を更新
   */
  const handleEditingContentChange = useCallback(
    (nodeId: string, content: string) => {
      setEditingContent((prev) => ({
        ...prev,
        [nodeId]: content,
      }));

      updateNodeWidth(nodeId, content); // リアルタイム幅更新
    },
    [updateNodeWidth, setEditingContent],
  );

  /**
   * ノードを選択する
   * 他の全てのノードの選択状態と編集状態をクリア
   */
  const selectNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          isSelected: node.id === nodeId,
          isEditing: false,
        })),
      );
    },
    [setNodes],
  );

  /**
   * ノードの編集を開始
   */
  const startNodeEditing = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          isEditing: n.id === nodeId,
          isSelected: n.id === nodeId,
        })),
      );

      // 編集内容を初期化
      setEditingContent((prev) => ({
        ...prev,
        [nodeId]: node.content === "New Node" ? "" : node.content,
      }));
    },
    [nodes, setNodes, setEditingContent],
  );

  /**
   * 編集をキャンセル
   */
  const cancelEditing = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      const currentEditingContent = editingContent[nodeId] || "";

      if (node && currentEditingContent.trim() === "") {
        deleteNode(nodeId); // 空の場合は削除
      } else {
        // 編集状態を終了し、編集内容をクリア
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, isEditing: false } : n)),
        );

        setEditingContent((prev) => {
          const newState = { ...prev };
          delete newState[nodeId];
          return newState;
        });
      }
    },
    [nodes, editingContent, deleteNode, setNodes, setEditingContent],
  );

  /**
   * 子ノードの表示/非表示を切り替える（折りたたみ機能）
   */
  const toggleChildrenVisibility = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, isCollapsed: !node.isCollapsed }
            : node,
        ),
      );
    },
    [setNodes],
  );

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
