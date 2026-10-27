'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { InteractiveApparatus, type ApparatusItem } from './InteractiveApparatus';
import { LabFallback } from './LabFallback';
import {
  FlameIcon,
  DropletsIcon,
  RotateCcwIcon,
  SparklesIcon,
  CheckIcon,
} from '@/components/ui/Icons';
import {
  playBurnerSound,
  playPouringSound,
  playGlassClink,
  playStepChime,
} from '@/lib/audio/sounds';

interface InteractiveWorkbenchProps {
  initialItems?: ApparatusItem[];
  liquidColor?: string;
  isHeating?: boolean;
  onStepActionTriggered?: (actionType: string, targetId?: string) => void;
}

export const InteractiveWorkbench: React.FC<InteractiveWorkbenchProps> = ({
  initialItems,
  liquidColor = '#38bdf8',
  isHeating = false,
  onStepActionTriggered,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Deployed apparatus list on workbench
  const [items, setItems] = useState<ApparatusItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    return [
      {
        id: 'flask-1',
        modelType: 'conical-flask',
        name: 'Conical Flask',
        chemicalName: 'Standard Solution',
        position: [-1.2, -1.0, 0],
        liquidColor: liquidColor,
        liquidLevel: 0.6,
        isHeating: false,
      },
      {
        id: 'burner-1',
        modelType: 'burner',
        name: 'Bunsen Burner',
        position: [1.6, -1.0, 0],
        isHeating: isHeating,
      },
      {
        id: 'tripod-1',
        modelType: 'tripod',
        name: 'Tripod & Gauze',
        position: [1.6, -1.0, 0],
      },
      {
        id: 'china-dish-1',
        modelType: 'china-dish',
        name: 'China Dish',
        chemicalName: 'Mixture',
        position: [0.2, -1.0, 0.8],
        liquidColor: '#e0f2fe',
        liquidLevel: 0.3,
      },
      {
        id: 'test-tube-1',
        modelType: 'test-tube',
        name: 'Test Tube',
        chemicalName: 'Sample',
        position: [-2.4, -1.0, 0.5],
        liquidColor: '#f43f5e',
        liquidLevel: 0.5,
      },
    ];
  });

  const [selectedId, setSelectedId] = useState<string | null>('flask-1');
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [hintMessage, setHintMessage] = useState<string>(
    'Drag apparatus with your hand onto the table. Move the burner under the tripod to heat!'
  );

  // Check WebGL availability
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

  // Sync external heating or color changes from experiment steps
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.modelType === 'burner') {
          return { ...item, isHeating };
        }
        if (item.modelType === 'conical-flask' || item.modelType === 'beaker') {
          return { ...item, liquidColor };
        }
        return item;
      })
    );
  }, [liquidColor, isHeating]);

  // Handle apparatus movement on table
  const handleMove = (id: string, newPos: [number, number, number]) => {
    setItems((prev) => {
      const movedItem = prev.find((it) => it.id === id);
      const updated = prev.map((it) =>
        it.id === id ? { ...it, position: newPos } : it
      );

      if (!movedItem) return updated;

      // 1. Proximity Trigger: Burner under Tripod / China Dish / Flask
      if (movedItem.modelType === 'burner') {
        const tripod = updated.find((it) => it.modelType === 'tripod');
        const chinaDish = updated.find((it) => it.modelType === 'china-dish');
        const flask = updated.find(
          (it) => it.modelType === 'conical-flask' || it.modelType === 'beaker'
        );

        const target = chinaDish || flask || tripod;
        if (target) {
          const dx = newPos[0] - target.position[0];
          const dz = newPos[2] - target.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          // If burner is dragged under target (< 0.85 distance) -> ignite and heat!
          if (dist < 0.85 && !movedItem.isHeating) {
            movedItem.isHeating = true;
            if (chinaDish) chinaDish.isHeating = true;
            if (flask) flask.isHeating = true;
            playBurnerSound();
            setHintMessage(`🔥 Burner placed under ${target.name}! Heating initiated.`);
            onStepActionTriggered?.('heat', movedItem.id);
          }
        }
      }

      // 2. Proximity Trigger: Dragging a vessel near another vessel to Pour!
      const isVessel =
        movedItem.modelType === 'beaker' ||
        movedItem.modelType === 'test-tube' ||
        movedItem.modelType === 'measuring-cylinder' ||
        movedItem.modelType === 'conical-flask';

      if (isVessel && movedItem.liquidLevel && movedItem.liquidLevel > 0.1) {
        // Find another vessel nearby
        const targetVessel = updated.find(
          (it) =>
            it.id !== id &&
            (it.modelType === 'conical-flask' ||
              it.modelType === 'beaker' ||
              it.modelType === 'china-dish' ||
              it.modelType === 'test-tube')
        );

        if (targetVessel) {
          const dx = newPos[0] - targetVessel.position[0];
          const dz = newPos[2] - targetVessel.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 0.95 && !movedItem.isPouring) {
            movedItem.isPouring = true;
            playPouringSound();
            setHintMessage(
              `💧 Pouring from ${movedItem.name} into ${targetVessel.name}...`
            );

            // Execute transfer after brief tilt animation
            setTimeout(() => {
              setItems((currentItems) =>
                currentItems.map((item) => {
                  if (item.id === movedItem.id) {
                    return {
                      ...item,
                      isPouring: false,
                      liquidLevel: Math.max(0.1, (item.liquidLevel || 0.5) - 0.3),
                    };
                  }
                  if (item.id === targetVessel.id) {
                    return {
                      ...item,
                      liquidLevel: Math.min(0.9, (item.liquidLevel || 0.2) + 0.35),
                      liquidColor: movedItem.liquidColor || item.liquidColor,
                      chemicalName: movedItem.chemicalName || item.chemicalName,
                    };
                  }
                  return item;
                })
              );
              playStepChime();
              setHintMessage(`✅ Liquid transferred into ${targetVessel.name}!`);
              onStepActionTriggered?.('pour_liquid', targetVessel.id);
              onStepActionTriggered?.('add_chemical', targetVessel.id);
            }, 800);
          }
        }
      }

      return updated;
    });
  };

  // Add new apparatus from bottom dock
  const handleDeployApparatus = (
    modelType: ApparatusItem['modelType'],
    name: string
  ) => {
    playGlassClink();
    const newId = `${modelType}-${Date.now().toString().slice(-4)}`;
    const posX = (Math.random() - 0.5) * 3.5;
    const posZ = (Math.random() - 0.5) * 1.8;

    const newItem: ApparatusItem = {
      id: newId,
      modelType,
      name,
      position: [posX, -1.0, posZ],
      liquidColor:
        modelType.includes('flask') || modelType.includes('beaker')
          ? '#38bdf8'
          : undefined,
      liquidLevel:
        modelType.includes('flask') || modelType.includes('beaker')
          ? 0.5
          : undefined,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newId);
    setHintMessage(`Added ${name} to table. Drag to position.`);
    onStepActionTriggered?.('place_equipment', newId);
  };

  // Remove selected apparatus
  const handleRemoveSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((it) => it.id !== selectedId));
    setSelectedId(null);
  };

  // Toggle flame on burner
  const handleToggleFlame = () => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.modelType === 'burner') {
          const nextState = !it.isHeating;
          if (nextState) playBurnerSound();
          onStepActionTriggered?.('heat', it.id);
          setHintMessage(
            nextState
              ? '🔥 Burner ignited! Drag it under tripod/china-dish to heat chemicals.'
              : 'Burner flame extinguished.'
          );
          return { ...it, isHeating: nextState };
        }
        return it;
      })
    );
  };

  // Change chemical reagent in selected vessel
  const handleAddChemical = (reagentName: string, color: string) => {
    if (!selectedId) return;
    playPouringSound();
    playStepChime();
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === selectedId) {
          onStepActionTriggered?.('add_chemical', it.id);
          onStepActionTriggered?.('mix', it.id);
          return {
            ...it,
            chemicalName: reagentName,
            liquidColor: color,
            liquidLevel: Math.max(0.65, (it.liquidLevel || 0) + 0.25),
          };
        }
        return it;
      })
    );
    setHintMessage(`🧪 Added ${reagentName} to selected container.`);
  };

  const selectedItem = items.find((it) => it.id === selectedId);

  if (!hasWebGL) {
    return <LabFallback liquidColor={liquidColor} isHeating={isHeating} />;
  }

  return (
    <div className="w-full h-full min-h-[520px] rounded-3xl overflow-hidden relative border border-cyan-500/25 bg-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col">
      {/* Top Banner Status & Instructions */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 max-w-md">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 text-xs shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
          <span className="font-bold text-white">Hands-On 3D Workbench</span>
          <span className="text-slate-400 text-[11px]">
            · Drag equipment by hand · Right-click/touch to rotate view
          </span>
        </div>
        {/* Dynamic Interactive Hint Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[11px] text-cyan-300 font-medium shadow-md">
          {hintMessage}
        </div>
      </div>

      {/* Selected Item HUD Controls (Top Right) */}
      {selectedItem && (
        <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-slate-200 shadow-xl space-y-2.5 max-w-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div>
              <div className="font-bold text-cyan-300 truncate">{selectedItem.name}</div>
              {selectedItem.chemicalName && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Contents: <span className="text-emerald-400">{selectedItem.chemicalName}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleRemoveSelected}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30"
            >
              Remove
            </button>
          </div>

          {/* Quick Hand Action Controls */}
          <div className="space-y-1.5">
            {selectedItem.modelType === 'burner' && (
              <button
                onClick={handleToggleFlame}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold cursor-pointer transition-all"
              >
                <FlameIcon className="w-4 h-4 text-cyan-400" />
                <span>{selectedItem.isHeating ? 'Extinguish Flame' : 'Ignite Bunsen Burner'}</span>
              </button>
            )}

            {(selectedItem.liquidLevel !== undefined ||
              selectedItem.modelType === 'china-dish' ||
              selectedItem.modelType === 'conical-flask' ||
              selectedItem.modelType === 'beaker' ||
              selectedItem.modelType === 'test-tube') && (
              <div>
                <div className="text-[10px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <DropletsIcon className="w-3 h-3 text-cyan-400" />
                  <span>Reagent Dropper (Add to vessel):</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={() => handleAddChemical('Dilute HCl (Acid)', '#ef4444')}
                    className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-left truncate cursor-pointer"
                  >
                    + Dilute HCl
                  </button>
                  <button
                    onClick={() => handleAddChemical('NaOH Solution (Base)', '#3b82f6')}
                    className="px-2 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/30 text-left truncate cursor-pointer"
                  >
                    + NaOH Base
                  </button>
                  <button
                    onClick={() => handleAddChemical('Phenolphthalein', '#ec4899')}
                    className="px-2 py-1 rounded-lg bg-pink-950/80 hover:bg-pink-900 text-pink-300 border border-pink-500/30 text-left truncate cursor-pointer"
                  >
                    + Indicator
                  </button>
                  <button
                    onClick={() => handleAddChemical('CuSO4 Solution', '#0ea5e9')}
                    className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-left truncate cursor-pointer"
                  >
                    + CuSO₄ Blue
                  </button>
                  <button
                    onClick={() => handleAddChemical('Iron + Sulphur', '#eab308')}
                    className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-left truncate cursor-pointer"
                  >
                    + Fe + S Mix
                  </button>
                  <button
                    onClick={() => handleAddChemical('Distilled Water', '#38bdf8')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 text-left truncate cursor-pointer"
                  >
                    + H₂O Water
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative cursor-default">
        <Canvas
          camera={{ position: [0, 2.2, 5.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          onPointerDown={() => setOrbitEnabled(false)}
          onPointerUp={() => setOrbitEnabled(true)}
        >
          {/* Scientific Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow />
          <pointLight position={[-4, 5, 2]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[3, 4, -2]} intensity={0.4} color="#818cf8" />

          {/* Workbench Table */}
          <group position={[0, -1.2, 0]}>
            <mesh receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[11, 0.4, 7]} />
              <meshStandardMaterial
                color="#090d16"
                roughness={0.15}
                metalness={0.65}
              />
            </mesh>
            {/* Cyan Edge Neon Glow */}
            <mesh position={[0, 0.15, 3.51]}>
              <boxGeometry args={[11, 0.05, 0.05]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            {/* Bench Measurement Grid */}
            <gridHelper
              args={[10, 20, '#06b6d4', '#1e293b']}
              position={[0, 0.205, 0]}
            />
          </group>

          {/* Deployed Movable Apparatus */}
          {items.map((item) => (
            <InteractiveApparatus
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={(id) => setSelectedId(id)}
              onMove={handleMove}
            />
          ))}

          {/* Camera Controls */}
          <OrbitControls
            enabled={orbitEnabled}
            enablePan={false}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={2.5}
            maxDistance={8.5}
          />
        </Canvas>
      </div>

      {/* Equipment Dock / Bottom Shelf (Like NOBOOK Virtual Lab) */}
      <div className="border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl p-3 z-20 flex items-center justify-between gap-3 overflow-x-auto select-none">
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10 text-xs text-slate-300 font-semibold">
          <SparklesIcon className="w-4 h-4 text-cyan-400" />
          <span>Equip Dock:</span>
        </div>

        {/* Deployable Apparatus Cards */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => handleDeployApparatus('conical-flask', 'Conical Flask')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>⚗️</span>
            <span>Conical Flask</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('beaker', 'Beaker 250mL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🥛</span>
            <span>Beaker</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('test-tube', 'Test Tube')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🧪</span>
            <span>Test Tube</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('china-dish', 'China Dish')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🥣</span>
            <span>China Dish</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('burner', 'Bunsen Burner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🔥</span>
            <span>Bunsen Burner</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('tripod', 'Tripod Stand')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>📐</span>
            <span>Tripod & Gauze</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('measuring-cylinder', 'Measuring Cylinder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>📏</span>
            <span>Measuring Cylinder</span>
          </button>

          <button
            onClick={() => handleDeployApparatus('lab-stand', 'Laboratory Stand')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-800 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🧪</span>
            <span>Lab Stand & Clamp</span>
          </button>
        </div>

        {/* Reset Workbench Button */}
        <button
          onClick={() => {
            playGlassClink();
            setItems([
              {
                id: 'flask-1',
                modelType: 'conical-flask',
                name: 'Conical Flask',
                chemicalName: 'Standard Solution',
                position: [-1.2, -1.0, 0],
                liquidColor: '#38bdf8',
                liquidLevel: 0.6,
              },
              {
                id: 'burner-1',
                modelType: 'burner',
                name: 'Bunsen Burner',
                position: [1.6, -1.0, 0],
                isHeating: false,
              },
              {
                id: 'tripod-1',
                modelType: 'tripod',
                name: 'Tripod & Gauze',
                position: [1.6, -1.0, 0],
              },
              {
                id: 'china-dish-1',
                modelType: 'china-dish',
                name: 'China Dish',
                chemicalName: 'Mixture',
                position: [0.2, -1.0, 0.8],
                liquidColor: '#e0f2fe',
                liquidLevel: 0.3,
              },
            ]);
            setSelectedId('flask-1');
            setHintMessage('Workbench reset to default clean state.');
          }}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 shrink-0 cursor-pointer transition-colors"
          title="Reset Workbench Table"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
