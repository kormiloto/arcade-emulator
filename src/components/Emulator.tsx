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
  const [status, setStatus] = useState<'loading-script' | 'ready-to-start' | 'loading-rom' | 'playing' | 'error'>('loading-script');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(`[Emulator]: ${msg}`);
    setDebugLogs(prev => [...prev.slice(-5), msg]);
  };

  useEffect(() => {
    let isMounted = true;
    addLog('Вчитување на скрипта...');

    // Користиме официјален CDN со cache-buster
    const loaderPath = `https://cdn.emulatorjs.org/stable/data/loader.js?v=${Date.now()}`;
    
    const script = document.createElement('script');
    script.src = loaderPath;
    script.async = true;
    
    script.onload = () => {
      if (!isMounted) return;
      addLog('Скриптата пристигна.');
      
      // Мала пауза за Safari да го процесира објектот
      setTimeout(() => {
        if ((window as any).EJS || (window as any).EmulatorJS) {
          addLog('EJS е пронајден!');
          setStatus('ready-to-start');
        } else {
          addLog('Скриптата е тука, но EJS објектот фали.');
          setStatus('error');
          setError('Системот не може да се иницијализира (Object Missing).');
        }
      }, 500);
    };

    script.onerror = () => {
      addLog('Мрежна грешка при вчитување.');
      setStatus('error');
      setError('Нема интернет врска со серверот за игри.');
    };

    document.head.appendChild(script);

    return () => {
      isMounted = false;
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const startEmulator = () => {
    addLog('Стартување...');
    
    // Проверка на сите можни имиња
    const EJSConstructor = (window as any).EJS || (window as any).EmulatorJS;
    
    if (!EJSConstructor) {
      addLog('КРИТИЧНО: EJS сепак го нема.');
      setError('Ве молиме освежете ја страната (Refresh).');
      return;
    }

    setStatus('loading-rom');
    const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
    const dataPath = 'https://cdn.emulatorjs.org/stable/data/';
    const system = core === 'genesis_plus_gx' ? 'segaMD' : 'neogeo';

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      try {
        new EJSConstructor(containerRef.current, {
          pathtodata: dataPath,
          core: core,
          system: system,
          gameUrl: proxyUrl,
          startOnLoaded: true,
          onGameStart: () => setStatus('playing'),
          onProgress: (data: any) => {
            if (data.total > 0) {
              setProgress(Math.round((data.loaded / data.total) * 100));
            }
          },
        });
        addLog('Конструкторот е повикан.');
      } catch (err: any) {
        addLog(`Грешка: ${err.message}`);
        setError(err.message);
        setStatus('error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-10">
        <h2 className="text-lg font-semibold text-white truncate mr-4">{gameName}</h2>
        <button onClick={onClose} className="px-4 py-2 bg-zinc-800 text-white rounded-lg">Назад</button>
      </header>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        {/* Debug Console */}
        <div className="absolute top-2 left-2 right-2 bg-black/60 p-2 rounded text-[10px] font-mono text-blue-400 z-30 pointer-events-none">
          {debugLogs.map((log, i) => <div key={i}>> {log}</div>)}
        </div>

        {status === 'error' && (
          <div className="text-center text-red-500 p-8 z-20">
            <p className="text-xl font-semibold mb-4">Грешка</p>
            <p className="text-zinc-400 mb-6 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Освежи</button>
          </div>
        )}

        {status === 'loading-script' && (
          <div className="text-center text-white z-20">
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="animate-pulse text-sm font-light">Се вчитува...</div>
          </div>
        )}

        {status === 'ready-to-start' && (
          <div className="text-center z-20">
            <button 
              onClick={startEmulator}
              className="px-12 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-xl transform active:scale-95 transition-all"
            >
              СТАРТУВАЈ
            </button>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white p-4 w-full max-w-xs z-20">
            <div className="text-lg mb-4 font-light">Вчитување ({progress}%)</div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            display: status === 'playing' ? 'block' : 'none',
            minHeight: '300px'
          }}
        />
      </div>
    </div>
  );
}
