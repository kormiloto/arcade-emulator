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
    if (!containerRef.current) return;

    const loadEmulator = async () => {
      try {
        // Load EmulatorJS loader
        const loaderPath = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        
        const existingScript = document.querySelector(`script[src="${loaderPath}"]`);
        if (!existingScript) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = loaderPath;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load EmulatorJS'));
            document.head.appendChild(script);
          });
        }

        // Wait for EJS to be available
        let attempts = 0;
        while (!(window as unknown as { EJS: unknown }).EJS && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as unknown as { EJS: unknown }).EJS) {
          throw new Error('EmulatorJS failed to load');
        }

        setStatus('loading-rom');

        // Convert archive.org URL to proxy URL
        const proxyUrl = `/api/rom?url=${encodeURIComponent(gameUrl)}`;

        // Initialize the emulator
        const ejs = (window as unknown as { EJS: typeof window.EJS }).EJS;
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          
          new ejs(containerRef.current, {
            pathtodata: 'https://cdn.emulatorjs.org/stable/data/',
            core: core,
            game: proxyUrl,
            onGameStart: () => {
              setStatus('ready');
              setProgress(100);
            },
            onProgress: (progressData: { loaded: number; total: number }) => {
              if (progressData.total > 0) {
                const percent = Math.round((progressData.loaded / progressData.total) * 100);
                setProgress(percent);
              }
            },
          });

          // Timeout fallback - if no progress after 5s, assume ready
          setTimeout(() => {
            if (status === 'loading-rom') {
              setStatus('ready');
            }
          }, 5000);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load emulator');
      }
    };

    loadEmulator();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [core, gameUrl, status]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">{gameName}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </header>

      {/* Emulator Container */}
      <div className="flex-1 flex items-center justify-center">
        {status === 'error' ? (
          <div className="text-center text-red-500 p-8">
            <p className="text-xl font-semibold mb-2">Error Loading Emulator</p>
            <p className="text-zinc-400">{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        ) : status === 'loading-emulator' ? (
          <div className="text-center text-white">
            <div className="animate-pulse text-xl mb-4">Loading Emulator...</div>
            <div className="w-16 h-16 border-4 border-zinc-600 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        ) : status === 'loading-rom' ? (
          <div className="text-center text-white">
            <div className="animate-pulse text-xl mb-4">Loading ROM...</div>
            <p className="text-zinc-400 mb-4 text-sm">This may take a moment depending on the game size</p>
            <div className="w-64 h-3 bg-zinc-800 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-zinc-500 mt-2 text-sm">{progress}%</p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    EJS: {
      new (container: HTMLElement, config: {
        pathtodata: string;
        core: string;
        game: string;
        system?: string;
        onGameStart?: () => void;
        onProgress?: (data: { loaded: number; total: number }) => void;
      }): void;
    };
  }
}