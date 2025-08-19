import React from 'react';
import { GithubIcon } from './icons';

const GithubPanel: React.FC = () => {
  return (
    <div className="text-sm text-gray-400 flex flex-col items-center justify-center h-full text-center">
      <GithubIcon className="w-8 h-8 mb-2 text-gray-500"/>
      <p className="font-semibold text-gray-300">GitHub Integration</p>
      <p className="text-xs mt-1">Connect repositories to manage code directly from the IDE.</p>
      <button className="w-full mt-4 text-center bg-gray-700/50 hover:bg-gray-600 text-white font-bold px-3 py-1.5 rounded-md text-xs transition-all duration-200">
          Connect to GitHub
      </button>
    </div>
  );
};

export default GithubPanel;
