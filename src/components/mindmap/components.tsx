import React from 'react';
import { Plus, X, Download, Upload, Zap, ArrowLeft, Menu, Home, Brain, Search, Map, Settings, Share2, Star, Clock, Users } from 'lucide-react';
import { Node, Connection } from './types';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { useTranslation } from '../../hooks/useTranslation';

interface ToolbarProps {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  triggerImport: () => void;
  exportMindMap: () => void;
  handleBackToDashboard: () => void;
  currentMapName?: string;
  hasUnsavedChanges: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  sidebarVisible,
  setSidebarVisible,
  triggerImport,
  exportMindMap,
  handleBackToDashboard,
  currentMapName,
  hasUnsavedChanges,
}) => {
  const { t } = useTranslation();

  return (
  <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 py-3 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors mr-2"
          title={sidebarVisible ? t('mindMap.hideSidebar') : t('mindMap.showSidebar')}
        >
          {sidebarVisible ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <div className="w-px h-6 bg-slate-300 mx-2" />

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerImport}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title={t('mindMap.import')}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t('mindMap.import')}</span>
          </button>
          <button
            onClick={exportMindMap}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title={t('mindMap.export')}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('mindMap.export')}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={handleBackToDashboard}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            title={t('mindMap.backToDashboard')}
          >
            <Home className="w-4 h-4" />
          </button>
          <span className="text-slate-400">/</span>
          <h2 className="text-lg font-semibold text-slate-800">
            {currentMapName || t('mindMap.untitledMindMap')}
          </h2>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 rounded-full font-semibold">
              {t('mindMap.unsaved')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <LanguageSwitcher variant="compact" />
        <div className="w-px h-6 bg-slate-300 mx-2" />
        <button
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors text-sm font-semibold"
          title={t('mindMap.backToDashboard')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.dashboard')}</span>
        </button>
      </div>
    </div>
  </div>
  );
};

