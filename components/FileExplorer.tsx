import React from 'react';
import { DirectoryNode, FileSystemNode } from '../types';
import { FolderIcon, FileIcon, ReactIcon, HtmlIcon, JsonIcon, MarkdownIcon } from './icons';

interface FileExplorerProps {
  fileSystem: DirectoryNode;
  selectedFile: string;
  onSelectFile: (path: string) => void;
  basePath?: string;
}

const getIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx')) return <ReactIcon className="w-4 h-4 text-cyan-400" />;
    if (fileName.endsWith('.html')) return <HtmlIcon className="w-4 h-4 text-orange-400" />;
    if (fileName.endsWith('.json')) return <JsonIcon className="w-4 h-4 text-yellow-400" />;
    if (fileName.endsWith('.md')) return <MarkdownIcon className="w-4 h-4 text-gray-400" />;
    return <FileIcon className="w-4 h-4" />;
}

const FileSystemEntry: React.FC<{
  node: FileSystemNode;
  selectedFile: string;
  onSelectFile: (path: string) => void;
  path: string;
}> = ({ node, selectedFile, onSelectFile, path }) => {
  if (node.type === 'directory') {
    return (
      <div className="text-sm">
        <div className="flex items-center gap-2 p-1 text-gray-300">
          <FolderIcon className="w-4 h-4 text-cyan-300/70"/>
          <span>{node.name}</span>
        </div>
        <div className="pl-4">
          {node.children.map((child) => (
            <FileSystemEntry
              key={child.name}
              node={child}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              path={`${path}/${child.name}`}
            />
          ))}
        </div>
      </div>
    );
  }

  const isSelected = selectedFile === path;
  return (
    <button
      onClick={() => onSelectFile(path)}
      className={`w-full text-left flex items-center gap-2 p-1.5 rounded-md transition-all duration-200 ${
        isSelected ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/50' : 'hover:bg-cyan-400/10 text-gray-400 hover:text-gray-200'
      }`}
    >
      {getIcon(node.name)}
      <span>{node.name}</span>
    </button>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, selectedFile, onSelectFile }) => {
  return (
    <div className="p-2 space-y-1">
      {fileSystem.children.map((node) => (
        <FileSystemEntry
          key={node.name}
          node={node}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          path={node.name}
        />
      ))}
    </div>
  );
};

export default FileExplorer;