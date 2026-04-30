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
        const loaderPath = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        
        // Ensure script is loaded
        if (!(window as any).EJS) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = loaderPath;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load EmulatorJS script from CDN'));
            document.head.appendChild(script);
          });
        }

        // Wait for EJS constructor to be ready
        let attempts = 0;
        while (!(window as any).EJS && attempts < 100) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as any).EJS) {
          throw new Error('EmulatorJS object (EJS) not found after loading script');
        }

        if (!isMounted) return;
        setStatus('loading-rom');

        const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;
        const ejs = (window as any).EJS;
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          
          new ejs(containerRef.current, {
            pathtodata: 'https://cdn.emulatorjs.org/stable/data/',
            core: core,
            game: proxyUrl,
            onGameStart: () => {
              if (isMounted) setStatus('ready');
            },
            onProgress: (data: any) => {
              if (isMounted && data.total > 0) {
                setProgress(Math.round((data.loaded / data.total) * 100));
              }
            },
          });
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Unknown emulator error');
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
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">{gameName}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center relative">
        {status === 'error' && (
          <div className="text-center text-red-500 p-8">
            <p className="text-xl font-semibold mb-2">Error Loading Emulator</p>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        )}

        {status === 'loading-emulator' && (
          <div className="text-center text-white">
            <div className="animate-pulse text-xl mb-4">Loading Emulator Engine...</div>
            <div className="w-16 h-16 border-4 border-zinc-600 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'loading-rom' && (
          <div className="text-center text-white">
            <div className="animate-pulse text-xl mb-4">Downloading Game...</div>
            <div className="w-64 h-3 bg-zinc-800 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-zinc-500 mt-2 text-sm">{progress}%</p>
          </div>
        )}

        <div 
          ref={containerRef} 
          className={`w-full h-full ${status === 'ready' ? 'block' : 'hidden'}`} 
        />
      </div>
    </div>
  );
}
