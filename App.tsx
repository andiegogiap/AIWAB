import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileContentMap, DirectoryNode, AiChange, FileSystemNode } from './types';
import { defaultFileContents, defaultFileSystem } from './utils/file-system';
import SideBar from './components/SideBar';
import MonacoEditor from './components/MonacoEditor';
import Preview from './components/Preview';
import AIAssistantPanel from './components/AILogPanel';
import ResizeHandle from './components/ResizeHandle';
import HorizontalResizeHandle from './components/HorizontalResizeHandle';
import GlowingOrbMenu from './components/GlowingOrbMenu';
import CustomInstructionsPanel from './components/CustomInstructionsPanel';

const DEFAULT_ORCHESTRATOR_INSTRUCTION = `You are an elite software architect. Before generating code, analyze the user's request and existing file structure. Identify the core intent. Prioritize creating modular, reusable components. If new files are needed, create them in logical directories. Ensure all code changes are cohesive and maintain the project's integrity. Your goal is to not just fulfill the request, but to improve the overall quality of the codebase with each interaction.`;
const DEFAULT_SUPERVISOR_INSTRUCTION = `You are a world-class senior frontend engineer specializing in React, TypeScript, and modern web standards. Your responses must be in the requested JSON format. The code you write must be clean, performant, accessible (using ARIA attributes where appropriate), and responsive. Add comments to explain complex logic. When creating new components, ensure they are self-contained and easily testable. Always use full, complete file content in your changes. Do not use placeholders or omit existing code. The user's currently selected file is "{selectedFile}".`;


