import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface MonacoEditorProps {
  filePath: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

const getLanguage = (filePath: string) => {
    if (filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'plaintext';
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ filePath, value, onChange }) => {
  return (
    <Editor
      height="100%"
      language={getLanguage(filePath)}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default MonacoEditor;