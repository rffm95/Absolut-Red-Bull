/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text3D, Center, Float } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus } from '../../types';

// Geometry Constants
const OBSTACLE_HEIGHT = 1.0;
const OBSTACLE_GEO = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12); // Water bottle shape
const COLLECTIBLE_GEO = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12); // Can shape
const BILLBOARD_GEO = new THREE.PlaneGeometry(12, 6);

const FONT_URL = "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";

export const LevelManager: React.FC = () => {
  const { 
    status, 
    speed, 
    collectDrink, 
    takeDamage,
    setDistance,
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const lastSpawnZ = useRef(-20);

  useEffect(() => {
    if (status === GameStatus.MENU || (status === GameStatus.PLAYING && lastSpawnZ.current > -20)) {
        objectsRef.current = [];
        distanceTraveled.current = 0;
        lastSpawnZ.current = -20;
        setRenderTrigger(t => t + 1);
    }
  }, [status]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    if (!playerObjRef.current) {
        const player = state.scene.getObjectByName('PlayerMovingGroup');
        if (player) playerObjRef.current = player;
        return;
    }

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    distanceTraveled.current += dist;

    let playerPos = new THREE.Vector3(0, 0, 0);
    playerObjRef.current.getWorldPosition(playerPos);

    // 1. Move & Update
    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];

    for (const obj of currentObjects) {
        obj.position[2] += dist;

        let keep = true;
        if (obj.active) {
            const dz = Math.abs(obj.position[2] - playerPos.z);
            const dx = Math.abs(obj.position[0] - playerPos.x);

            // Tighter collision detection
            if (dz < 1.0 && dx < 0.7) {
                if (obj.type === ObjectType.OBSTACLE) {
                    takeDamage();
                    obj.active = false;
                } else if (obj.type === ObjectType.COLLECTIBLE) {
                    collectDrink();
                    obj.active = false;
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) keep = false;
        if (keep) keptObjects.push(obj);
    }

    // 2. Spawning Logic (Infinite)
    let furthestZ = 0;
    const gameplayObjects = keptObjects.filter(o => o.type !== ObjectType.DECORATION);
    if (gameplayObjects.length > 0) {
        furthestZ = Math.min(...gameplayObjects.map(o => o.position[2]));
    } else {
        furthestZ = -20;
    }

    if (furthestZ > -SPAWN_DISTANCE) {
         const gap = 30; // Consistent gap
         const spawnZ = furthestZ - gap;

         const lane = Math.floor(Math.random() * 3) - 1;
         const spawnType = Math.random();

         if (spawnType > 0.4) { // 60% chance to spawn something
            if (spawnType > 0.7) { // 30% total chance for obstacle
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.OBSTACLE,
                    position: [lane * LANE_WIDTH, 0.4, spawnZ],
                    active: true,
                    color: '#ff0000' // Red for Danger
                });
            } else { // 30% total chance for collectible
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.COLLECTIBLE,
                    position: [lane * LANE_WIDTH, 0.3, spawnZ],
                    active: true,
                    color: '#0033aa'
                });
            }
         }

         // Frequent Billboards for speed feel
         if (Math.random() > 0.7) {
             const side = Math.random() > 0.5 ? 4 : -4;
             const brands = ['ABSOLUT', 'RED BULL', 'CHEERS O BAR'];
             const chosenBrand = brands[Math.floor(Math.random() * brands.length)];
             const colorMap: {[key: string]: string} = {
                 'ABSOLUT': '#0033aa',
                 'RED BULL': '#ff0000',
                 'CHEERS O BAR': '#ffaa00'
             };

             keptObjects.push({
                id: uuidv4(),
                type: ObjectType.DECORATION,
                position: [side, 4, spawnZ],
                active: true,
                color: colorMap[chosenBrand]
             });
         }
    }

    objectsRef.current = keptObjects;
    setRenderTrigger(t => t + 1);
  });

  return (
    <group>
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        
        // SYNC Z POSITION (Crucial for movement visibility)
        groupRef.current.position.z = data.position[2];

        // Floating and rotation animation for collectibles
        if (data.type === ObjectType.COLLECTIBLE) {
            groupRef.current.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * 6) * 0.1;
            groupRef.current.rotation.y += 0.05;
        }
        
        // Bobbing for obstacles
        if (data.type === ObjectType.OBSTACLE) {
            groupRef.current.position.y = data.position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[data.position[0], data.position[1], data.position[2]]}>
            {data.type === ObjectType.OBSTACLE && (
                <group>
                    <mesh geometry={OBSTACLE_GEO}>
                        <meshStandardMaterial color={data.color} transparent opacity={0.7} metalness={0.5} roughness={0.1} emissive={data.color} emissiveIntensity={0.3} />
                    </mesh>
                    <Center position={[0, 0.7, 0]}>
                        <Text3D font={FONT_URL} size={0.15} height={0.05}>
                            AGUA
                            <meshBasicMaterial color="#ffffff" />
                        </Text3D>
                    </Center>
                    <pointLight intensity={0.5} color={data.color} distance={4} />
                </group>
            )}

            {data.type === ObjectType.COLLECTIBLE && (
                <group rotation={[0, Math.PI / 2, 0]}>
                    <mesh geometry={COLLECTIBLE_GEO}>
                        <meshStandardMaterial color={data.color} metalness={1} roughness={0} emissive={data.color} emissiveIntensity={0.6} />
                    </mesh>
                    <Center position={[0, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
                        <Text3D font={FONT_URL} size={0.2} height={0.05}>
                            RED BULL
                            <meshBasicMaterial color="white" />
                        </Text3D>
                    </Center>
                    <pointLight intensity={1.5} color="#ffffff" distance={5} />
                </group>
            )}


            {data.type === ObjectType.DECORATION && (
                <group rotation={[0, -Math.PI / 2, 0]}>
                    <mesh geometry={BILLBOARD_GEO}>
                        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.2} />
                    </mesh>
                    <Center position={[0, 0, 0.1]}>
                        <Text3D font={FONT_URL} size={data.color === '#ffaa00' ? 0.8 : 1.5} height={0.2}>
                            {data.color === '#0033aa' ? 'ABSOLUT' : data.color === '#ff0000' ? 'RED BULL' : 'CHEERS O BAR'}
                            <meshBasicMaterial color="white" />
                        </Text3D>
                    </Center>
                </group>
            )}
        </group>
    );
});
