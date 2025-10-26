import { useCallback } from "react";
import { Node, Connection } from "./types";

/**
 * 表示管理、接続線計算、ナビゲーション
 */
export const useMindMapUtils = (
  nodes: Node[],
  calculateNodeWidth: (content: string, isRoot?: boolean) => number,
) => {
  /**
   * 表示されるべきノードを取得する
   * 折りたたまれたノードの子は除外される
   */
  const getVisibleNodes = useCallback(() => {
    const visibleNodes: Node[] = [];
    const processedNodes = new Set<string>();

    const processNode = (node: Node) => {
      if (processedNodes.has(node.id)) return;
      processedNodes.add(node.id);

      visibleNodes.push(node);

      // 折りたたまれていない場合のみ子ノードを処理
      if (!node.isCollapsed) {
        node.children.forEach((childId) => {
          const childNode = nodes.find((n) => n.id === childId);
          if (childNode) {
            processNode(childNode);
          }
        });
      }
    };

    // ルートノードから開始
    const rootNodes = nodes.filter((n) => !n.parentId);
    rootNodes.forEach(processNode);

    return visibleNodes;
  }, [nodes]);

  /**
   * 展開ボタンの位置を計算する
   */
  const getExpandButtonPosition = useCallback(
    (node: Node) => {
      if (node.children.length === 0) return null;

      const nodeWidth =
        node.width || calculateNodeWidth(node.content, !node.parentId);
      const NODE_HEIGHT = 40;

      return {
        x: node.x + nodeWidth, // ノードの右端
        y: node.y + NODE_HEIGHT / 2, // ノードの中央
      };
    },
    [calculateNodeWidth],
  );

  /**
   * 展開ボタンを表示するかどうかを判定する
   */
  const shouldShowExpandButton = useCallback((node: Node) => {
    return node.children.length > 0;
  }, []);

  /**
   * ノード間の接続線を計算する
   * 直線または複合パス（直線+ベジェ曲線）を生成
   */
  const calculateConnections = useCallback((): Connection[] => {
    const visibleNodes = getVisibleNodes();
    const newConnections: Connection[] = [];
    const NODE_HEIGHT = 40;

    visibleNodes.forEach((node) => {
      if (node.children.length > 0 && !node.isCollapsed) {
        const isRoot = !node.parentId;
        const nodeWidth =
          node.width || calculateNodeWidth(node.content, isRoot);

        // 親ノードの右側中央点
        const parentRightCenterX = node.x + nodeWidth;
        const parentRightCenterY = node.y + NODE_HEIGHT / 2;

        // 表示されている子ノードを取得
        const siblings = node.children
          .map((id) => visibleNodes.find((n) => n.id === id))
          .filter((c): c is Node => !!c);

        for (let i = 0; i < siblings.length; i++) {
          const child = siblings[i];

          const childLeftCenterX = child.x;
          const childLeftCenterY = child.y + NODE_HEIGHT / 2;

          const yDiff = childLeftCenterY - parentRightCenterY;

          // 水平判定：ほぼ同じ高さなら直線で接続
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
            // 子が一つだけならシンプルに直線で接続
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
            // より自然で美しい接続線を作成

            const startX = parentRightCenterX; // 開始点
            const startY = parentRightCenterY;
            const endX = childLeftCenterX; // 終了点
            const endY = childLeftCenterY;

            // 曲がり角のX座標を親ノードと子ノードの中間地点に設定
            const intermediateX = startX + (endX - startX) / 2;

            // パスの構成要素：
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
              controlX: intermediateX, // 曲がり角のX座標
              controlY: endY, // 子ノードのY座標
              curveEndX: endX,
              curveEndY: endY,
            });
          }
        }
      }
    });

    // デバッグ用ログ
    // console.log("visibleNodes:", visibleNodes.length);
    // console.log("newConnections:", newConnections.length);
    return newConnections;
  }, [nodes, getVisibleNodes, calculateNodeWidth]);

  /**
   * 2つのノード間の距離を計算する
   */
  const getDistance = useCallback((node1: Node, node2: Node): number => {
    return Math.sqrt(
      Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2),
    );
  }, []);

  /**
   * 指定された方向で最も近いノードを見つける
   * キーボードナビゲーションで使用
   */
  const findNearestNode = useCallback(
    (
      currentNode: Node,
      direction: "up" | "down" | "left" | "right",
    ): string | null => {
      const visibleNodes = getVisibleNodes().filter(
        (n) => n.id !== currentNode.id,
      );
      if (visibleNodes.length === 0) return null;

      let candidates: Node[] = [];

      // 方向に応じて候補ノードをフィルタリング
      switch (direction) {
        case "up":
          candidates = visibleNodes.filter((n) => n.y < currentNode.y - 10);
          break;
        case "down":
          candidates = visibleNodes.filter((n) => n.y > currentNode.y + 10);
          break;
        case "left":
          candidates = visibleNodes.filter((n) => n.x < currentNode.x - 10);
          break;
        case "right":
          candidates = visibleNodes.filter((n) => n.x > currentNode.x + 10);
          break;
      }

      if (candidates.length === 0) return null;

      // 最短距離のノードを見つける
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
    },
    [getVisibleNodes, getDistance],
  );

  return {
    getVisibleNodes,
    getExpandButtonPosition,
    shouldShowExpandButton,
    calculateConnections,
    getDistance,
    findNearestNode,
  };
};
