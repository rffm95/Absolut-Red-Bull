/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Trophy, Play, Star, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, REWARDS } from '../../types';

export const HUD: React.FC = () => {
  const { score, status, restartGame, startGame } = useStore();

  const nextReward = REWARDS.find(r => r.threshold > score) || REWARDS[REWARDS.length - 1];
  const lastReward = [...REWARDS].reverse().find(r => r.threshold <= score);
  const progress = Math.min(100, (score / nextReward.threshold) * 100);

  // TV Remote Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === GameStatus.MENU || status === GameStatus.GAME_OVER) {
        if (e.key === 'Enter' || e.key === 'OK' || e.code === 'Enter' || e.code === 'Space') {
          if (status === GameStatus.MENU) startGame();
          else restartGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startGame, restartGame]);

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-[#050011] p-8 pointer-events-auto">
              <div className="flex flex-col items-center max-w-4xl text-center animate-in fade-in duration-1000">
                <div className="flex space-x-12 mb-12 items-center">
                    <div className="text-blue-500 font-black text-6xl tracking-tighter italic">ABSOLUT.</div>
                    <div className="text-red-600 font-black text-4xl tracking-widest border-4 border-red-600 px-4 py-1">RED BULL</div>
                    <div className="text-yellow-500 font-black text-4xl tracking-wider">CHEERS O BAR</div>
                </div>
                
                <h1 className="text-[12rem] font-black text-white mb-2 font-cyber tracking-tight uppercase leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.7)] animate-pulse">
                    CHEERS O <span className="text-red-600">RUNNER</span>
                </h1>
                
                <p className="text-4xl text-yellow-400 mb-12 max-w-4xl font-black uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
                    DOMINA A NOITE NO <span className="text-white underline decoration-red-600">CHEERS O BAR</span>
                </p>

                <div className="grid grid-cols-4 gap-6 mb-16 w-full">
                    {REWARDS.map((r, i) => (
                        <div key={r.threshold} className={`bg-white/10 border-4 ${i % 2 === 0 ? 'border-blue-500' : 'border-red-600'} p-8 rounded-[2rem] shadow-xl transform hover:scale-105 transition-transform`}>
                            <div className="text-white font-black text-2xl mb-2 uppercase">COLETE {r.threshold}</div>
                            <div className="text-yellow-400 font-black text-3xl uppercase drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]">{r.label}</div>
                        </div>
                    ))}
                </div>

                <button 
                  onClick={startGame}
                  className="group relative px-20 py-10 bg-white text-black font-black text-5xl rounded-[3rem] hover:scale-110 transition-all shadow-[0_0_70px_rgba(255,255,255,0.5)] flex items-center border-8 border-cyan-400"
                >
                    PREMIR OK / ENTER <Play className="ml-6 w-12 h-12 fill-black" />
                </button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/95 z-[100] text-white p-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
              <h1 className="text-9xl font-black text-red-600 mb-4 font-cyber italic underline decoration-white decoration-8 underline-offset-8">GAME OVER</h1>
              
              <div className="text-center mb-12">
                  <div className="text-2xl text-gray-500 uppercase tracking-widest mb-2 font-black">Latas Coletadas</div>
                  <div className="text-[12rem] font-black leading-none text-white font-cyber select-none shadow-white drop-shadow-[0_0_20px_#fff]">
                    {score}
                  </div>
              </div>

              {lastReward ? (
                  <div className="bg-green-600 px-16 py-8 rounded-[3rem] mb-16 animate-bounce border-8 border-white shadow-[0_0_60px_rgba(0,255,0,0.8)] transform rotate-3">
                      <div className="text-2xl font-black uppercase text-white/90 mb-2 italic tracking-widest">GANHOU UM PRÉMIO!</div>
                      <div className="text-6xl font-black text-white drop-shadow-md">{lastReward.label}</div>
                      <div className="text-white/80 font-bold mt-4 uppercase text-xl">LEVANTAR NO BALCÃO DO CHEERS O BAR</div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center mb-16">
                      <div className="text-white bg-red-600 px-16 py-8 rounded-[3rem] text-4xl font-black uppercase tracking-widest border-8 border-white shadow-[0_0_40px_rgba(255,0,0,0.5)] -rotate-3 mb-8">
                          Upps tenta outra vez!
                      </div>
                      <p className="text-yellow-400 font-bold uppercase tracking-widest animate-pulse">
                          Dica: Pede outra Red Bull para recuperar energias!
                      </p>
                  </div>
              )}

              <button 
                onClick={restartGame}
                className="px-16 py-8 bg-blue-600 text-white font-black text-4xl rounded-2xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(0,100,255,0.5)] flex items-center"
              >
                  CORRER NOVAMENTE <RotateCcw className="ml-4 w-10 h-10" />
              </button>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12 z-50 overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-sm font-black text-red-600 mb-2 tracking-[0.5rem] uppercase"> Latas Red Bull</div>
                <div className="text-9xl font-black text-white font-cyber drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                    {score}
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="flex space-x-8 mb-6 items-center">
                    <div className="text-blue-500 font-black text-3xl italic">ABSOLUT.</div>
                    <div className="text-red-600 font-bold text-xl border-2 border-red-600 px-2 py-0.5">RED BULL</div>
                    <div className="text-yellow-500 font-bold text-xl">CHEERS O BAR</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-80">
                    <div className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Próximo Prémio: {nextReward.label}</div>
                    <div className="relative h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-white transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* TV Instructions */}
        <div className="w-full flex justify-center pb-8 animate-pulse">
             <div className="flex items-center space-x-12 px-10 py-4 bg-black/80 rounded-full border border-white/20">
                 <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded border border-white flex items-center justify-center text-xs">←</div>
                    <div className="w-8 h-8 rounded border border-white flex items-center justify-center text-xs">→</div>
                    <span className="text-sm font-black uppercase text-gray-400">Mudar Faixa</span>
                 </div>
                 <div className="text-sm font-black uppercase text-red-500">EVITE AS GARRAFAS DE ÁGUA!</div>
             </div>
        </div>
    </div>
  );
};
