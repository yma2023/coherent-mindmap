import { create } from 'zustand';
import { produce } from 'immer';
import { MindMap, MindMapNode, MindMapEdge, Comment, User } from '../types';

interface MindMapStore {
  currentMap: MindMap | null;
  maps: MindMap[];
  comments: Comment[];
  users: User[];
  isAILoading: boolean;
  selectedNodeId: string | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: number | null;
  
  // Actions
  setCurrentMap: (map: MindMap) => void;
  addNode: (node: MindMapNode) => void;
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: MindMapEdge) => void;
  deleteEdge: (edgeId: string) => void;
  addComment: (comment: Comment) => void;
  setUsers: (users: User[]) => void;
  setAILoading: (loading: boolean) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  markAsSaved: () => void;
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  currentMap: null,
  maps: [],
  comments: [],
  users: [],
  isAILoading: false,
  selectedNodeId: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,

  setCurrentMap: (map) => set({ currentMap: map }),

  addNode: (node) =>
    set(
      produce((state) => {
        if (state.currentMap) {
          state.currentMap.nodes.push(node);
          state.currentMap.updatedAt = Date.now();
          state.hasUnsavedChanges = true;
        }
      })
    ),

  updateNode: (nodeId, updates) =>
    set(
      produce((state) => {
        if (state.currentMap) {
          const nodeIndex = state.currentMap.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex !== -1) {
            Object.assign(state.currentMap.nodes[nodeIndex], updates);
            state.currentMap.updatedAt = Date.now();
            state.hasUnsavedChanges = true;
          }
        }
      })
    ),

  deleteNode: (nodeId) =>
    set(
      produce((state) => {
        if (state.currentMap) {
          state.currentMap.nodes = state.currentMap.nodes.filter((n) => n.id !== nodeId);
          state.currentMap.edges = state.currentMap.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          );
          state.currentMap.updatedAt = Date.now();
          state.hasUnsavedChanges = true;
        }
      })
    ),

  addEdge: (edge) =>
    set(
      produce((state) => {
        if (state.currentMap) {
          state.currentMap.edges.push(edge);
          state.currentMap.updatedAt = Date.now();
          state.hasUnsavedChanges = true;
        }
      })
    ),

  deleteEdge: (edgeId) =>
    set(
      produce((state) => {
        if (state.currentMap) {
          state.currentMap.edges = state.currentMap.edges.filter((e) => e.id !== edgeId);
          state.currentMap.updatedAt = Date.now();
          state.hasUnsavedChanges = true;
        }
      })
    ),

  addComment: (comment) =>
    set(
      produce((state) => {
        state.comments.push(comment);
      })
    ),

  setUsers: (users) => set({ users }),
  setAILoading: (loading) => set({ isAILoading: loading }),
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  markAsSaved: () => set({ hasUnsavedChanges: false, lastSavedAt: Date.now() }),
}));