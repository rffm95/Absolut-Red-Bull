/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera } = useThree();
  
  useFrame((state, delta) => {
    // Fixed camera for 16:9 large screen TV
    // Backed up enough to see all 3 lanes clearly
    const targetPos = new THREE.Vector3(0, 6.5, 12);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 3.0);
    
    // Look further down the track
    camera.lookAt(0, 0, -50); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full h-screen bg-[#020008] overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={1.5} 
        gl={{ antialias: true, stencil: false, depth: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 6.5, 12], fov: 50 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
