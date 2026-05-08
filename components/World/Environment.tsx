/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';

const Road: React.FC = () => {
    const { speed, status } = useStore();
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (status !== GameStatus.PLAYING) return;
        if (meshRef.current) {
            // Scroll textures / offsets
            meshRef.current.position.z += speed * delta;
            if (meshRef.current.position.z > 50) {
                meshRef.current.position.z = 0;
            }
        }
    });

    return (
        <group ref={meshRef}>
            {/* Asphalt */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -200]}>
                <planeGeometry args={[LANE_WIDTH * 3 + 10, 800]} />
                <meshStandardMaterial color="#050011" roughness={0.1} metalness={0.5} />
            </mesh>

            {/* Scrolling Road Lines */}
            {new Array(40).fill(0).map((_, i) => (
                <group key={i} position={[0, 0, -i * 10]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-LANE_WIDTH * 1.5, 0.02, 0]}>
                        <planeGeometry args={[0.2, 5]} />
                        <meshBasicMaterial color="#00ffff" />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE_WIDTH * 1.5, 0.02, 0]}>
                        <planeGeometry args={[0.2, 5]} />
                        <meshBasicMaterial color="#ff00ff" />
                    </mesh>
                    {/* Dashed Lane Lines */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-LANE_WIDTH / 2, 0.01, 0]}>
                        <planeGeometry args={[0.1, 2]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE_WIDTH / 2, 0.01, 0]}>
                        <planeGeometry args={[0.1, 2]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

export const Environment: React.FC = () => {
  const { speed, status } = useStore();
  const buildingsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;
    if (buildingsRef.current) {
        buildingsRef.current.children.forEach((building) => {
            building.position.z += speed * delta;
            if (building.position.z > 30) {
                building.position.z = -((buildingsRef.current!.children.length - 1) * 30) + 30;
            }
        });
    }
  });

  return (
    <>
      <color attach="background" args={['#050011']} />
      <fog attach="fog" args={['#050011', 20, 150]} />
      
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[10, 50, 10]} intensity={2.5} color="#ffffff" />
      <pointLight position={[0, 15, -10]} intensity={20} color="#00ffff" />
      
      <Road />

      {/* Moving Side Buildings */}
      <group ref={buildingsRef}>
          {new Array(20).fill(0).map((_, i) => {
              const side = i % 2 === 0 ? -18 : 18;
              const colors = ["#ff0077", "#00ffcc", "#ffff00", "#ff00ff", "#0033aa"];
              const color = colors[i % colors.length];
              return (
                  <group key={i} position={[side, 0, -i * 30]}>
                      <mesh position={[0, 20, 0]}>
                          <boxGeometry args={[10, 60, 25]} />
                          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.1} />
                      </mesh>
                      {/* Windows / Light Strips */}
                      <mesh position={[side > 0 ? -5.1 : 5.1, 20, 0]}>
                          <planeGeometry args={[1.5, 58]} />
                          <meshBasicMaterial color="#ffffff" />
                      </mesh>
                  </group>
              );
          })}
      </group>
    </>
  );
};
