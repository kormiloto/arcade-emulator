'use client';

import { useEffect, useRef, useState } from 'react';

interface EmulatorProps {
  core: string;
  gameUrl: string;
  gameName: string;
  onClose?: () => void;
}

export default function Emulator({ core, gameUrl, gameName, onClose }: EmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'playing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[Emulator]: ${msg}`);
    setDebugLogs(prev => [...prev.slice(-5), msg]);
  };

  const startEmulator = () => {
    addLog('Иницирање на иницијализација...');
    
    if (!containerRef.current) return;

    setStatus('playing');
    addLog('Активирање на скриптата...');

    // БРИШЕЊЕ НА СТАРИ СКРИПТИ
    const oldScript = document.getElementById('ejs-loader');
    if (oldScript) oldScript.remove();

    // ПОСТАВУВАЊЕ ГЛОБАЛНИ КОНФИГУРАЦИИ (Ова е начинот на EmulatorJS)
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
    const system = core === 'genesis_plus_gx' ? 'segaMD' : 'neogeo';

    (window as any).EJS_player = '#emulator-container';
    (window as any).EJS_core = core;
    (window as any).EJS_gameUrl = proxyUrl;
    (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    (window as any).EJS_startOnLoaded = true;

    // Вметнување на лоадерот
    const script = document.createElement('script');
    script.id = 'ejs-loader';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.onload = () => addLog('Лоадерот е вчитан.');
    script.onerror = () => {
      addLog('Грешка при вчитување.');
      setError('Не може да се вчита лоадерот.');
      setStatus('error');
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    addLog('Емулаторот е подготвен за старт.');
    setStatus('ready');
    
    return () => {
      // Чистење на глобалните променливи
      delete (window as any).EJS_player;
      delete (window as any).EJS_core;
      delete (window as any).EJS_gameUrl;
      const loader = document.getElementById('ejs-loader');
      if (loader) loader.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-10">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button onClick={onClose} className="px-4 py-2 bg-zinc-800 text-white rounded-lg">Назад</button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {/* Debug Console */}
        <div className="absolute top-2 left-2 right-2 bg-black/40 p-2 rounded text-[10px] font-mono text-blue-400 z-30 pointer-events-none">
          {debugLogs.map((log, i) => <div key={i}>> {log}</div>)}
        </div>

        {status === 'error' && (
          <div className="text-center text-red-500 p-8 z-20">
            <p className="text-xl font-semibold mb-4">Грешка</p>
            <p className="text-zinc-400 mb-6 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Освежи</button>
          </div>
        )}

        {status === 'ready' && (
          <div className="text-center z-20">
            <div className="text-6xl mb-6">🎮</div>
            <button 
              onClick={startEmulator}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl shadow-2xl transform active:scale-95 transition-all"
            >
              ИГРАЈ СЕГА
            </button>
            <p className="text-zinc-500 mt-4 text-sm">Притиснете за старт</p>
          </div>
        )}

        {status === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-zinc-700 animate-pulse">Вчитување на играта...</div>
          </div>
        )}

        <div 
          ref={containerRef} 
          id="emulator-container"
          className="w-full h-full z-10"
          style={{ 
            display: status === 'playing' ? 'block' : 'none',
            backgroundColor: '#000'
          }}
        />
      </div>
    </div>
  );
}
