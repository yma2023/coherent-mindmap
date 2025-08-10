import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, MoreHorizontal, CheckSquare, Square, Link, Image } from 'lucide-react';
import { NodeData } from '../../types';

interface TextNodeProps extends NodeProps {
  data: NodeData;
}

export const TextNode: React.FC<TextNodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsEditing(false);
    // TODO: Update node content via store
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setContent(data.content);
    }
  }, [handleSubmit, data.content]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const getNodeIcon = () => {
    switch (data.type) {
      case 'task':
        return data.completed ? <CheckSquare className="w-4 h-4 text-green-500" /> : <Square className="w-4 h-4 text-gray-400" />;
      case 'link':
        return <Link className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`
      relative bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[150px] max-w-[300px]
      ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1">
            {getNodeIcon()}
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyPress}
                className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
              />
            ) : (
              <span
                className="flex-1 text-sm font-medium text-gray-900 cursor-pointer"
                onDoubleClick={handleDoubleClick}
              >
                {data.content || 'Untitled Node'}
              </span>
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {data.type === 'image' && data.imageUrl && (
          <div className="mb-2">
            <img 
              src={data.imageUrl} 
              alt="Node attachment" 
              className="w-full h-20 object-cover rounded"
            />
          </div>
        )}

        {data.type === 'link' && data.url && (
          <div className="mb-2">
            <a 
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs truncate block"
            >
              {data.url}
            </a>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(data.updatedAt).toLocaleDateString()}</span>
          <button className="hover:text-blue-600 transition-colors">
            <MessageSquare className="w-3 h-3" />
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
};