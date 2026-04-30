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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Функција за стартување на емулаторот по клик (User Gesture)
  const startEmulator = () => {
    if (!(window as any).EJS) {
      setError('Системот не е подготвен. Ве молиме почекајте или освежете.');
      return;
    }

    setStatus('loading-rom');
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
    const EJSConstructor = (window as any).EJS;
    const dataPath = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';

    if (containerRef.current && EJSConstructor) {
      containerRef.current.innerHTML = '';
      
      try {
        new EJSConstructor(containerRef.current, {
          pathtodata: dataPath,
          core: core,
          game: proxyUrl,
          startOnLoaded: true,
          onGameStart: () => {
            setStatus('playing');
          },
          onProgress: (data: any) => {
            if (data.total > 0) {
              setProgress(Math.round((data.loaded / data.total) * 100));
            }
          },
        });
      } catch (err) {
        console.error('EJS Init Error:', err);
        setStatus('error');
        setError('Не успеавме да ја стартуваме играта.');
      }
    }
  };

  useEffect(() => {
    if (scriptLoaded && status === 'loading-script') {
      setStatus('ready-to-start');
    }
  }, [scriptLoaded, status]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
      {/* Скрипта вчитана преку Next.js компонента за подобра поддршка */}
      <Script 
        src="https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setStatus('error');
          setError('Не успеавме да го вчитаме емулаторот (Network Error)');
        }}
      />

      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-10">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
        >
          Назад
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {status === 'error' && (
          <div className="text-center text-red-500 p-8 z-20">
            <p className="text-xl font-semibold mb-2">Проблем!</p>
            <p className="text-zinc-400 mb-6 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Освежи страна
            </button>
          </div>
        )}

        {status === 'loading-script' && (
          <div className="text-center text-white z-20">
            <div className="animate-pulse text-xl mb-4 font-light text-blue-400">Вчитување на системот...</div>
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'ready-to-start' && (
          <div className="text-center z-20">
            <div className="mb-6">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-white text-xl font-bold mb-2">Спремно за игра!</h3>
              <p className="text-zinc-400 text-sm px-8">Кликнете на копчето подолу за да ја стартувате играта.</p>
            </div>
            <button 
              onClick={startEmulator}
              className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-900/20 transform active:scale-95 transition-all"
            >
              СТАРТУВАЈ ИГРА
            </button>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white p-4 w-full max-w-xs z-20">
            <div className="animate-pulse text-xl mb-4 font-light text-green-400">Преземање на податоци...</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-zinc-500 text-sm font-mono">{progress}%</p>
          </div>
        )}

        {/* Контејнерот мора секогаш да биде присутен во DOM за EJS да го најде */}
        <div 
          ref={containerRef} 
          className={`w-full h-full ${status === 'playing' ? 'block' : 'opacity-0 absolute pointer-events-none'}`}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}
