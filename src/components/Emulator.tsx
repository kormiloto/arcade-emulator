'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface EmulatorProps {
  core: string;
  gameUrl: string;
  gameName: string;
  onClose?: () => void;
}

export default function Emulator({ core, gameUrl, gameName, onClose }: EmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading-script' | 'ready-to-start' | 'loading-rom' | 'playing' | 'error'>('loading-script');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[Emulator]: ${msg}`);
    setDebugLogs(prev => [...prev.slice(-4), msg]);
  };

  const startEmulator = () => {
    addLog('Копчето е стиснато...');
    if (!(window as any).EJS) {
      addLog('ГРЕШКА: Емулаторот (EJS) не е во меморијата!');
      setError('Системот не е подготвен. Освежете ја страната.');
      return;
    }

    setStatus('loading-rom');
    addLog('Подготовка на адресата...');
    
    // Користиме наш прокси за да нема CORS проблеми
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
    const EJSConstructor = (window as any).EJS;
    const dataPath = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';

    // Мапирање на системи за EmulatorJS
    const system = core === 'genesis_plus_gx' ? 'segaMD' : 'neogeo';
    addLog(`Систем: ${system}, Јадро: ${core}`);

    if (containerRef.current && EJSConstructor) {
      containerRef.current.innerHTML = '';
      
      try {
        addLog('Иницијализација на моторот...');
        const config = {
          pathtodata: dataPath,
          core: core,
          system: system,
          gameUrl: proxyUrl, // EmulatorJS користи gameUrl
          startOnLoaded: true,
          showRefreshButton: false,
          onGameStart: () => {
            addLog('ИГРАТА ЗАПОЧНА!');
            setStatus('playing');
          },
          onProgress: (data: any) => {
            if (data.total > 0) {
              const p = Math.round((data.loaded / data.total) * 100);
              setProgress(p);
            }
          },
        };

        new EJSConstructor(containerRef.current, config);
        addLog('Моторот е креиран.');
      } catch (err: any) {
        addLog(`ГРЕШКА ПРИ СТАРТ: ${err.message}`);
        setStatus('error');
        setError(`Грешка при стартување: ${err.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
      <Script 
        src="https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          addLog('Скриптата е вчитана успешно.');
          setStatus('ready-to-start');
        }}
        onError={() => {
          addLog('ГРЕШКА ПРИ ВЧИТУВАЊЕ СКРИПТА.');
          setStatus('error');
          setError('Мрежна грешка при вчитување на емулаторот.');
        }}
      />

      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-10">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium"
        >
          Затвори
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {/* Debug Console (Мало прозорче за дијагностика) */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-zinc-800 p-2 rounded text-[10px] font-mono text-zinc-500 z-30 pointer-events-none">
          {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>

        {status === 'error' && (
          <div className="text-center text-red-500 p-8 z-20">
            <p className="text-xl font-semibold mb-4">Проблем со вчитување</p>
            <p className="text-zinc-400 mb-6 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Освежи</button>
          </div>
        )}

        {status === 'loading-script' && (
          <div className="text-center text-white z-20">
            <div className="animate-pulse text-xl mb-4 font-light">Вчитување на системот...</div>
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'ready-to-start' && (
          <div className="text-center z-20">
            <div className="text-5xl mb-6">🕹️</div>
            <button 
              onClick={startEmulator}
              className="px-12 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-xl shadow-2xl transform active:scale-95 transition-all"
            >
              СТАРТУВАЈ
            </button>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white p-4 w-full max-w-xs z-20">
            <div className="animate-pulse text-xl mb-4 font-light">Преземање ({progress}%)</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div 
          ref={containerRef} 
          id="emulator-container"
          className="w-full h-full"
          style={{ 
            display: status === 'playing' ? 'block' : 'none',
            minHeight: '400px' // Многу важно за иницијализација
          }}
        />
      </div>
    </div>
  );
}
