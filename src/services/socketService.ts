import { io, Socket } from 'socket.io-client';
import { MindMapNode, MindMapEdge, Comment } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    this.socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/', {
      query: { userId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Node operations
  onNodeAdded(callback: (node: MindMapNode) => void) {
    this.socket?.on('node-added', callback);
  }

  onNodeUpdated(callback: (nodeId: string, updates: Partial<MindMapNode>) => void) {
    this.socket?.on('node-updated', callback);
  }

  onNodeDeleted(callback: (nodeId: string) => void) {
    this.socket?.on('node-deleted', callback);
  }

  emitNodeAdded(node: MindMapNode) {
    this.socket?.emit('add-node', node);
  }

  emitNodeUpdated(nodeId: string, updates: Partial<MindMapNode>) {
    this.socket?.emit('update-node', { nodeId, updates });
  }

  emitNodeDeleted(nodeId: string) {
    this.socket?.emit('delete-node', nodeId);
  }

  // Edge operations
  onEdgeAdded(callback: (edge: MindMapEdge) => void) {
    this.socket?.on('edge-added', callback);
  }

  emitEdgeAdded(edge: MindMapEdge) {
    this.socket?.emit('add-edge', edge);
  }

  // Comments
  onCommentAdded(callback: (comment: Comment) => void) {
    this.socket?.on('comment-added', callback);
  }

  emitCommentAdded(comment: Comment) {
    this.socket?.emit('add-comment', comment);
  }

  // AI operations
  emitAIRequest(command: { type: string; prompt: string; nodeId?: string }) {
    this.socket?.emit('ai-request', command);
  }

  onAIResponse(callback: (response: any) => void) {
    this.socket?.on('ai-response', callback);
  }
}

export const socketService = new SocketService();