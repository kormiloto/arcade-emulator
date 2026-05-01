'use client';

import { useEffect, useState } from 'react';

interface EmulatorProps {
  core: string;
  gameUrl: string;
  gameName: string;
  onClose?: () => void;
}

export default function Emulator({ core, gameUrl, gameName, onClose }: EmulatorProps) {
  const [status, setStatus] = useState<'ready' | 'playing' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);

  const startEmulator = () => {
    setStatus('playing');
    
    const existingScript = document.getElementById('ejs-loader');
    if (existingScript) existingScript.remove();

    // ПРАВИЛНА ПАТЕКА ДО ПОДАТОЦИТЕ (Апсолутна URL)
    const dataPath = 'https://cdn.emulatorjs.org/stable/data/';
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;

    // Конфигурација според официјалната документација за стабилност
    const system = core === 'genesis_plus_gx' ? 'segaMD' : 'neogeo';
    (window as any).EJS_player = '#game-canvas';
    (window as any).EJS_core = core;
    (window as any).EJS_system = system;
    (window as any).EJS_gameUrl = proxyUrl;
    (window as any).EJS_pathtodata = dataPath; 
    (window as any).EJS_startOnLoaded = true;
    (window as any).EJS_DEBUG_XX = true; // За секој случај

    const script = document.createElement('script');
    script.id = 'ejs-loader';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    
    script.onerror = () => {
      setError('Грешка при поврзување со серверот за игри.');
      setStatus('error');
    };

    document.head.appendChild(script);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-20">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button 
          onClick={() => {
            if (onClose) onClose();
            window.location.reload(); 
          }} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold active:scale-95 transition-transform"
        >
          ЗАТВОРИ
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {status === 'ready' && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="text-7xl mb-8">🕹️</div>
            <button 
              onClick={startEmulator}
              className="px-16 py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-3xl shadow-[0_0_50px_rgba(37,99,235,0.4)] active:scale-95 transition-all"
            >
              ИГРАЈ
            </button>
            <p className="text-zinc-500 mt-8 text-sm tracking-widest uppercase">Спремно за мобилен и десктоп</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-red-500 p-8">
            <p className="text-xl font-bold mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-lg font-bold">ОСВЕЖИ</button>
          </div>
        )}

        <div 
          id="game-canvas" 
          className="w-full h-full"
          style={{ 
            display: status === 'playing' ? 'block' : 'none',
            backgroundColor: '#000',
            height: '100%'
          }}
        ></div>
        
        {status === 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center -z-10">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="text-zinc-600 text-sm font-medium animate-pulse">ВЧИТУВАЊЕ...</div>
          </div>
        )}
      </div>
    </div>
  );
}
