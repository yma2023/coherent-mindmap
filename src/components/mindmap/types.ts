export interface Node {
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

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: "child" | "sibling" | "straight" | "composite"; // 'composite' を追加
  controlX?: number;
  controlY?: number;

  // 複合パス用の追加プロパティ
  lineEndX?: number; // 直線部分の終点X座標
  lineEndY?: number; // 直線部分の終点Y座標
  curveStartX?: number; // ベジェ曲線部分の始点X座標
  curveStartY?: number; // ベジェ曲線部分の始点Y座標
  curveEndX?: number; // ベジェ曲線部分の終点X座標
  curveEndY?: number; // ベジェ曲線部分の終点Y座標

  // デバッグ用（オプション）
  alignmentPointX?: number; // 整列点X座標
  alignmentPointY?: number; // 整列点Y座標
}

export interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface ExportData {
  version: string;
  createdAt: string;
  nodes: Node[];
  metadata: {
    title: string;
    nodeCount: number;
    maxLevel: number;
  };
}
