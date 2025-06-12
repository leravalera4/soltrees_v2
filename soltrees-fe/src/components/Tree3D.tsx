import React, { useState, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
interface Tree3DProps {
  position: [number, number, number];
  username: string;
  profilePicUrl: string;
  size: 'Small' | 'Medium' | 'Big' | 'Huge';
  type: 'classic' | 'bushy' | 'distorted';
  onClick: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
  decorations?: {
    lights?: boolean;
    ornaments?: boolean;
    star?: boolean;
  };
}
export const Tree3D: React.FC<Tree3DProps> = ({
  position,
  username,
  profilePicUrl,
  size,
  type = 'classic',
  onClick,
  onDelete,
  isOwner,
  decorations
}) => {
  // Updated size scales with more dramatic differences
  const sizeScales = {
    Small: {
      scale: 0.45,
      layers: 4
    },
    Medium: {
      scale: 1.0,
      layers: 5
    },
    Big: {
      scale: 2.75,
      layers: 6
    },
    Huge: {
      scale: 3.5,
      layers: 7
    }
  };
  const config = sizeScales[size];
  const factor = config.scale;

  // useMemo для foliage classic
  const classicFoliageParams = useMemo(() => {
    return Array.from({ length: Math.max(3, Math.floor(4 * factor)) }).map((_, i) => {
      const currentRadius = 3.0 * factor * Math.pow(0.65, i);
      const currentY = 6.5 * factor * 0.65 + i * (currentRadius * (1.0 + 0.2 * Math.random()) * 0.55);
      const scaleY = THREE.MathUtils.randFloat(0.7, 1.3);
      const scaleZ = THREE.MathUtils.randFloat(0.7, 1.3);
      return { currentRadius, currentY, scaleY, scaleZ };
    });
  }, [factor]);

  // useMemo для foliage bushy
  const bushyFoliageParams = useMemo(() => {
    return Array.from({ length: Math.floor(30 * Math.pow(factor, 1.8) + 20) }).map((_, i) => {
      const blobRadius = THREE.MathUtils.randFloat(0.4 * factor, 1.1 * factor);
      const canopyRadius = 3.0 * factor;
      const phi = Math.acos(-1 + 2 * i / 30);
      const theta = Math.sqrt(30 * Math.PI) * phi;
      const randomOffsetRadius = canopyRadius * THREE.MathUtils.randFloat(0.25, 1.0);
      const posX = Math.cos(theta) * Math.sin(phi) * randomOffsetRadius;
      const posY = Math.sin(theta) * Math.sin(phi) * randomOffsetRadius * 0.8 + 5.5 * factor * 0.8 + canopyRadius * 0.25;
      const posZ = Math.cos(phi) * randomOffsetRadius;
      const scaleX = THREE.MathUtils.randFloat(0.7, 1.3);
      const scaleY = THREE.MathUtils.randFloat(0.7, 1.3);
      const scaleZ = THREE.MathUtils.randFloat(0.7, 1.3);
      const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
      const detail = Math.random() > 0.3 ? 1 : 0;
      const color = new THREE.Color().setHSL(
        THREE.MathUtils.randFloat(0.25, 0.38),
        THREE.MathUtils.randFloat(0.5, 0.85),
        THREE.MathUtils.randFloat(0.3, 0.6)
      );
      return { blobRadius, posX, posY, posZ, scaleX, scaleY, scaleZ, rotation, detail, color };
    });
  }, [factor]);

  // useMemo для foliage distorted
  const distortedFoliageParams = useMemo(() => {
    return Array.from({ length: Math.floor(10 * Math.pow(factor, 2.0) + 10) }).map((_, i) => {
      const clumpRadius = THREE.MathUtils.randFloat(0.5 * factor, 1.5 * factor);
      const spreadRadius = 3.0 * factor;
      const x = THREE.MathUtils.randFloatSpread(spreadRadius * 2.0);
      const y = 6.0 * factor * 0.45 + THREE.MathUtils.randFloat(0, 6.0 * factor * 0.9);
      const z = THREE.MathUtils.randFloatSpread(spreadRadius * 2.0);
      const rotX = Math.random() * Math.PI * 2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = Math.random() * Math.PI * 2;
      const scaleX = clumpRadius * THREE.MathUtils.randFloat(0.4, 1.6);
      const scaleY = clumpRadius * THREE.MathUtils.randFloat(0.4, 1.6);
      const scaleZ = clumpRadius * THREE.MathUtils.randFloat(0.4, 1.6);
      const color = new THREE.Color().setHSL(
        THREE.MathUtils.randFloat(0.2, 0.4),
        THREE.MathUtils.randFloat(0.4, 0.7),
        THREE.MathUtils.randFloat(0.25, 0.5)
      );
      return { x, y, z, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, color };
    });
  }, [factor]);

  const renderTreeShape = () => {
    switch (type) {
      case 'bushy':
        return <group>
            {/* Trunk */}
            <mesh position={[0, 5.5 * factor / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.25 * factor, 0.45 * factor, 5.5 * factor, 12]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Foliage */}
            {bushyFoliageParams.map((params, i) => (
              <mesh
                key={i}
                position={[params.posX, params.posY, params.posZ]}
                scale={[params.scaleX, params.scaleY, params.scaleZ]}
                rotation={params.rotation}
                castShadow
                receiveShadow
              >
                <icosahedronGeometry args={[params.blobRadius, params.detail]} />
                <meshStandardMaterial color={params.color} />
              </mesh>
            ))}
          </group>;
      case 'distorted':
        return <group>
            {/* Trunk */}
            <mesh position={[0, 6.0 * factor / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3 * 0.8 * factor, 0.3 * factor, 6.0 * factor, 10]} />
              <meshStandardMaterial color="#5C4033" />
            </mesh>
            {/* Distorted Foliage */}
            {distortedFoliageParams.map((params, i) => (
              <mesh
                key={i}
                position={[params.x, params.y, params.z]}
                rotation={[params.rotX, params.rotY, params.rotZ]}
                scale={[params.scaleX, params.scaleY, params.scaleZ]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={params.color} roughness={0.7} metalness={0.1} />
              </mesh>
            ))}
          </group>;
      default:
        // classic
        return <group>
            {/* Trunk */}
            <mesh position={[0, 6.5 * factor / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35 * 0.7 * factor, 0.35 * factor, 6.5 * factor, 10]} />
              <meshStandardMaterial color="#7A3C23" />
            </mesh>
            {/* Classic Foliage */}
            {classicFoliageParams.map((params, i) => (
              <mesh
                key={i}
                position={[0, params.currentY, 0]}
                scale={[1, params.scaleY, params.scaleZ]}
                castShadow
                receiveShadow
              >
                <sphereGeometry args={[params.currentRadius, 12, 8]} />
                <meshStandardMaterial color="#38761D" />
              </mesh>
            ))}
          </group>;
    }
  };
  const renderDecorations = () => {
    if (!decorations) return null;
    return <group>
        {decorations.lights && Array.from({
        length: config.layers * 2
      }).map((_, i) => <pointLight key={`light-${i}`} position={[Math.sin(i * Math.PI * 2) * 0.5 * config.scale, (i * 0.2 + 0.5) * config.scale, Math.cos(i * Math.PI * 2) * 0.5 * config.scale]} intensity={0.2} color={i % 2 === 0 ? '#ff0000' : '#00ff00'} distance={2} />)}
        {decorations.ornaments && Array.from({
        length: config.layers * 3
      }).map((_, i) => <mesh key={`ornament-${i}`} position={[Math.sin(i * Math.PI * 2) * 0.6 * config.scale, (i * 0.15 + 0.5) * config.scale, Math.cos(i * Math.PI * 2) * 0.6 * config.scale]}>
              <sphereGeometry args={[0.1 * config.scale, 16, 16]} />
              <meshStandardMaterial color={['#ff0000', '#ffd700', '#0000ff'][i % 3]} metalness={0.8} roughness={0.2} />
            </mesh>)}
        {decorations.star && <mesh position={[0, (config.layers * 0.25 + 0.7) * config.scale, 0]}>
            <starGeometry args={[0.2 * config.scale, 0.5 * config.scale, 5]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>}
      </group>;
  };
  const labelHeight = Math.max(8 * config.scale, 4); // Ensure label is always visible
  // Calculate trunk height for shifting
  let trunkHeight = 6.5 * config.scale;
  if (type === 'bushy') trunkHeight = 5.5 * config.scale;
  if (type === 'distorted') trunkHeight = 6.0 * config.scale;

  return <group position={position} onClick={(e) => {
    e.stopPropagation();
    onClick();
  }}
  onPointerOver={() => document.body.classList.add('cursor-eye')}
  onPointerOut={() => document.body.classList.remove('cursor-eye')}
  >
    <group position={[0, 0, 0]}>
      {renderTreeShape()}
      {renderDecorations()}
    </group>
      <Html position={[0, labelHeight, 0]} center occlude={false} sprite transform pointerEvents="none" zIndexRange={[0,0]}>
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-white/90 px-3 py-1 rounded-full shadow-md flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              <img src={profilePicUrl} alt="User avatar" />
            </div>
            <span className="text-sm">@{username}</span>
          </div>
          {/* {isOwner && <button onClick={e => {
          e.stopPropagation();
          if (window.confirm('Are you sure you want to delete this tree?')) {
            onDelete?.();
          }
        }} className="mt-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs hover:bg-red-600 transition-colors">
              Delete Tree
            </button>} */}
        </div>
      </Html>
  </group>;
};