interface SidebarProps {
  currentMapId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMapId }) => {
  const { t } = useTranslation();

  return (
  <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/50 h-full flex flex-col shadow-lg">
    <div className="p-4 border-b border-white/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">MindFlow</span>
        </div>
      </div>
      
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t('mindMap.searchMaps')}
          className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm backdrop-blur-sm"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">{t('mindMap.recentMaps')}</h2>
        <div className="space-y-2">
          {[
            { id: '1', name: 'Project Strategy', nodes: 12, updated: '2 hours ago' },
            { id: '2', name: 'Marketing Plan', nodes: 8, updated: '1 day ago' },
            { id: '3', name: 'Team Structure', nodes: 15, updated: '3 days ago' },
          ].map((map) => (
            <div
              key={map.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentMapId === map.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                  : 'hover:bg-white/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{map.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>{map.nodes} {t('dashboard.nodes')}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{map.updated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="p-4 border-t border-white/30">
      <div className="flex items-center justify-between mb-3">
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">{t('mindMap.proPlan')}</span>
        </div>
        <p className="text-xs text-amber-700">{t('mindMap.unlimitedMapsCollaboration')}</p>
      </div>
    </div>
  </div>
  );
};

interface NodeComponentProps {
  node: Node;
  currentContent: string;
  currentWidth: number;
  navigationMode: boolean;
  dragState: any;
  editingContent: { [nodeId: string]: string };
  onSelectNode: (nodeId: string) => void;
  onStartNodeEditing: (nodeId: string) => void;
  onHandleEditingContentChange: (nodeId: string, content: string) => void;
  onUpdateNodeContent: (nodeId: string, content: string) => void;
  onCancelEditing: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onCreateChildNode: (nodeId: string) => void;
  onCreateSiblingNode: (nodeId: string) => void;
  onSetNavigationMode?: (mode: boolean) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  currentWidth,
  navigationMode,
  dragState,
  editingContent,
  onSelectNode,
  onStartNodeEditing,
  onHandleEditingContentChange,
  onUpdateNodeContent,
  onCancelEditing,
  onDeleteNode,
  onCreateChildNode,
  onCreateSiblingNode,
  onSetNavigationMode,
}) => {
  const [lastEnterTime, setLastEnterTime] = React.useState(0);
  const DOUBLE_ENTER_TIMEOUT = 500; // 500ms timeout for double enter

  return (
  <div key={node.id}>
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
        minWidth: currentWidth,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode(node.id);
      }}
    >
      <div
        className={`px-3 py-2 rounded transition-colors cursor-pointer ${
          !node.parentId 
            ? 'text-2xl font-bold' 
            : 'text-lg font-medium'
        }`}
        style={{
          width: currentWidth,
          height: '40px',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!dragState?.isDragging) {
            onStartNodeEditing(node.id);
          }
        }}
      >
        {node.isSelected && (
          <div className={`absolute -inset-2 border-2 rounded-lg pointer-events-none ${
            navigationMode 
              ? 'border-blue-600 bg-blue-100/50 shadow-lg' 
              : 'border-blue-500 bg-blue-50/20'
          }`} />
        )}

        {node.isEditing ? (
          <input
            type="text"
            value={editingContent[node.id] || ''}
            className={`bg-transparent border-b-2 border-blue-500 outline-none px-1 w-full ${
              !node.parentId ? 'text-2xl font-bold' : 'text-lg font-medium'
            }`}
            style={{
              width: `${currentWidth - 24}px`,
              minWidth: '40px',
              height: '32px',
            }}
            autoFocus
            onChange={(e) => onHandleEditingContentChange(node.id, e.target.value)}
            onBlur={(e) => onUpdateNodeContent(node.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const currentTime = Date.now();
                if (currentTime - lastEnterTime < DOUBLE_ENTER_TIMEOUT) {
                  // Double Enter detected - exit input mode and enter navigation mode
                  onUpdateNodeContent(node.id, e.currentTarget.value);
                  if (onSetNavigationMode) {
                    setTimeout(() => onSetNavigationMode(true), 50);
                  }
                } else {
                  // Single Enter - just add a newline (or handle as needed)
                  // For now, we'll just set the time and wait for potential second Enter
                  setLastEnterTime(currentTime);
                }
              } else if (e.key === 'Escape') {
                onCancelEditing(node.id);
              } else {
                // Reset enter time on any other key
                setLastEnterTime(0);
              }
            }}
          />
        ) : (
          <span className={`px-1 py-1 rounded transition-colors block ${
            !node.parentId ? 'text-2xl font-bold' : 'text-lg font-medium'
          }`}
          style={{
            width: 'auto',
            maxWidth: 'none',
            lineHeight: '32px',
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}>
            {node.content}
          </span>
        )}

        {node.isSelected && node.parentId && (
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-20 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNode(node.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {!node.isEditing && (
          <button
            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-blue-600 z-10"
            style={{
              right: -40,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCreateChildNode(node.id);
            }}
          >
            <Plus className="w-3 h-3" />
          </button>
        )}

        {!node.isEditing && node.parentId && (
          <button
            className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-green-600 z-10"
            style={{
              bottom: -40,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCreateSiblingNode(node.id);
            }}
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  </div>
  );
};

interface ConnectionsProps {
  connections: Connection[];
}


export const Connections: React.FC<ConnectionsProps> = ({ connections }) => (
  <>
    {connections.map(connection => {
      // 複合パス（直線 + ベジェ曲線）の場合
      if (connection.type === 'composite' && connection.lineEndX && connection.lineEndY && 
          connection.curveStartX && connection.curveStartY && connection.controlX && connection.controlY) {
        return (
          <g key={connection.id}>
            {/* 直線部分: 始点 → 変化点 */}
            <line
              x1={connection.fromX}
              y1={connection.fromY}
              x2={connection.lineEndX}
              y2={connection.lineEndY}
              stroke="#4F46E5"
              strokeWidth="3"
              className="transition-all duration-300"
            />
            {/* ベジェ曲線部分: 変化点 → 終点 */}
            <path
              d={`M ${connection.curveStartX} ${connection.curveStartY} 
                  Q ${connection.controlX} ${connection.controlY} 
                    ${connection.curveEndX} ${connection.curveEndY}`}
              stroke="#4F46E5"
              strokeWidth="3"
              fill="none"
              className="transition-all duration-300"
            />
            
            {/* デバッグ用: 各ポイントの可視化（必要に応じてコメントアウト） */}
            {/*
            <circle cx={connection.fromX} cy={connection.fromY} r="3" fill="green" opacity="0.7" />
            <circle cx={connection.lineEndX} cy={connection.lineEndY} r="3" fill="blue" opacity="0.7" />
            {connection.alignmentPointX && connection.alignmentPointY && (
              <circle cx={connection.alignmentPointX} cy={connection.alignmentPointY} r="3" fill="red" opacity="0.7" />
            )}
            <circle cx={connection.toX} cy={connection.toY} r="3" fill="orange" opacity="0.7" />
            */}
          </g>
        );
      }
      // 通常のベジェ曲線（sibling）の場合
      else if (connection.type === 'sibling' && connection.controlX && connection.controlY) {
        return (
          <path
            key={connection.id}
            d={`M ${connection.fromX} ${connection.fromY} Q ${connection.controlX} ${connection.controlY} ${connection.toX} ${connection.toY}`}
            stroke="#4F46E5"
            strokeWidth="3"
            fill="none"
            className="transition-all duration-300"
          />
        );
      }
      // 直線の場合
      else {
        return (
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
        );
      }
    })}
  </>
);

interface ExpandButtonProps {
  node: Node;
  getExpandButtonPosition: (node: Node) => { x: number; y: number } | null;
  shouldShowExpandButton: (node: Node) => boolean;
  onToggleChildrenVisibility: (nodeId: string) => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  node,
  getExpandButtonPosition,
  shouldShowExpandButton,
  onToggleChildrenVisibility,
}) => {
  if (!shouldShowExpandButton(node)) return null;

  const position = getExpandButtonPosition(node);
  if (!position) return null;

  return (
    <div
      className="absolute z-10"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(0, -50%)',
      }}
    >
      <button
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2 ${
          node.isCollapsed
            ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500'
            : 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleChildrenVisibility(node.id);
        }}
      >
        {node.isCollapsed ? (
          <div className="w-3 h-3 border-2 border-white rounded-full bg-white" />
        ) : (
          <div className="w-3 h-3 border-2 border-blue-500 rounded-full" />
        )}
      </button>
    </div>
  );
};

