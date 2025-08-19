import { DirectoryNode, FileContentMap } from '../types';

export const defaultFileSystem: DirectoryNode = {
  type: 'directory',
  name: 'root',
  children: [
    {
      type: 'directory',
      name: 'ASYNC',
      children: [
        { type: 'file', name: 'ajax-notes.md' },
        { type: 'file', name: 'xhr-notes.md' },
        { type: 'file', name: 'fetch-notes.md' },
      ],
    },
    {
      type: 'file',
      name: 'index.html',
    },
    {
      type: 'file',
      name: 'index.tsx',
    },
     {
      type: 'file',
      name: 'metadata.json',
    },
  ],
};

export const defaultFileContents: FileContentMap = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <style>
      body {
        font-family: sans-serif;
        background-color: #222;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  return <h1>Hello, AI Builder!</h1>;
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
`,
  'metadata.json': `{
  "name": "My New App",
  "description": "A web app created with the AI Web App Builder."
}`,
  'ASYNC/ajax-notes.md': `
# AJAX (Asynchronous JavaScript and XML)

AJAX is a traditional technique for creating asynchronous web applications. It uses a combination of:
- A browser built-in \`XMLHttpRequest\` object (to request data from a web server)
- JavaScript and HTML DOM (to display or use the data)

## Key Concepts
- **Asynchronous:** Allows the browser to continue functioning without waiting for the server's response.
- **XMLHttpRequest (XHR):** The core object used to make requests. Despite its name, AJAX can work with any data format, not just XML (JSON is more common today).
- **Event-based:** You typically handle the response in a callback function that fires when the request's state changes.

## Example (using XMLHttpRequest)
\`\`\`javascript
const xhr = new XMLHttpRequest();
const url = 'https://api.example.com/data';

xhr.open('GET', url, true); // true for asynchronous

xhr.onreadystatechange = function () {
  // readyState 4 means the request is done.
  // status 200 means "OK".
  if (xhr.readyState === 4 && xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    console.log(response);
  } else if (xhr.readyState === 4) {
    console.error('Error:', xhr.statusText);
  }
};

xhr.onerror = function () {
  console.error('Request failed');
};

xhr.send();
\`\`\`
`,
  'ASYNC/xhr-notes.md': `
# XMLHttpRequest (XHR)

\`XMLHttpRequest\` is the browser API that is the foundation of AJAX. It's a powerful tool for making HTTP requests from JavaScript. While modern applications often prefer the \`fetch()\` API for its simplicity, XHR offers more fine-grained control.

## Features
- **Progress Events:** Can monitor the progress of both uploads and downloads (\`onprogress\` event).
- **Request Timeouts:** Can set a timeout for the request.
- **Synchronous Requests:** Can make synchronous requests (though this is strongly discouraged as it blocks the main thread).
- **Wide Browser Support:** Supported by all modern and many older browsers.

## Example
This is the same as the AJAX example, as XHR is the technology that powers it.
\`\`\`javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.github.com/users/google', true);

xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    // Request was successful
    console.log(JSON.parse(xhr.response));
  } else {
    // We reached our target server, but it returned an error
    console.error('Request failed with status:', xhr.status);
  }
};

xhr.onerror = function () {
  // There was a connection error of some sort
  console.error('Network error');
};

xhr.send();
\`\`\`
`,
  'ASYNC/fetch-notes.md': `
# Fetch API

The Fetch API provides a modern, more powerful, and flexible interface for "fetching" resources across the network. It's a promise-based API, which makes handling asynchronous operations cleaner with \`then()\` chains or \`async/await\`.

## Key Differences from XHR
- **Promise-based:** Returns a Promise that resolves to the \`Response\` object.
- **Simpler API:** The basic usage is much more concise.
- **Not Abortable Natively (Initially):** Aborting a fetch request requires an \`AbortController\`, which is slightly more complex than XHR's \`.abort()\`.
- **Doesn't Reject on HTTP Errors:** A fetch() promise only rejects on network failure. It does **not** reject on HTTP error statuses (like 404 or 500). You must check the \`response.ok\` property or \`response.status\`.

## Example using async/await
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.github.com/users/google');

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Could not fetch data:', error);
  }
}

fetchData();
\`\`\`
`,
};