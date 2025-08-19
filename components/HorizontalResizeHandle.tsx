import React from 'react';

interface HorizontalResizeHandleProps {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const HorizontalResizeHandle: React.FC<HorizontalResizeHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      className="w-full h-1.5 cursor-row-resize bg-cyan-900/0 hover:bg-cyan-500 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#0ff]"
      onMouseDown={onMouseDown}
    />
  );
};

export default HorizontalResizeHandle;