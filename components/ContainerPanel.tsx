import React from 'react';
import { ContainerIcon } from './icons';

const ContainerPanel: React.FC = () => {
  return (
    <div className="text-xs text-gray-400 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2 text-gray-300">
          <h4 className="font-semibold">Running Instance</h4>
        </div>
        <div className="p-2 bg-black/30 rounded-md border border-cyan-400/10">
            <p className="text-gray-200 font-mono">my-app-container-1</p>
            <p className="text-green-400/80">Status: Running</p>
        </div>
        <button className="w-full mt-2 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-md text-xs transition-all duration-200 shadow-[0_0_8px_rgba(20,200,200,0.3)]">
            Start Service
        </button>
      </div>
      <div className="text-center text-gray-500 text-xs mt-2">
        <p className="mb-1">Distributed Workflow</p>
        <div className="flex justify-center items-center gap-2 mt-1">
            <button className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-700 rounded transition-colors">&lt;</button>
            <span className="font-mono">1 / 1</span>
            <button className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-700 rounded transition-colors">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default ContainerPanel;
