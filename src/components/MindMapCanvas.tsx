import React, { useCallback, useRef, useEffect } from "react";
import { useMindMapStore } from "../stores/mindMapStore";
import { MIN_SCALE, MAX_SCALE } from "./mindmap/constants";
import { useMindMapState } from "./mindmap/useMindMapState";
import { useMindMapLogic } from "./mindmap/useMindMapLogic.ts";
import { useMindMapActions } from "./mindmap/useMindMapActions";
import { useMindMapUtils } from "./mindmap/useMindMapUtils";
import { useMindMapImportExport } from "./mindmap/useMindMapImportExport";
import { useTranslation } from "../hooks/useTranslation";
import {
  Toolbar,
  NodeComponent,
  Connections,
  ExpandButton,
  NavigationModeDisplay,
  AICommandInput,
  FloatingActionButton,
  ZoomDisplay,
} from "./mindmap/components";

export const MindMapCanvas: React.FC = () => {
  // 翻訳、状態管理の初期化
  const { t } = useTranslation();
  const { currentMap, hasUnsavedChanges } = useMindMapStore();

  // マインドマップの状態管理フック
  const {
    nodes, // ノードのデータ
    setNodes,
    connections, // ノード間の接続線
    setConnections,
    viewState, // ビュー（ズーム、位置）の状態
    setViewState,
    dragState, // ドラッグ中の状態
    setDragState,
    navigationMode, // キーボードナビゲーションモード
    setNavigationMode,
    nextNodeId, // 次のノードID
    setNextNodeId,
    editingContent, // 編集中のテキスト内容
    setEditingContent,
    showAICommand, // AIコマンド入力の表示状態
    setShowAICommand,
    aiPrompt, // AIプロンプト
    setAIPrompt,
  } = useMindMapState();

  // DOM要素への参照
  const canvasRef = useRef<HTMLDivElement>(null); // メインキャンバス
  const fileInputRef = useRef<HTMLInputElement>(null); // ファイル入力

  // ノードの幅を計算する関数
  const calculateNodeWidth = useCallback((content: string, isRoot = false) => {
    const padding = 24; // パディング
    const minWidth = isRoot ? 80 : 60; // 最小幅（ルートノードは大きめ）

    // 空のコンテンツの場合は最小幅を返す
    if (!content || content.trim() === "") {
      return minWidth;
    }

    // Canvasを使ってテキストの実際の幅を測定
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      // フォントサイズをルートノードと子ノードで変える
      context.font = isRoot ? "bold 24px sans-serif" : "500 18px sans-serif";
      const textWidth = context.measureText(content).width;
      return Math.max(minWidth, textWidth + padding);
    }

    return minWidth;
  }, []);

  // マインドマップのレイアウトロジック（位置調整など）
  const {
    textMeasureRef,
    getDescendants,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    applyHierarchicalYAdjustment,
    adjustChildPositionsAfterParentChange,
    triggerFullLayoutAdjustment,
  } = useMindMapLogic(nodes, setNodes, calculateNodeWidth);

  // ノードの操作（作成、削除、編集など）
  const {
    createChildNode, // 子ノード作成
    createSiblingNode, // 兄弟ノード作成
    deleteNode, // ノード削除
    updateNodeContent, // ノード内容更新
    handleEditingContentChange, // 編集中テキスト変更
    selectNode, // ノード選択
    startNodeEditing, // ノード編集開始
    cancelEditing, // 編集キャンセル
    toggleChildrenVisibility, // 子ノードの表示/非表示切り替え
  } = useMindMapActions(
    nodes,
    setNodes,
    nextNodeId,
    setNextNodeId,
    editingContent,
    setEditingContent,
    calculateNodeWidth,
    getDescendants,
    calculateBalancedChildPositions,
    moveDescendantsVertically,
    applyHierarchicalYAdjustment,
    adjustChildPositionsAfterParentChange,
    triggerFullLayoutAdjustment,
  );

  // マインドマップのユーティリティ機能
  const {
    getVisibleNodes, // 表示可能ノードの取得
    getExpandButtonPosition, // 展開ボタンの位置
    shouldShowExpandButton, // 展開ボタンを表示するかどうか
    calculateConnections, // 接続線の計算
    findNearestNode, // 最も近いノードを見つける
  } = useMindMapUtils(nodes, calculateNodeWidth);

  // インポート・エクスポート機能
  const {
    exportMindMap, // マインドマップをエクスポート
    importMindMap, // マインドマップをインポート
  } = useMindMapImportExport(
    nodes,
    setNodes,
    setNextNodeId,
    setViewState,
    setNavigationMode,
    setEditingContent,
    calculateNodeWidth,
  );

  // ファイル選択ダイアログを開く
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // マウスダウンイベントハンドラー（ドラッグ開始）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId?: string) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (!nodeId) {
        // キャンバスドラッグ開始
        setDragState({
          isDragging: true,
          dragType: "canvas",
          startX: clientX,
          startY: clientY,
          initialX: viewState.offsetX,
          initialY: viewState.offsetY,
        });
      } else {
        // ノード選択
        selectNode(nodeId);
      }
    },
    [nodes, viewState, selectNode, setDragState],
  );

  // マウス移動イベントハンドラー（ドラッグ中）
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState?.isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const deltaX = (clientX - dragState.startX) / viewState.scale;
      const deltaY = (clientY - dragState.startY) / viewState.scale;

      if (dragState.dragType === "canvas") {
        // キャンバスの移動
        setViewState((prev) => ({
          ...prev,
          offsetX: dragState.initialX + deltaX,
          offsetY: dragState.initialY + deltaY,
        }));
      }
    },
    [dragState, viewState.scale, setViewState],
  );

  // マウスアップイベントハンドラー（ドラッグ終了）
  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, [setDragState]);

  // ホイールイベントハンドラー（ズーム）
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1; // ズーム倍率
      setViewState((prev) => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta)),
      }));
    },
    [setViewState],
  );

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const editingNode = nodes.find((n) => n.isEditing);

      // 編集中はEscapeキー以外は無視
      if (editingNode && e.key !== "Escape") {
        return;
      }

      // スラッシュキーでAIコマンド開始
      if (e.key === "/") {
        setShowAICommand(true);
        setAIPrompt("/ai ");
        return;
      }

      // Escapeキーの処理
      if (e.key === "Escape") {
        if (editingNode) {
          // 編集をキャンセル
          cancelEditing(editingNode.id);
          return;
        }

        if (showAICommand) {
          // AIコマンド入力を閉じる
          setShowAICommand(false);
          setAIPrompt("");
          return;
        }

        // ナビゲーションモードの切り替え
        setNavigationMode((prev) => !prev);

        // ナビゲーションモードに入る時、選択ノードがなければ最初のノードを選択
        if (!navigationMode && nodes.length > 0) {
          const selectedNode = nodes.find((n) => n.isSelected);
          if (!selectedNode) {
            selectNode(nodes[0].id);
          }
        }
        return;
      }

      // ナビゲーションモード時のキーボード操作
      if (navigationMode) {
        const selectedNode = nodes.find((n) => n.isSelected);
        if (!selectedNode) return;

        e.preventDefault();

        let targetNodeId: string | null = null;

        switch (e.key) {
          case "ArrowUp": // 上の近いノードを選択
            targetNodeId = findNearestNode(selectedNode, "up");
            break;
          case "ArrowDown": // 下の近いノードを選択
            targetNodeId = findNearestNode(selectedNode, "down");
            break;
          case "ArrowLeft": // 左の近いノードを選択
            targetNodeId = findNearestNode(selectedNode, "left");
            break;
          case "ArrowRight": // 右の近いノードを選択
            targetNodeId = findNearestNode(selectedNode, "right");
            break;
          case " ": // スペースキーで編集開始
            startNodeEditing(selectedNode.id);
            setNavigationMode(false);
            return;
          case "Delete":
          case "Backspace": // ノード削除
            if (selectedNode.parentId) {
              // 削除後に選択する次のノードを探す
              const nextNodeId =
                findNearestNode(selectedNode, "up") ||
                findNearestNode(selectedNode, "down") ||
                findNearestNode(selectedNode, "left") ||
                findNearestNode(selectedNode, "right") ||
                selectedNode.parentId;

              deleteNode(selectedNode.id);

              // 次のノードを選択
              if (nextNodeId) {
                setTimeout(() => {
                  selectNode(nextNodeId);
                }, 0);
              }
            }
            return;
          case "Tab": // Tabキーで子ノード作成
            e.preventDefault();
            createChildNode(selectedNode.id);
            setNavigationMode(false);
            return;
          case "Enter": // Enterキーで兄弟ノード作成
            if (selectedNode.parentId) {
              createSiblingNode(selectedNode.id);
              setNavigationMode(false);
            }
            return;
        }

        // 目標ノードがあれば選択
        if (targetNodeId) {
          selectNode(targetNodeId);
        }
      }
    },
    [
      nodes,
      navigationMode,
      cancelEditing,
      selectNode,
      startNodeEditing,
      findNearestNode,
      deleteNode,
      createChildNode,
      createSiblingNode,
      showAICommand,
      setShowAICommand,
      setAIPrompt,
      setNavigationMode,
    ],
  );

  // イベントリスナーの登録・削除
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ホイールイベントとキーボードイベントを登録
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    // クリーンアップ
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleWheel]);

  // AIコマンドの実行
  const handleAICommand = useCallback(async () => {
    if (!aiPrompt.startsWith("/ai ")) return;

    const prompt = aiPrompt.substring(4); // '/ai 'を除去
    setShowAICommand(false);
    setAIPrompt("");

    // 選択されたノードまたは最初のノードに子ノードを作成
    const selectedNode = nodes.find((n) => n.isSelected) || nodes[0];
    if (selectedNode) {
      createChildNode(selectedNode.id);

      // 新しいノードにAIプロンプトを設定
      setTimeout(() => {
        const newNode = nodes.find((n) => n.isEditing);
        if (newNode) {
          updateNodeContent(newNode.id, `AI: ${prompt}`);
        }
      }, 100);
    }
  }, [
    aiPrompt,
    nodes,
    createChildNode,
    updateNodeContent,
    setShowAICommand,
    setAIPrompt,
  ]);


  // ページを離れる時の警告処理
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = t("errors.unsavedChanges");
        return e.returnValue;
      }
    };

    const handlePopState = (_e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          `${t("errors.unsavedChanges")} ${t("errors.confirmLeave")}`,
        );
        if (!confirmLeave) {
          window.history.pushState(null, "", window.location.href);
          return;
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, t]);

  // 接続線の更新
  useEffect(() => {
    setConnections(calculateConnections());
  }, [calculateConnections, setConnections]);

  // ノード幅の更新
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        width: calculateNodeWidth(node.content, !node.parentId),
      })),
    );
  }, [calculateNodeWidth, setNodes]);

  // 表示するノードを取得
  const visibleNodes = getVisibleNodes();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* テキスト幅測定用の隠し要素 */}
      <span
        ref={textMeasureRef}
        className="absolute -top-1000 left-0 opacity-0 pointer-events-none whitespace-nowrap"
        style={{ fontFamily: "inherit" }}
      />

      {/* ツールバー */}
      <Toolbar
        triggerImport={triggerImport}
        exportMindMap={exportMindMap}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* ファイル入力（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importMindMap}
        className="hidden"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* メインキャンバスエリア */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* 接続線を描画するSVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
                transformOrigin: "0 0",
                minWidth: "5000px",
                minHeight: "5000px",
                overflow: "visible",
              }}
            >
              <Connections connections={connections} />
            </svg>

            {/* ノードを配置するコンテナ */}
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${viewState.scale}) translate(${viewState.offsetX}px, ${viewState.offsetY}px)`,
                transformOrigin: "0 0",
              }}
            >
              {/* 各ノードをレンダリング */}
              {visibleNodes.map((node) => {
                const currentContent = node.isEditing
                  ? editingContent[node.id] || ""
                  : node.content;
                const currentWidth =
                  node.width ||
                  calculateNodeWidth(currentContent, !node.parentId);

                return (
                  <div key={node.id}>
                    {/* ノードコンポーネント */}
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

                    {/* 展開/折りたたみボタン */}
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

      {/* ナビゲーションモード表示 */}
      <NavigationModeDisplay navigationMode={navigationMode} />

      {/* AIコマンド入力 */}
      <AICommandInput
        showAICommand={showAICommand}
        aiPrompt={aiPrompt}
        setAIPrompt={setAIPrompt}
        onHandleAICommand={handleAICommand}
        onClose={() => {
          setShowAICommand(false);
          setAIPrompt("");
        }}
      />

      {/* フローティングアクションボタン */}
      <FloatingActionButton onShowAICommand={() => setShowAICommand(true)} />

      {/* ズーム表示 */}
      <ZoomDisplay scale={viewState.scale} />
    </div>
  );
};
