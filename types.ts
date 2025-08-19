export interface FileNode {
  type: 'file';
  name: string;
}

export interface DirectoryNode {
  type: 'directory';
  name: string;
  children: FileSystemNode[];
}

export type FileSystemNode = FileNode | DirectoryNode;

export interface FileContentMap {
  [path: string]: string;
}

export interface AiChange {
  filePath: string;
  content: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'lyra' | 'kara' | 'system';
  content: string;
  changes?: AiChange[];
}
