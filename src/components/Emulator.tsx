'use client';

import { useEffect, useRef, useState } from 'react';

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
    
    // Чистење на претходни остатоци
    const existingScript = document.getElementById('ejs-loader');
    if (existingScript) existingScript.remove();

    // ГЛОБАЛНИ ПОСТАВКИ (Наједноставен можен формат)
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
    const system = core === 'genesis_plus_gx' ? 'segaMD' : 'neogeo';

    (window as any).EJS_player = '#game-canvas'; // Мора да биде ID
    (window as any).EJS_core = core;
    (window as any).EJS_gameUrl = proxyUrl;
    (window as any).EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';
    (window as any).EJS_startOnLoaded = true;

    const script = document.createElement('script');
    script.id = 'ejs-loader';
    script.src = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js';
    
    script.onerror = () => {
      setError('Грешка при вчитување на системот.');
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
            window.location.reload(); // Најсигурен начин да се сопре емулаторот
          }} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
        >
          ЗАТВОРИ
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {status === 'ready' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎮</div>
            <button 
              onClick={startEmulator}
              className="px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-2xl shadow-2xl animate-bounce"
            >
              ИГРАЈ
            </button>
            <p className="text-zinc-500 mt-6 text-sm">Спремно за стартување</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-red-500 p-8">
            <p className="text-xl font-bold mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-lg font-bold">ПРОБАЈ ПАК</button>
          </div>
        )}

        {/* Овој див е клучот. Мора да има фиксни димензии за некои прелистувачи */}
        <div 
          id="game-canvas" 
          className="w-full h-full"
          style={{ 
            display: status === 'playing' ? 'block' : 'none',
            minHeight: '100dvh' 
          }}
        ></div>
        
        {status === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="text-zinc-800 text-lg animate-pulse">Се вчитува...</div>
          </div>
        )}
      </div>
    </div>
  );
}
