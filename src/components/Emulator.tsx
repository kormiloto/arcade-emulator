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
  const [status, setStatus] = useState<'loading-emulator' | 'loading-rom' | 'ready' | 'error'>('loading-emulator');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadEmulator = async () => {
      try {
        // Употребуваме jsDelivr CDN кој е многу побрз и постабилен
        const loaderPath = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/loader.js';
        const dataPath = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@latest/data/';
        
        // 1. Вметнување на скриптата
        if (!(window as any).EJS) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = loaderPath;
            script.async = false;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Грешка при вчитување на системот од CDN.'));
            document.head.appendChild(script);
          });
        }

        // 2. Чекање на EJS објектот
        let attempts = 0;
        while (!(window as any).EJS && attempts < 100) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as any).EJS) {
          throw new Error('Системот за игри не успеа да се активира.');
        }

        if (!isMounted) return;
        setStatus('loading-rom');

        // Ромовите сега одат директно преку нашиот прокси за максимална брзина
        const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
        const EJSConstructor = (window as any).EJS;
        
        if (containerRef.current && EJSConstructor) {
          containerRef.current.innerHTML = '';
          
          new EJSConstructor(containerRef.current, {
            pathtodata: dataPath,
            core: core,
            game: proxyUrl,
            onGameStart: () => {
              if (isMounted) setStatus('ready');
            },
            onProgress: (data: any) => {
              if (isMounted && data.total > 0) {
                const p = Math.round((data.loaded / data.total) * 100);
                setProgress(p);
              }
            },
          });
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Неочекувана грешка');
        }
      }
    };

    loadEmulator();

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [core, gameUrl]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
        >
          Close
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {status === 'error' && (
          <div className="text-center text-red-500 p-8">
            <p className="text-xl font-semibold mb-2">Грешка при вчитување</p>
            <p className="text-zinc-400 mb-6 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium"
            >
              Освежи страна
            </button>
          </div>
        )}

        {status === 'loading-emulator' && (
          <div className="text-center text-white">
            <div className="animate-pulse text-xl mb-4 font-light text-blue-400">Стартување мотор...</div>
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white p-4 w-full max-w-xs">
            <div className="animate-pulse text-xl mb-4 font-light text-green-400">Брзо преземање...</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-zinc-500 text-sm font-mono">{progress}%</p>
          </div>
        )}

        <div 
          ref={containerRef} 
          className={`w-full h-full ${status === 'ready' ? 'block' : 'hidden'}`}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}