const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<DirectoryNode>(defaultFileSystem);
  const [fileContents, setFileContents] = useState<FileContentMap>(defaultFileContents);
  const [selectedFile, setSelectedFile] = useState<string>('index.tsx');

  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [editorPaneWidth, setEditorPaneWidth] = useState(50);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  
  const isResizingSidebar = useRef(false);
  const isResizingEditorPane = useRef(false);
  const isResizingBottomPanel = useRef(false);

  const [isInstructionsPanelOpen, setIsInstructionsPanelOpen] = useState(false);
  const [systemOrchestratorInstruction, setSystemOrchestratorInstruction] = useState(DEFAULT_ORCHESTRATOR_INSTRUCTION);
  const [aiSupervisorInstruction, setAiSupervisorInstruction] = useState(DEFAULT_SUPERVISOR_INSTRUCTION);

  const editorPreviewContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setFileContents(prev => ({ ...prev, [selectedFile]: value }));
  }, [selectedFile]);

  const handleAiUpdate = useCallback((changes: AiChange[]) => {
    const currentFilePaths = Object.keys(fileContents);

    setFileContents(prevContents => {
        const newContents = { ...prevContents };
        changes.forEach(change => {
            newContents[change.filePath] = change.content;
        });
        return newContents;
    });

    const newFileChanges = changes.filter(c => !currentFilePaths.includes(c.filePath));
    if (newFileChanges.length > 0) {
        setFileSystem(prevFileSystem => {
            const newFileSystem = JSON.parse(JSON.stringify(prevFileSystem)); // Deep copy

            newFileChanges.forEach(change => {
                const pathParts = change.filePath.split('/').filter(Boolean);
                let currentNode: DirectoryNode = newFileSystem;
                
                const fileName = pathParts.pop();
                if (!fileName) return;

                for (const part of pathParts) {
                    const nextNode = currentNode.children.find(
                        (child: FileSystemNode) => child.type === 'directory' && child.name === part
                    ) as DirectoryNode | undefined;
                    if (nextNode) {
                        currentNode = nextNode;
                    } else {
                        console.warn(`Directory path for ${change.filePath} not found. Adding to root.`);
                        currentNode = newFileSystem;
                        break;
                    }
                }

                const fileExists = currentNode.children.some(
                    (child: FileSystemNode) => child.name === fileName
                );

                if (!fileExists) {
                    currentNode.children.push({ type: 'file', name: fileName });
                    currentNode.children.sort((a: FileSystemNode, b: FileSystemNode) => {
                        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                        return a.name.localeCompare(b.name);
                    });
                }
            });

            return newFileSystem;
        });
        // Select the first new file created
        setSelectedFile(newFileChanges[0].filePath);
    }
  }, [fileContents]);


  const handleSidebarResize = useCallback((e: MouseEvent) => {
    if (isResizingSidebar.current) {
      requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth > 150 && newWidth < window.innerWidth - 300) {
            setSidebarWidth(newWidth);
        }
      });
    }
  }, []);

  const handleEditorPaneResize = useCallback((e: MouseEvent) => {
    if (isResizingEditorPane.current && editorPreviewContainerRef.current) {
      requestAnimationFrame(() => {
        const containerRect = editorPreviewContainerRef.current!.getBoundingClientRect();
        const newEditorWidth = e.clientX - containerRect.left;
        const newEditorWidthPercent = (newEditorWidth / containerRect.width) * 100;

        if (newEditorWidthPercent > 15 && newEditorWidthPercent < 85) {
          setEditorPaneWidth(newEditorWidthPercent);
        }
      });
    }
  }, []);

  const handleBottomPanelResize = useCallback((e: MouseEvent) => {
    if (isResizingBottomPanel.current) {
      requestAnimationFrame(() => {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 100 && newHeight < window.innerHeight - 150) {
            setBottomPanelHeight(newHeight);
        }
      });
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingSidebar.current = false;
    isResizingEditorPane.current = false;
    isResizingBottomPanel.current = false;
    window.removeEventListener('mousemove', handleSidebarResize);
    window.removeEventListener('mousemove', handleEditorPaneResize);
    window.removeEventListener('mousemove', handleBottomPanelResize);
    window.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleSidebarResize, handleEditorPaneResize, handleBottomPanelResize]);

  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleSidebarResize);
        window.removeEventListener('mousemove', handleEditorPaneResize);
        window.removeEventListener('mousemove', handleBottomPanelResize);
        window.removeEventListener('mouseup', stopResizing);
    };
  }, [handleSidebarResize, handleEditorPaneResize, handleBottomPanelResize, stopResizing]);


  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleSidebarResize);
    window.addEventListener('mouseup', stopResizing);
  }, [handleSidebarResize, stopResizing]);

  const startEditorPaneResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingEditorPane.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleEditorPaneResize);
    window.addEventListener('mouseup', stopResizing);
  }, [handleEditorPaneResize, stopResizing]);
  
  const startBottomPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingBottomPanel.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleBottomPanelResize);
    window.addEventListener('mouseup', stopResizing);
  }, [handleBottomPanelResize, stopResizing]);

  return (
    <div className="flex flex-col h-screen w-screen text-white overflow-hidden p-1.5 gap-1.5">
      <div className="flex flex-grow min-h-0 gap-1.5">
        <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0">
          <SideBar
            fileSystem={fileSystem}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            onOpenSettings={() => setIsInstructionsPanelOpen(true)}
          />
        </div>
        <ResizeHandle onMouseDown={startSidebarResize} />
        <div className="flex flex-col flex-grow min-w-0 gap-1.5">
            <div ref={editorPreviewContainerRef} className="flex-grow flex min-h-0 neon-panel rounded-lg overflow-hidden">
                <div style={{ width: `${editorPaneWidth}%` }} className="flex flex-col min-w-0">
                    <div className="bg-black/30 px-3 py-1.5 border-b border-cyan-400/20 text-sm text-cyan-200 flex-shrink-0">
                        {selectedFile}
                    </div>
                    <div className="flex-grow relative">
                      <div className="absolute inset-0">
                        <MonacoEditor 
                            filePath={selectedFile} 
                            value={fileContents[selectedFile] || ''} 
                            onChange={handleFileChange} 
                        />
                      </div>
                    </div>
                </div>
                <ResizeHandle onMouseDown={startEditorPaneResize} />
                <div className="flex-grow min-w-0">
                  <Preview files={fileContents} selectedFile={selectedFile} />
                </div>
            </div>
            <HorizontalResizeHandle onMouseDown={startBottomPanelResize} />
            <div style={{ height: `${bottomPanelHeight}px` }} className="flex-shrink-0">
                <AIAssistantPanel
                    onAiUpdate={handleAiUpdate}
                    files={fileContents}
                    selectedFile={selectedFile}
                    customSystemInstruction={aiSupervisorInstruction}
                />
            </div>
        </div>
      </div>
      <GlowingOrbMenu />
      <CustomInstructionsPanel
        isOpen={isInstructionsPanelOpen}
        onToggle={() => setIsInstructionsPanelOpen(!isInstructionsPanelOpen)}
        systemOrchestratorInstruction={systemOrchestratorInstruction}
        onSystemOrchestratorChange={setSystemOrchestratorInstruction}
        aiSupervisorInstruction={aiSupervisorInstruction}
        onAiSupervisorChange={setAiSupervisorInstruction}
      />
    </div>
  );
};

export default App;
