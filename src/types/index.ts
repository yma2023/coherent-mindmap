export interface NodeData {
  id: string;
  type: 'text' | 'image' | 'link' | 'task';
  content: string;
  parentId?: string;
  completed?: boolean;
  url?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export interface MindMapNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: 'smoothstep';
  animated?: boolean;
}

export interface MindMap {
  id: string;
  name: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  collaborators: string[];
}

export interface Comment {
  id: string;
  nodeId: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface AICommand {
  type: 'generate' | 'summarize' | 'augment';
  prompt: string;
  nodeId?: string;
  targetNodeId?: string;
}