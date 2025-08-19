import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      className="w-1 h-full cursor-col-resize bg-cyan-900/0 hover:bg-cyan-500 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#0ff]"
      onMouseDown={onMouseDown}
    />
  );
};

export default ResizeHandle;