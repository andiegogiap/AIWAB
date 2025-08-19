
import React, { useMemo, useEffect, useRef } from 'react';
import * as Babel from '@babel/standalone';
import { marked } from 'marked';
import { FileContentMap } from '../types';

const markdownCss = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    line-height: 1.6;
    padding: 2em 4em;
    background-color: #fff;
    color: #24292e;
    margin: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    border-bottom: 1px solid #eaecef;
    padding-bottom: .3em;
  }
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    background-color: rgba(27,31,35,.05);
    border-radius: 6px;
    padding: .2em .4em;
    font-size: 85%;
  }
  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    word-wrap: normal;
  }
  pre code {
    padding: 0;
    margin: 0;
    background-color: transparent;
    border: 0;
    display: inline;
    max-width: auto;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
  }
  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: .25em solid #dfe2e5;
    margin-left: 0;
  }
  table { border-collapse: collapse; display: block; width: 100%; overflow: auto; }
  tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
  tr:nth-child(2n) { background-color: #f6f8fa; }
  th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  img { max-width: 100%; }
</style>
`;

const errorOverlayStyle = `
<style>
  #error-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(10, 0, 0, 0.9);
    color: white;
    font-family: 'Consolas', 'Menlo', 'monospace';
    padding: 2rem;
    z-index: 999999;
    overflow-y: auto;
    border: 4px solid #ff5555;
  }
  #error-overlay h1 {
    color: #ff5555;
    font-size: 1.5rem;
    margin-top: 0;
    border-bottom: 1px solid #ff5555;
    padding-bottom: 0.5rem;
  }
  #error-overlay pre {
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  #error-overlay b {
    color: #ff9999;
  }
</style>
`;

const errorListenerScript = `
<script>
  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  const handleError = (title, message) => {
    const existingOverlay = document.getElementById('error-overlay');
    if (existingOverlay) return; // Show only the first error
    document.body.innerHTML += \`
      <div id="error-overlay">
        \${errorOverlayStyle}
        <h1>\${escapeHtml(title)}</h1>
        <pre>\${escapeHtml(message)}</pre>
      </div>
    \`;
  }

  window.addEventListener('error', (event) => {
    const message = \`<b>Message:</b> \${event.message}\\n<b>File:</b> \${event.filename}\\n<b>Line:</b> \${event.lineno}, <b>Col:</b> \${event.colno}\`;
    handleError('Runtime Error', message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.stack : event.reason;
    handleError('Unhandled Promise Rejection', reason);
  });
</script>
`;


interface PreviewProps {
  files: FileContentMap;
  selectedFile: string;
}

const Preview: React.FC<PreviewProps> = ({ files, selectedFile }) => {
  const blobUrlsRef = useRef<string[]>([]);
  
  // Clean up blob URLs on unmount or when files change
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
      blobUrlsRef.current = [];
    };
  }, [files]);

  const srcDoc = useMemo(() => {
    // Revoke previous blobs before creating new ones
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];

    const fileContent = files[selectedFile];
    if (fileContent === undefined) {
      return '<html><body>Select a file to preview.</body></html>';
    }

    if (selectedFile.endsWith('.md')) {
        const htmlContent = marked.parse(fileContent);
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${markdownCss}</head><body>${htmlContent}</body></html>`;
    }

    if (selectedFile.endsWith('.html') && selectedFile !== 'index.html') {
      return fileContent;
    }

    // --- Full application preview logic ---
    const html = files['index.html'];
    if (!html) return `<html><body>Cannot generate preview: <strong>index.html</strong> not found.</body></html>`;

    const appImportMap: { imports: Record<string, string> } = {
        imports: {
            "react": "https://esm.sh/react@18.3.1",
            "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
            "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
            "@google/genai": "https://esm.sh/@google/genai",
            "marked": "https://esm.sh/marked@12.0.2",
        },
    };
    
    try {
        for (const [path, content] of Object.entries(files)) {
            if (/\.(t|j)sx?$/.test(path)) {
                const transformed = Babel.transform(content, {
                    presets: [['react', { runtime: 'automatic' }], 'typescript'],
                    filename: path,
                }).code;
                
                if (!transformed) throw new Error(`Babel transform failed for ${path}`);

                const blob = new Blob([transformed], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                blobUrlsRef.current.push(url);
                appImportMap.imports[`/${path}`] = url;
            } else if (path.endsWith('.css')) {
                 const cssModule = `
                    const css = \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                    const styleTagId = "style-${path.replace(/[^a-zA-Z0-9]/g, '-')}";
                    let style = document.getElementById(styleTagId);
                    if (!style) {
                      style = document.createElement('style');
                      style.id = styleTagId;
                      document.head.appendChild(style);
                    }
                    style.textContent = css;
                 `;
                 const blob = new Blob([cssModule], { type: 'text/javascript' });
                 const url = URL.createObjectURL(blob);
                 blobUrlsRef.current.push(url);
                 appImportMap.imports[`/${path}`] = url;
            }
        }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return `
        <html>
          <head>${errorOverlayStyle}</head>
          <body>
            <div id="error-overlay">
              <h1>Babel Transform Error</h1>
              <pre>${error.message}</pre>
            </div>
          </body>
        </html>`;
    }

    const targetScript = /<script\s+type="module"\s+src="\/index.tsx"><\/script>/;
    if (!targetScript.test(html)) {
        return `<html><body>Cannot inject preview script: <strong>&lt;script type="module" src="/index.tsx"&gt;&lt;/script&gt;</strong> not found in index.html.</body></html>`;
    }
    
    const finalHtml = html.replace(
        targetScript,
        `
        <script type="importmap">${JSON.stringify(appImportMap)}</script>
        <script type="module">
            try {
                // Dynamically import the entry point
                await import('/index.tsx');
            } catch (e) {
                // Catch static import errors
                const error = e instanceof Error ? e : new Error(String(e));
                handleError('Import Error', error.stack || error.message);
            }
        </script>
        `
    );

    return finalHtml.replace('</head>', `${errorListenerScript}</head>`);
  }, [files, selectedFile]);

  return (
    <iframe
      key={JSON.stringify(files)} // Re-render iframe if ANY file changes
      srcDoc={srcDoc}
      title="Preview"
      sandbox="allow-scripts allow-modals allow-same-origin"
      className="w-full h-full bg-white"
    />
  );
};

export default Preview;
