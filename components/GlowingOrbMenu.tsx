import React, { useState } from 'react';

const GlowingOrbMenu: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = ['Explorer', 'Editor', 'Preview', 'AI Assistant'];

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
                    }
                }
                .orb {
                    animation: pulse 2.5s infinite;
                }
            `}</style>
            <div className="fixed bottom-5 right-5 z-50">
                <div className="relative flex flex-col items-center">
                    {isMenuOpen && (
                        <div 
                            className="absolute bottom-full mb-4 w-48 bg-black/80 backdrop-blur-md border border-cyan-400/30 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] p-2 flex flex-col gap-1 transition-all"
                            style={{
                                transform: isMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                                opacity: isMenuOpen ? 1 : 0,
                            }}
                        >
                           {menuItems.map(item => (
                               <button key={item} className="text-left w-full px-3 py-1.5 text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100 rounded-md transition-all duration-200">
                                   {item}
                               </button>
                           ))}
                           <div className="w-full h-px bg-cyan-400/20 my-1"/>
                           <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="text-center w-full px-3 py-1 text-xs text-gray-400 hover:bg-gray-700/50 rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="orb w-16 h-16 rounded-full bg-cyan-500/50 flex items-center justify-center border-2 border-cyan-300 shadow-[0_0_20px_#0ff,inset_0_0_10px_#0ff] transition-transform hover:scale-110"
                        aria-label="Toggle quick navigation menu"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default GlowingOrbMenu;
