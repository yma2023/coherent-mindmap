import { useCallback } from 'react';
import { Node, ViewState, ExportData } from './types';

/**
 * マインドマップのインポート・エクスポート
 * JSONファイルでのデータ保存・読み込みを担当
 */
export const useMindMapImportExport = (
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setNextNodeId: React.Dispatch<React.SetStateAction<number>>,
    setViewState: React.Dispatch<React.SetStateAction<ViewState>>,
    setNavigationMode: React.Dispatch<React.SetStateAction<boolean>>,
    setEditingContent: React.Dispatch<React.SetStateAction<{ [nodeId: string]: string }>>,
    calculateNodeWidth: (content: string, isRoot?: boolean) => number
  ) => {
    
    /**
     * マインドマップをJSONファイルとしてエクスポート
     */
    const exportMindMap = useCallback(() => {
      // エクスポートデータの構造を定義
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
  
      // JSONデータをBlobとして作成
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // ダウンロード用のリンクを作成・実行
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindmap_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, [nodes]);
  
    /**
     * JSONファイルからマインドマップをインポート
     */
    const importMindMap = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData: ExportData = JSON.parse(content);
          
          // データの妥当性をチェック
          if (!importData.nodes || !Array.isArray(importData.nodes)) {
            alert('無効なファイル形式です。');
            return;
          }
  
          // インポートしたノードの状態を初期化
          const importedNodes = importData.nodes.map(node => ({
            ...node,
            isEditing: false,  // 編集状態をリセット
            isSelected: false, // 選択状態をリセット
            width: calculateNodeWidth(node.content, !node.parentId), // 幅を再計算
          }));
  
          // 次のノードIDを設定（既存の最大ID + 1）
          const maxId = Math.max(...importedNodes.map(n => parseInt(n.id) || 0));
          setNextNodeId(maxId + 1);
  
          // ノードを更新
          setNodes(importedNodes);
          
          // ビュー状態を初期化（ズームとパンをリセット）
          setViewState({
            scale: 1,
            offsetX: 0,
            offsetY: 0,
          });
  
          // 各種状態をリセット
          setNavigationMode(false);
          setEditingContent({});
  
          // インポート完了メッセージを表示
          alert(`マインドマップをインポートしました。\nノード数: ${importedNodes.length}`);
        } catch (error) {
          console.error('Import error:', error);
          alert('ファイルの読み込みに失敗しました。正しいJSON形式のファイルを選択してください。');
        }
      };
      
      reader.readAsText(file); // ファイルをテキストとして読み込み
    }, [calculateNodeWidth, setNodes, setNextNodeId, setViewState, setNavigationMode, setEditingContent]);
  
    return {
      exportMindMap,
      importMindMap,
    };
  };