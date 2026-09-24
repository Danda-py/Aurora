import React, { useState, useRef } from 'react';
import { useCMS } from './CMSContext';

interface BlockControlsWrapperProps {
  /** The block ID */
  blockId: string;
  /** The block's children content */
  children: React.ReactNode;
  /** Optional: additional class names for the wrapper */
  className?: string;
  /** Optional: whether the block is currently selected */
  isSelected?: boolean;
}

export const BlockControlsWrapper = ({
  blockId,
  children,
  className = '',
  isSelected = false
}: BlockControlsWrapperProps) => {
  const { state, dispatch } = useCMS();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Find the index of this block in the layout
  const blockIndex = state.layout.findIndex(block => block.id === blockId);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    // Store the block ID being dragged
    e.dataTransfer.setData('text/plain', blockId);
    setIsDragging(true);
    // Add a class to the dragged element for styling
    if (ref.current) {
      ref.current.classList.add('dragging');
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    if (ref.current) {
      ref.current.classList.remove('dragging');
    }
  };

  // Handle drag over (allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Visual feedback for drop target
    if (ref.current && !isDragging) {
      ref.current.classList.add('drop-target');
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    if (ref.current) {
      ref.current.classList.remove('drop-target');
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (ref.current) {
      ref.current.classList.remove('drop-target');
    }
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    if (draggedBlockId && draggedBlockId !== blockId) {
      const draggedIndex = state.layout.findIndex(b => b.id === draggedBlockId);
      const targetIndex = blockIndex;
      if (draggedIndex !== -1 && targetIndex !== -1) {
        dispatch({
          type: 'REORDER_BLOCKS',
          payload: { fromIndex: draggedIndex, toIndex: targetIndex }
        });
      }
    }
    setIsDragging(false);
  };

  // Handle delete block
  const handleDelete = () => {
    dispatch({
      type: 'DELETE_BLOCK',
      payload: { id: blockId }
    });
  };

  // Handle move up
  const handleMoveUp = () => {
    if (blockIndex > 0) {
      dispatch({
        type: 'REORDER_BLOCKS',
        payload: { fromIndex: blockIndex, toIndex: blockIndex - 1 }
      });
    }
  };

  // Handle move down
  const handleMoveDown = () => {
    if (blockIndex < state.layout.length - 1) {
      dispatch({
        type: 'REORDER_BLOCKS',
        payload: { fromIndex: blockIndex, toIndex: blockIndex + 1 }
      });
    }
  };

  // Handle style editor toggle
  const handleStyleToggle = () => {
    setShowStyleEditor(!showStyleEditor);
    // In a real implementation, this would open a style editor sidebar or modal
    console.log(`Toggle style editor for block ${blockId}`);
  };

  // Hover handlers
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Calculate transform for drag preview (optional)
  const dragTransform = isDragging ? 'scale(1.02)' : 'scale(1)';

  return (
    <div
      ref={ref}
      className={`relative group ${className} ${isSelected ? 'border-2 border-blue-500' : ''}
        ${isDragging ? 'opacity-80' : ''}
        ${isHovering || isDragging ? 'bg-gray-50' : ''}
        transition-all duration-200`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Block content */}
      <div className="relative p-4 min-h-[80px]">
        {children}
      </div>

      {/* Controls overlay - visible on hover or when dragging */}
      {isHovering || isDragging && (
        <div className="absolute top-0 right-0 flex flex-col items-end m-2 space-x-1">
          {/* Drag handle */}
          <div
            className="w-4 h-4 cursor-grip flex items-center justify-center text-gray-400"
            title="Trascina per spostare"
          >
            {/* Drag icon: three horizontal lines */}
            <div className="flex space-y-1">
              <div className="w-3 h-0.5 bg-gray-600" />
              <div className="w-3 h-0.5 bg-gray-600" />
              <div className="w-3 h-0.5 bg-gray-600" />
            </div>
          </div>

          {/* Move up button */}
          {blockIndex > 0 && (
            <button
              onClick={handleMoveUp}
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Sposta su"
            >
              ↑
            </button>
          )}

          {/* Move down button */}
          {blockIndex < state.layout.length - 1 && (
            <button
              onClick={handleMoveDown}
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Sposta giù"
            >
              ↓
            </button>
          )}

          {/* Style editor button */}
          <button
            onClick={handleStyleToggle}
            className={`w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded
              ${showStyleEditor ? 'bg-blue-50' : ''}`}
            title="Modifica stile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center text-sm text-red-600 hover:text-white hover:bg-red-600 rounded"
            title="Elimina blocco"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Style editor placeholder - in a real implementation this would be a sidebar or modal */}
      {showStyleEditor && (
        <div className="absolute right-12 top-0 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-gray-800">Stile Blocco</h3>
            <button
              onClick={handleStyleToggle}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Colore di sfondo
              <input
                type="color"
                className="mt-1 block w-full"
                // In a real implementation, this would update the block's style via context
                onChange={(e) => {
                  console.log('Background color changed:', e.target.value);
                  // Example: dispatch updating block style
                  /*
                  dispatch({
                    type: 'UPDATE_BLOCK',
                    payload: {
                      id: blockId,
                      updates: { style: { backgroundColor: e.target.value } }
                    }
                  });
                  */
                }}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Colore testo
              <input
                type="color"
                className="mt-1 block w-full"
                onChange={(e) => {
                  console.log('Text color changed:', e.target.value);
                }}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Rotazione bordi
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                className="mt-1 block w-full"
                // Default value would come from block's style
                onChange={(e) => {
                  console.log('Border radius changed:', e.target.value);
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};