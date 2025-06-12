import React from 'react';
import { TREE_CATEGORIES } from '../utils/categories';
import * as THREE from 'three';
export const ZoneVisualization = () => {
  return <group>
      {Object.entries(TREE_CATEGORIES).map(([key, category]) => <group key={key} position={[category.position.x, 0, category.position.z]}>
          {/* Zone circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[category.position.radius - 0.1, category.position.radius, 32]} />
            <meshStandardMaterial color={category.color} opacity={0.2} transparent />
          </mesh>
          {/* Zone label */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <textGeometry args={[category.title, {
          size: 1,
          height: 0.1
        }]} />
            <meshStandardMaterial color={category.color} />
          </mesh>
        </group>)}
    </group>;
};