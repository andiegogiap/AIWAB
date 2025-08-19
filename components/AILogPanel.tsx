import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AiChange, FileContentMap, ChatMessage } from '../types';
import { SendIcon, UserIcon, WandIcon } from './icons';

interface AIAssistantPanelProps {
    onAiUpdate: (changes: AiChange[]) => void;
    files: FileContentMap;
    selectedFile: string;
    customSystemInstruction?: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type Agent = 'lyra' | 'kara';

const agentConfig = {
    lyra: {
        name: 'Lyra',
        description: 'Balanced',
        model: 'gemini-2.5-flash',
        systemInstruction: `You are Lyra, a senior frontend engineer. Your task is to help a user modify their web application based on their request. You are detail-oriented and provide comprehensive solutions. The user's files are provided in a JSON object. The currently active file is "{selectedFile}". Analyze the user's request and the provided file contents. You MUST respond with a JSON object that strictly adheres to the provided schema. The JSON object should contain an array of "changes", where each change object specifies the "filePath" (which can be a new or existing file) and the complete new "content" for that file. Only include files that need to be changed. If no files need to change, return an empty array of changes. Along with the changes, provide a short, conversational "summary" of what you did.`
    },
    kara: {
        name: 'Kara',
        description: 'Efficient',
        model: 'gemini-2.5-flash',
        systemInstruction: `You are Kara, a fast and efficient coding assistant. Your task is to help a user modify their web application based on their request. You prioritize getting to a working solution quickly. The user's files are provided in a JSON object. The currently active file is "{selectedFile}". Analyze the user's request and the provided file contents. You MUST respond with a JSON object that strictly adheres to the provided schema. The JSON object should contain an array of "changes", where each change object specifies the "filePath" (which can be a new or existing file) and the complete new "content" for that file. Only include files that need to be changed. If no files need to change, return an empty array of changes. Along with the changes, provide a short, conversational "summary" of what you did.`
    }
};

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onAiUpdate, files, selectedFile, customSystemInstruction }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent>('lyra');
    const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());
    
    const historyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleApplyChanges = (messageId: number, changes: AiChange[]) => {
        onAiUpdate(changes);
        setAppliedChanges(prev => new Set(prev).add(messageId));
    };

    const handleGenerate = async (promptOverride?: string) => {
        const currentPrompt = promptOverride || prompt;
        if (!currentPrompt.trim()) return;

        setIsLoading(true);
        const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: currentPrompt };
        setHistory(prev => [...prev, userMessage]);
        if (!promptOverride) {
            setPrompt('');
        }

        const agent = agentConfig[selectedAgent];
        
        const systemInstruction = customSystemInstruction
            ? customSystemInstruction.replace('{selectedFile}', selectedFile)
            : agent.systemInstruction.replace('{selectedFile}', selectedFile);

        const fullPrompt = `User request: "${currentPrompt}"\n\nCurrent files:\n${JSON.stringify(files, null, 2)}`;
        
        try {
            const response = await ai.models.generateContent({
                model: agent.model,
                contents: fullPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            changes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        filePath: { type: Type.STRING },
                                        content: { type: Type.STRING },
                                    },
                                    required: ["filePath", "content"],
                                },
                            },
                        },
                        required: ["summary", "changes"],
                    },
                },
            });
            
            const aiResponseText = response.text;
            const parsed = JSON.parse(aiResponseText);
            
            const aiMessage: ChatMessage = {
                id: Date.now() + 1,
                role: selectedAgent,
                content: parsed.summary || "Here are the changes I've prepared.",
                changes: parsed.changes || []
            };
            setHistory(prev => [...prev, aiMessage]);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const systemMessage: ChatMessage = { 
                id: Date.now() + 1,
                role: 'system', 
                content: `Error: ${errorMessage}` 
            };
            setHistory(prev => [...prev, systemMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestTemplates = () => {
        const templatePrompt = "Suggest three diverse, ready-to-go web application templates that I can build. For each template, provide a 'name' and a one-sentence 'description'. I will then ask you to generate the code for one of them.";
        handleGenerate(templatePrompt);
    };

    const handleGenerateSpa = (type: 'ajax' | 'fetch') => {
        let promptText = '';
        let fileName = '';
        switch (type) {
            case 'ajax':
                fileName = 'ajax-xhr-example.html';
                promptText = `Generate a new, single file SPA named '${fileName}' that demonstrates a simple AJAX request using XMLHttpRequest to fetch data from 'https://jsonplaceholder.typicode.com/todos/1'. The file must be self-contained with HTML, CSS for basic styling, and JavaScript. The app should display a 'loading' message, then the fetched data or an error message.`;
                break;
            case 'fetch':
                fileName = 'fetch-example.html';
                promptText = `Generate a new, single file SPA named '${fileName}' that demonstrates a simple fetch() request to 'https://jsonplaceholder.typicode.com/todos/1'. The file must be self-contained with HTML, CSS for basic styling, and modern JavaScript (async/await). The app should display a 'loading' message, then the fetched data or an error message.`;
                break;
        }
        const finalPrompt = `${promptText} Ensure your response contains a change object for the new file '${fileName}'.`;
        handleGenerate(finalPrompt);
    };

    const handleApiInfo = () => {
        const promptText = "Explain best practices for consuming REST APIs on the frontend. Cover topics like endpoint usage, handling different HTTP methods (GET, POST), authentication (e.g., API keys, tokens), error handling, and CORS. Do not generate any file changes; the 'changes' array in your JSON response must be empty.";
        handleGenerate(promptText);
    };

    const AgentIcon = ({ agent }: { agent: ChatMessage['role'] }) => {
       if (agent !== 'lyra' && agent !== 'kara') return null;
       const agentColor = agent === 'lyra' ? 'bg-purple-500' : 'bg-teal-500';
       return (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${agentColor}`}>
                <WandIcon className="w-5 h-5 text-white" />
            </div>
        );
    }
    
    const actionButtonStyles = "px-2 py-1 rounded-md font-semibold bg-cyan-600/50 text-cyan-200 hover:bg-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

    return (
        <div className="h-full flex flex-col neon-panel rounded-lg text-sm text-gray-200 overflow-hidden">
            <div className="p-2 border-b border-cyan-400/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-cyan-200">AI Assistant</h3>
                    <div className="flex items-center gap-2 bg-black/30 rounded-md p-1">
                        {(['lyra', 'kara'] as Agent[]).map(agent => (
                            <button key={agent} 
                                    onClick={() => setSelectedAgent(agent)}
                                    className={`px-2 py-1 text-xs rounded-md transition-all duration-200 font-semibold ${
                                        selectedAgent === agent 
                                        ? (agent === 'lyra' ? 'bg-purple-500 text-black shadow-[0_0_5px_rgba(192,132,252,0.5)]' : 'bg-teal-500 text-black shadow-[0_0_5px_rgba(45,212,191,0.5)]')
                                        : (agent === 'lyra' ? 'text-purple-300 hover:bg-purple-500/20' : 'text-teal-300 hover:bg-teal-500/20')
                                    }`}>
                                {agentConfig[agent].name} ({agentConfig[agent].description})
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex items-center gap-2 mt-2 pt-2 border-t border-cyan-400/10 text-xs">
                    <span className="font-semibold text-cyan-300/80 shrink-0">Actions:</span>
                    <button onClick={handleSuggestTemplates} disabled={isLoading} className={actionButtonStyles} title="Have the AI suggest some application templates to build.">Suggest Templates</button>
                    <button onClick={() => handleGenerateSpa('ajax')} disabled={isLoading} className={actionButtonStyles} title="Generate an HTML file with an AJAX/XHR example.">AJAX/XHR SPA</button>
                    <button onClick={() => handleGenerateSpa('fetch')} disabled={isLoading} className={actionButtonStyles} title="Generate an HTML file with a Fetch API example.">Fetch SPA</button>
                    <button onClick={handleApiInfo} disabled={isLoading} className={actionButtonStyles} title="Get information about API best practices.">API Info</button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 space-y-4">
                {history.length === 0 && (
                    <div className="text-center text-cyan-700 pt-10">
                        <WandIcon className="w-10 h-10 mx-auto mb-2" />
                        <p>Select an agent and start chatting to modify your app.</p>
                    </div>
                )}
                {history.map((entry) => (
                    <div key={entry.id} className={`flex items-start max-w-full ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {entry.role !== 'user' && <AgentIcon agent={entry.role} />}
                        <div className={`p-3 rounded-lg max-w-[85%] flex flex-col border ${
                             entry.role === 'user' ? 'bg-pink-600/20 border-pink-400/30 text-white rounded-br-none ml-10' :
                             entry.role === 'system' ? 'bg-red-500/80 w-full text-center text-white border-red-400/30' :
                             (entry.role === 'lyra' ? 'bg-purple-600/20 border-purple-400/30' : 'bg-teal-600/20 border-teal-400/30') + ' rounded-bl-none mr-10'
                        }`}>
                            <div className="whitespace-pre-wrap">{entry.content}</div>
                            {entry.changes && entry.changes.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-cyan-400/20">
                                    <p className="text-xs font-semibold mb-1">{entry.changes.length} file change(s) suggested:</p>
                                    <ul className="text-xs list-disc pl-5">
                                        {entry.changes.map(c => <li key={c.filePath} className="font-mono">{c.filePath}</li>)}
                                    </ul>
                                    <button
                                        onClick={() => handleApplyChanges(entry.id, entry.changes!)}
                                        disabled={appliedChanges.has(entry.id)}
                                        className="mt-2 w-full text-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded-md text-xs transition-all duration-200 shadow-[0_0_8px_rgba(20,200,200,0.3)]"
                                    >
                                        {appliedChanges.has(entry.id) ? 'Applied' : 'Apply Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                        {entry.role === 'user' && (
                             <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center ml-3 flex-shrink-0">
                                 <UserIcon className="w-5 h-5 text-white" />
                             </div>
                        )}
                    </div>
                ))}
                <div ref={historyEndRef} />
            </div>

            <div className="p-2 border-t border-cyan-400/20 flex-shrink-0">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                            }
                        }}
                        placeholder={`Chat with ${agentConfig[selectedAgent].name}...`}
                        className="w-full bg-black/50 border border-cyan-400/20 rounded-md p-2 pr-10 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleGenerate()}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-black disabled:text-gray-400 transition-all duration-200 disabled:cursor-not-allowed"
                        aria-label="Send prompt"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantPanel;
