/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',    // Garrafas de Água
  COLLECTIBLE = 'COLLECTIBLE', // Latas Red Bull
  DECORATION = 'DECORATION'    // Billboards
}

export interface GameObject {
  id: string;
  type: ObjectType;
  subType?: 'REDBULL' | 'WATER';
  position: [number, number, number]; // x, y, z
  active: boolean;
  color?: string;
  points?: number;
}

export const LANE_WIDTH = 2.5;
export const RUN_SPEED_BASE = 25.0;
export const SPAWN_DISTANCE = 150;
export const REMOVE_DISTANCE = 30; // Behind player

export const REWARDS = [
  { threshold: 10, label: '1 Shot' },
  { threshold: 20, label: '1 Vodka Red Bull' },
  { threshold: 50, label: '3 Vodkas Red Bull' },
  { threshold: 100, label: '1 Garrafa de Absolut' }
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}