interface NavigationModeDisplayProps {
  navigationMode: boolean;
}

export const NavigationModeDisplay: React.FC<NavigationModeDisplayProps> = ({ navigationMode }) => {
  const { t } = useTranslation();

  if (!navigationMode) return null;

  return (
    <div className="absolute top-20 right-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl border border-blue-500/20 backdrop-blur-sm z-50">
      <div className="px-4 py-3 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
          <span className="text-lg font-bold tracking-wide">{t('mindMap.navigationMode')}</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-blue-100 uppercase tracking-wider">{t('mindMap.keyboard.movement')}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">↑↓←→</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.moveNode')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">Space</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.startEdit')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-green-200 uppercase tracking-wider">{t('mindMap.keyboard.add')}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-green-500/30 rounded text-xs font-mono">Tab</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.addChildNode')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-green-500/30 rounded text-xs font-mono">Enter</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.addSiblingNode')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-red-200 uppercase tracking-wider">{t('mindMap.keyboard.operations')}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-red-500/30 rounded text-xs font-mono">Del</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.deleteNode')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-500/30 rounded text-xs font-mono">Esc</kbd>
              <span className="text-white/90">{t('mindMap.keyboard.exitMode')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AICommandInputProps {
  showAICommand: boolean;
  aiPrompt: string;
  setAIPrompt: (prompt: string) => void;
  onHandleAICommand: () => void;
  onClose: () => void;
}

export const AICommandInput: React.FC<AICommandInputProps> = ({
  showAICommand,
  aiPrompt,
  setAIPrompt,
  onHandleAICommand,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!showAICommand) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[400px]">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">{t('mindMap.aiAssistant')}</span>
        </div>
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAIPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onHandleAICommand();
            if (e.key === 'Escape') onClose();
          }}
          placeholder={t('mindMap.aiCommandPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{t('mindMap.typeAiCommand')}</span>
          <span>{t('mindMap.escToCancel')}</span>
        </div>
      </div>
    </div>
  );
};

interface FloatingActionButtonProps {
  onShowAICommand: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onShowAICommand }) => (
  <div className="absolute bottom-6 right-6 z-40">
    <button
      onClick={onShowAICommand}
      className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-20 hover:scale-110"
    >
      <Plus className="w-6 h-6" />
    </button>
  </div>
);

interface ZoomDisplayProps {
  scale: number;
}

export const ZoomDisplay: React.FC<ZoomDisplayProps> = ({ scale }) => (
  <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50">
    <span className="text-sm font-medium text-gray-700">
      {Math.round(scale * 100)}%
    </span>
  </div>
);