import React, { useState, useCallback, useRef, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import { DirectoryNode } from '../types';
import HorizontalResizeHandle from './HorizontalResizeHandle';
import ContainerPanel from './ContainerPanel';
import GithubPanel from './GithubPanel';
import { AddFileIcon, AddFolderIcon, RefreshIcon, UploadIcon, DownloadIcon, ContainerIcon, GithubIcon, SettingsIcon } from './icons';

interface SideBarProps {
  fileSystem: DirectoryNode;
  selectedFile: string;
  onSelectFile: (path: string) => void;
  onOpenSettings: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ fileSystem, selectedFile, onSelectFile, onOpenSettings }) => {
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [activeTab, setActiveTab] = useState<'containers' | 'github'>('containers');
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !sidebarRef.current) return;
    requestAnimationFrame(() => {
        const sidebarRect = sidebarRef.current!.getBoundingClientRect();
        const newHeight = sidebarRect.bottom - e.clientY;
        if (newHeight > 70 && newHeight < sidebarRect.height - 150) {
            setBottomPanelHeight(newHeight);
        }
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div ref={sidebarRef} className="h-full neon-panel rounded-lg text-white flex flex-col overflow-hidden">
      <div className="p-2 border-b border-cyan-400/20 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-cyan-200">Explorer</h2>
        <div className="flex items-center gap-1.5 text-cyan-300">
            <button className="p-1 rounded-md hover:bg-cyan-400/20" title="New File"><AddFileIcon className="w-4 h-4"/></button>
            <button className="p-1 rounded-md hover:bg-cyan-400/20" title="New Folder"><AddFolderIcon className="w-4 h-4"/></button>
            <button className="p-1 rounded-md hover:bg-cyan-400/20" title="Refresh"><RefreshIcon className="w-4 h-4"/></button>
            <button className="p-1 rounded-md hover:bg-cyan-400/20" title="Upload Project (Zip)"><UploadIcon className="w-4 h-4"/></button>
            <button className="p-1 rounded-md hover:bg-cyan-400/20" title="Download Project (Zip)"><DownloadIcon className="w-4 h-4"/></button>
            <div className="w-px h-4 bg-cyan-400/20 mx-1"></div>
            <button onClick={onOpenSettings} className="p-1 rounded-md hover:bg-cyan-400/20" title="AI Settings"><SettingsIcon className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto min-h-0">
        <FileExplorer
          fileSystem={fileSystem}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      </div>
      <HorizontalResizeHandle onMouseDown={startResize} />
      <div style={{ height: `${bottomPanelHeight}px` }} className="flex-shrink-0 flex flex-col min-h-0">
        <div className="flex-shrink-0 flex items-end gap-1 px-2 border-b border-cyan-400/20">
            <button 
                onClick={() => setActiveTab('containers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-md border-b-2 ${activeTab === 'containers' ? 'text-cyan-200 border-cyan-300' : 'text-gray-400 border-transparent hover:bg-cyan-400/10'}`}
            >
                <ContainerIcon className="w-4 h-4" />
                <span>Containers</span>
            </button>
            <button 
                onClick={() => setActiveTab('github')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-md border-b-2 ${activeTab === 'github' ? 'text-cyan-200 border-cyan-300' : 'text-gray-400 border-transparent hover:bg-cyan-400/10'}`}
            >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
            {activeTab === 'containers' && <ContainerPanel />}
            {activeTab === 'github' && <GithubPanel />}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
