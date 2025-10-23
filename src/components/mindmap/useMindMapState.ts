import { useState } from 'react';
import { Node, Connection, ViewState } from './types';


// ==============================================
// マインドマップの状態管理
// ==============================================
export const useMindMapState = () => {
    // ノードリスト（初期値：メインアイデア）
    const [nodes, setNodes] = useState<Node[]>([
      {
        id: '1',
        x: 200,        // X座標
        y: 300,        // Y座標
        content: 'メインアイデア',
        children: [],
        isEditing: false,
        isSelected: false,
        isCollapsed: false,
        level: 0,      // 階層レベル（ルートは0）
        width: 0,      // ノードの幅
      },
    ]);
    
    // 線の接続情報
    const [connections, setConnections] = useState<Connection[]>([]);
    
    // 表示状態（ズーム、オフセット）
    const [viewState, setViewState] = useState<ViewState>({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
    
    // ドラッグ状態
    const [dragState, setDragState] = useState<{
      isDragging: boolean;
      dragType: 'node' | 'canvas';
      nodeId?: string;
      startX: number;
      startY: number;
      initialX: number;
      initialY: number;
    } | null>(null);
    
    // ナビゲーションモード（キーボードで移動可能）
    const [navigationMode, setNavigationMode] = useState(false);
    
    // 次に作成するノードのID
    const [nextNodeId, setNextNodeId] = useState(2);
    
    // 編集中のテキスト内容
    const [editingContent, setEditingContent] = useState<{ [nodeId: string]: string }>({});
    
    // AI コマンド関連
    const [showAICommand, setShowAICommand] = useState(false);
    const [aiPrompt, setAIPrompt] = useState('');
    
    // サイドバー表示状態
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
  