/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from './types';

interface GameState {
  status: GameStatus;
  score: number; // Total drinks collected
  distance: number;
  speed: number;
  laneCount: number;
  
  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  collectDrink: () => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
}

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  distance: 0,
  speed: 0,
  laneCount: 3,

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    distance: 0,
    speed: RUN_SPEED_BASE,
    laneCount: 3
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    distance: 0,
    speed: RUN_SPEED_BASE,
    laneCount: 3
  }),

  takeDamage: () => {
    // In this game, hitting an obstacle might just reset score or end game
    // Based on "para jogar o cliente tem de pedir", we'll make it reset/end
    set({ status: GameStatus.GAME_OVER, speed: 0 });
  },

  collectDrink: () => set((state) => {
    const newScore = state.score + 1;
    let newSpeed = state.speed;

    // Aumentos de velocidade conforme pedido:
    // 20 latas: +20%
    // 35 latas: +20%
    // 70 latas: +20%
    // 90 latas: +10%
    if (newScore === 20) newSpeed *= 1.20;
    else if (newScore === 35) newSpeed *= 1.20;
    else if (newScore === 70) newSpeed *= 1.20;
    else if (newScore === 90) newSpeed *= 1.10;
    else {
      // Pequeno incremento constante para manter o desafio
      newSpeed += 0.05;
    }

    return { score: newScore, speed: newSpeed };
  }),

  setDistance: (dist) => set({ distance: dist }),
  setStatus: (status) => set({ status }),
}));
