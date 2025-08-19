import React from 'react';
import { SettingsIcon } from './icons';

interface CustomInstructionsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  systemOrchestratorInstruction: string;
  onSystemOrchestratorChange: (value: string) => void;
  aiSupervisorInstruction: string;
  onAiSupervisorChange: (value: string) => void;
}

const CustomInstructionsPanel: React.FC<CustomInstructionsPanelProps> = ({
  isOpen,
  onToggle,
  systemOrchestratorInstruction,
  onSystemOrchestratorChange,
  aiSupervisorInstruction,
  onAiSupervisorChange,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
      onClick={onToggle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
    >
      <div
        className="neon-panel rounded-lg w-full max-w-2xl mx-auto p-6 flex flex-col gap-4 max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 id="instructions-title" className="text-xl font-bold text-cyan-200 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6" />
            <span>AI Agent Instructions</span>
          </h2>
          <button onClick={onToggle} className="text-2xl font-light text-gray-400 hover:text-white leading-none p-1">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <div>
              <label htmlFor="orchestrator" className="block text-sm font-medium text-cyan-300 mb-1">
                System Orchestrator
              </label>
              <p className="text-xs text-gray-400 mb-2">High-level instructions for planning and structuring the code.</p>
              <textarea
                id="orchestrator"
                value={systemOrchestratorInstruction}
                onChange={(e) => onSystemOrchestratorChange(e.target.value)}
                rows={6}
                className="w-full bg-black/50 border border-cyan-400/20 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="supervisor" className="block text-sm font-medium text-cyan-300 mb-1">
                AI Supervisor
              </label>
               <p className="text-xs text-gray-400 mb-2">Detailed instructions for code generation, style, and quality.</p>
              <textarea
                id="supervisor"
                value={aiSupervisorInstruction}
                onChange={(e) => onAiSupervisorChange(e.target.value)}
                rows={8}
                className="w-full bg-black/50 border border-cyan-400/20 rounded-md p-2 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
              />
            </div>
        </div>

        <div className="flex justify-end flex-shrink-0">
            <button
              onClick={onToggle}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-all duration-200 shadow-[0_0_8px_rgba(20,200,200,0.3)]"
            >
              Save & Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomInstructionsPanel;
