'use client';

import { useState } from 'react';
import { games, Game } from '@/data/games';
import Emulator from '@/components/Emulator';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<'all' | 'sega' | 'neogeo'>('all');

  const filteredGames = selectedSystem === 'all' 
    ? games 
    : games.filter(g => g.system === selectedSystem);

  if (selectedGame) {
    return (
      <Emulator
        core={selectedGame.core}
        gameUrl={selectedGame.romUrl}
        gameName={selectedGame.title}
        onClose={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Arcade Emulator
              </h1>
              <p className="text-zinc-400 mt-1">
                Play classic Sega and NeoGeo games in your browser
              </p>
            </div>
            
            {/* System Filter */}
            <div className="flex gap-2">
              {(['all', 'sega', 'neogeo'] as const).map((system) => (
                <button
                  key={system}
                  onClick={() => setSelectedSystem(system)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedSystem === system
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {system === 'all' ? 'All Games' : system === 'sega' ? 'Sega' : 'NeoGeo'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-8">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">Инфо:</span> Користиме брзи сервери за игрите. 
            Првото стартување може да потрае неколку секунди додека се преземат податоците.
          </p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/50 transition-all duration-200"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <div className="text-zinc-500 text-4xl">
                  {game.system === 'sega' ? '🎮' : '🕹️'}
                </div>
              </div>
              
              {/* Game Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{game.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{game.description}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                    game.system === 'sega' 
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                      : 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                  }`}>
                    {game.system === 'sega' ? 'Sega' : 'NeoGeo'}
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedGame(game)}
                  className="w-full mt-4 py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-colors"
                >
                  Play Game
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">No games found for this system.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-zinc-500 text-sm">
            Изработено со EmulatorJS • Игрите се преземаат од GitHub CDN
          </p>
        </div>
      </footer>
    </div>
  );
}