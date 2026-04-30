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
        // Употребуваме 'latest' верзија за подобра компатибилност
        const loaderPath = 'https://cdn.emulatorjs.org/latest/data/loader.js';
        
        // 1. Вметнување на скриптата ако не постои
        if (!(window as any).EJS) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = loaderPath;
            script.async = false; // Оневозможуваме async за посигурно извршување
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Не може да се преземе емулаторот од серверот (CDN Error)'));
            document.head.appendChild(script);
          });
        }

        // 2. Поупорно чекање на EJS објектот (Safari знае да задоцни со извршување)
        let attempts = 0;
        const maxAttempts = 150; // 15 секунди максимум
        
        while (!(window as any).EJS && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as any).EJS) {
          // Последен обид - проверка на алтернативни имиња
          const alternativeEJS = (window as any).EJS_emulator || (window as any).EmulatorJS;
          if (alternativeEJS) {
            (window as any).EJS = alternativeEJS;
          } else {
            throw new Error('Системот за игри не успеа да се активира. Ве молиме освежете ја страната.');
          }
        }

        if (!isMounted) return;
        setStatus('loading-rom');

        const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
        const EJSConstructor = (window as any).EJS;
        
        if (containerRef.current && EJSConstructor) {
          containerRef.current.innerHTML = '';
          
          // Конфигурација специфична за стабилност
          const config = {
            pathtodata: 'https://cdn.emulatorjs.org/latest/data/',
            core: core,
            game: proxyUrl,
            onGameStart: () => {
              if (isMounted) {
                console.log('Играта започна!');
                setStatus('ready');
              }
            },
            onProgress: (data: any) => {
              if (isMounted && data.total > 0) {
                const p = Math.round((data.loaded / data.total) * 100);
                setProgress(p);
              }
            },
          };

          try {
            new EJSConstructor(containerRef.current, config);
          } catch (initErr) {
            console.error('EJS Init Error:', initErr);
            throw new Error('Грешка при стартување на емулаторот.');
          }
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
          <div className="text-center text-red-500 p-8 max-w-md">
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
          <div className="text-center text-white p-4">
            <div className="animate-pulse text-xl mb-4 font-light">Вчитување на системот...</div>
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white p-4 w-full max-w-xs">
            <div className="animate-pulse text-xl mb-4 font-light">Преземање на играта...</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
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
