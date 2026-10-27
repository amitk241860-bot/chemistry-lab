'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { LabFallback } from './LabFallback';

// 3D Flask loaded from 3DAssets.dev CDN
const ModelFlask3D: React.FC<{ position?: [number, number, number] }> = ({ position = [0, -1.15, 0.4] }) => {
  try {
    const { scene } = useGLTF('https://cdn.3dassets.dev/assets/37167/v1/model.glb');
    return (
      <group position={position}>
        <primitive object={scene.clone()} scale={[1.5, 1.5, 1.5]} />
        <Text position={[0, 1.25, 0]} fontSize={0.12} color="#38bdf8" anchorX="center">
          Flask (3DAssets.dev)
        </Text>
      </group>
    );
  } catch {
    return null;
  }
};

interface Lab3DSceneProps {
  liquidColor?: string;
  liquidLevel?: number; // 0 to 1
  isHeating?: boolean;
  isStirring?: boolean;
  bubbles?: boolean;
  showBurette?: boolean;
  showVoltmeter?: boolean;
  activeApparatus?: string;
  onApparatusClick?: (id: string) => void;
}

// 3D Laboratory Workbench Table
const Workbench: React.FC = () => {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Tabletop */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.4, 6]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      {/* Front edge trim glow */}
      <mesh position={[0, 0.15, 3.01]}>
        <boxGeometry args={[10, 0.05, 0.05]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* Bench grid markings */}
      <gridHelper args={[8, 16, '#06b6d4', '#1e293b']} position={[0, 0.21, 0]} />
    </group>
  );
};

// 3D Glass Beaker with Liquid
const Beaker3D: React.FC<{
  liquidColor: string;
  liquidLevel: number;
  isHeating: boolean;
  onClick?: () => void;
}> = ({ liquidColor, liquidLevel, isHeating, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (liquidRef.current) {
      // Gentle surface shimmer
      liquidRef.current.rotation.y += delta * 0.2;
    }
  });

  const liquidHeight = Math.max(0.05, Math.min(1.4, liquidLevel * 1.4));
  const liquidY = -1.0 + liquidHeight / 2;

  return (
    <group ref={meshRef} position={[-0.8, 0, 0]} onClick={onClick}>
      {/* Glass Beaker Body */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.9, 0.85, 1.6, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.92}
          opacity={0.35}
          transparent
          roughness={0.05}
          metalness={0.1}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Beaker Base */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.9}
          opacity={0.4}
          transparent
          roughness={0.05}
        />
      </mesh>
      {/* Graduated Measurement Markings */}
      {[-0.8, -0.5, -0.2, 0.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0.86]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.3, 0.02]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      {/* Chemical Liquid Inside */}
      {liquidLevel > 0 && (
        <mesh ref={liquidRef} position={[0, liquidY, 0]}>
          <cylinderGeometry args={[0.84, 0.84, liquidHeight, 32]} />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.85}
            roughness={0.1}
          />
        </mesh>
      )}
      {/* Beaker Label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        Beaker 250 mL
      </Text>
    </group>
  );
};

// 3D Bunsen Burner with Flame
const BunsenBurner3D: React.FC<{ active: boolean }> = ({ active }) => {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flameRef.current && active) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.15;
      flameRef.current.scale.set(s, s * 1.1, s);
    }
  });

  return (
    <group position={[1.2, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.1, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Barrel Column */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.0, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Air Hole Collar */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.18, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Dynamic Animated Flame */}
      {active && (
        <group position={[0, 0.2, 0]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.18, 0.6, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <pointLight color="#38bdf8" intensity={2} distance={3} />
        </group>
      )}

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Bunsen Burner
      </Text>
    </group>
  );
};

// 3D Burette & Stand
const BuretteStand3D: React.FC = () => {
  return (
    <group position={[-2.4, 0.6, -0.5]}>
      {/* Stand Base */}
      <mesh position={[0, -1.75, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Stand Rod */}
      <mesh position={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.5, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Clamp */}
      <mesh position={[0.1, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.1]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      {/* Burette Tube */}
      <mesh position={[-0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.8, 16]} />
        <meshPhysicalMaterial
          color="#f1f5f9"
          transmission={0.9}
          transparent
          opacity={0.3}
          roughness={0.05}
        />
      </mesh>
      <Text
        position={[-0.2, 1.8, 0]}
        fontSize={0.15}
        color="#38bdf8"
        anchorX="center"
      >
        Burette 50 mL
      </Text>
    </group>
  );
};

export const Lab3DScene: React.FC<Lab3DSceneProps> = ({
  liquidColor = '#3b82f6',
  liquidLevel = 0.5,
  isHeating = false,
  isStirring = false,
  bubbles = false,
  showBurette = true,
  onApparatusClick,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <LabFallback
        liquidColor={liquidColor}
        liquidLevel={liquidLevel}
        isHeating={isHeating}
      />
    );
  }

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden relative border border-cyan-500/20 bg-slate-950/80 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
      {/* Scene Info Overlay Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-300 font-medium">3D WebGL Scene</span>
        <span className="text-slate-400">| Drag to Rotate · Scroll to Zoom</span>
      </div>

      <Canvas
        camera={{ position: [0, 1.5, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 4, 2]} intensity={0.5} color="#38bdf8" />

        <Workbench />
        <Beaker3D
          liquidColor={liquidColor}
          liquidLevel={liquidLevel}
          isHeating={isHeating}
          onClick={() => onApparatusClick?.('beaker-250')}
        />
        <BunsenBurner3D active={isHeating} />
        {showBurette && <BuretteStand3D />}

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
};
