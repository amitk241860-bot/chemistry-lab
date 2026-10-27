'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playGlassClink, playPouringSound } from '@/lib/audio/sounds';

export interface ApparatusItem {
  id: string;
  modelType:
    | 'conical-flask'
    | 'beaker'
    | 'test-tube'
    | 'china-dish'
    | 'burner'
    | 'tripod'
    | 'measuring-cylinder'
    | 'lab-stand';
  name: string;
  chemicalName?: string;
  volumeMl?: number;
  position: [number, number, number];
  liquidColor?: string;
  liquidLevel?: number; // 0 to 1
  isHeating?: boolean;
  isPouring?: boolean;
}

interface InteractiveApparatusProps {
  item: ApparatusItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, newPos: [number, number, number]) => void;
}

export const InteractiveApparatus: React.FC<InteractiveApparatusProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { raycaster, gl } = useThree();

  // Model file path from public/models/
  const modelPath = `/models/${item.modelType}.glb`;
  const { scene } = useGLTF(modelPath);

  // Clone scene so each instance has independent transforms & materials
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (
          item.modelType === 'beaker' ||
          item.modelType === 'test-tube' ||
          item.modelType === 'measuring-cylinder'
        ) {
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.55;
            mat.roughness = 0.05;
          }
        }
      }
    });
    return clone;
  }, [scene, item.modelType]);

  // Plane for raycasting apparatus position on workbench (y = -1.0)
  const floorPlane = React.useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.0),
    []
  );
  const planeIntersectPoint = React.useMemo(() => new THREE.Vector3(), []);

  // Handle pointer down for dragging
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelect(item.id);
    playGlassClink();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    // Raycast against workbench plane to get 3D table coordinates
    raycaster.ray.intersectPlane(floorPlane, planeIntersectPoint);
    if (planeIntersectPoint) {
      // Clamp bounds within table perimeter
      const clampedX = Math.max(-3.5, Math.min(3.5, planeIntersectPoint.x));
      const clampedZ = Math.max(-2.2, Math.min(2.2, planeIntersectPoint.z));
      onMove(item.id, [clampedX, item.position[1], clampedZ]);
    }
  };

  // Change cursor when hovering over apparatus
  useEffect(() => {
    gl.domElement.style.cursor = isDragging
      ? 'grabbing'
      : isHovered
      ? 'grab'
      : 'auto';
  }, [isHovered, isDragging, gl]);

  // Flame animation and smooth pouring tilt
  const flameRef = useRef<THREE.Mesh>(null);
  const currentTilt = useRef(0);

  useFrame((state, delta) => {
    // Flame flicker
    if (flameRef.current && item.isHeating) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 25) * 0.18;
      flameRef.current.scale.set(s, s * 1.15, s);
    }

    // Smooth pouring tilt
    const targetTilt = item.isPouring ? -Math.PI / 4 : 0;
    currentTilt.current = THREE.MathUtils.damp(currentTilt.current, targetTilt, 8, delta);
    if (groupRef.current) {
      groupRef.current.rotation.z = currentTilt.current;
    }
  });

  return (
    <group
      ref={groupRef}
      position={item.position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* 3D GLB Model Mesh */}
      <primitive object={clonedScene} scale={[1.2, 1.2, 1.2]} />

      {/* Internal Chemical Liquid for Glassware */}
      {item.liquidLevel && item.liquidLevel > 0 && item.liquidColor && (
        <mesh position={[0, item.liquidLevel * 0.4 - 0.4, 0]}>
          <cylinderGeometry
            args={[
              item.modelType === 'test-tube' ? 0.18 : 0.55,
              item.modelType === 'test-tube' ? 0.18 : 0.6,
              item.liquidLevel * 0.8,
              24,
            ]}
          />
          <meshStandardMaterial
            color={item.liquidColor}
            transparent
            opacity={0.82}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Dynamic Animated Flame for Burner */}
      {item.modelType === 'burner' && item.isHeating && (
        <group position={[0, 0.45, 0]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.18, 0.65, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <pointLight color="#38bdf8" intensity={2.5} distance={3} />
        </group>
      )}

      {/* Steam / Vapour Bubbles when Heating */}
      {item.isHeating && item.modelType !== 'burner' && (
        <group position={[0, 0.7, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.05, 0.25, -0.02]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Pouring Liquid Stream Effect */}
      {item.isPouring && item.liquidColor && (
        <mesh position={[-0.4, -0.2, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.05, 0.8, 12]} />
          <meshStandardMaterial
            color={item.liquidColor}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Selection Glow Ring on Workbench */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.82, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#06b6d4' : '#38bdf8'}
            transparent
            opacity={isSelected ? 0.9 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Floating Name Label */}
      <Text
        position={[0, 1.25, 0]}
        fontSize={0.14}
        color={isSelected ? '#22d3ee' : '#94a3b8'}
        anchorX="center"
        anchorY="bottom"
      >
        {item.chemicalName ? `${item.name} (${item.chemicalName})` : item.name}
      </Text>
    </group>
  );
};

// Preload all 3D GLB assets from public/models
useGLTF.preload('/models/conical-flask.glb');
useGLTF.preload('/models/beaker.glb');
useGLTF.preload('/models/test-tube.glb');
useGLTF.preload('/models/china-dish.glb');
useGLTF.preload('/models/burner.glb');
useGLTF.preload('/models/tripod.glb');
useGLTF.preload('/models/measuring-cylinder.glb');
useGLTF.preload('/models/lab-stand.glb');
