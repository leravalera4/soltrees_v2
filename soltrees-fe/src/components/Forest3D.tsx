import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tree3D } from './Tree3D';
import { TreeCategory } from '../utils/categories';

interface TreeData {
  id: string;
  position: {
    x: string;
    y: string;
  };
  userData: {
    handle: string;
    description: string;
    link: string;
    _id: string;
    profilePicUrl?: string;
  };
  size: 'Small' | 'Medium' | 'Big' | 'Huge';
  wallet_address: string;
  type: 'classic' | 'bushy' | 'distorted';
  category: TreeCategory;
}

interface Forest3DProps {
  trees: TreeData[];
  onRightClick: (x: string, y: string) => void;
  onTreeClick: (tree: TreeData) => void;
  onDeleteTree: (treeId: string, treeWalletAddress: string) => void;
  walletAddress: string | null;
}

// Define terrain bounds
const TERRAIN_SIZE = 500; // Half the size of the terrain (since it's centered at 0,0)
const MIN_DISTANCE = 5; // Minimum distance from center to prevent planting in the middle

export const Forest3D: React.FC<Forest3DProps> = ({
  trees,
  onRightClick,
  onTreeClick,
  onDeleteTree,
  walletAddress
}) => {
  const { camera, gl } = useThree();

  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const distanceFromCenter = Math.sqrt(intersection.x * intersection.x + intersection.z * intersection.z);
        if (distanceFromCenter < MIN_DISTANCE) {
          alert('Please plant trees further from the center');
          return;
        }
        if (Math.abs(intersection.x) > TERRAIN_SIZE || Math.abs(intersection.z) > TERRAIN_SIZE) {
          alert('Please plant trees within the forest area');
          return;
        }
        onRightClick(intersection.x.toString(), intersection.z.toString());
      }
    };
    gl.domElement.addEventListener('contextmenu', handleContextMenu);
    return () => {
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, gl, onRightClick]);

  return (
    <group>
      {trees.map(tree => (
        <Tree3D
          key={tree.id}
          position={[parseFloat(tree.position.x), -0.5, parseFloat(tree.position.y)]}
          username={tree.userData.handle}
          size={tree.size}
          type={tree.type}
          profilePicUrl={tree.userData.profilePicUrl || ''}
          onClick={() => {
            onTreeClick(tree);
          }}
          onDelete={() => onDeleteTree(tree.id, tree.wallet_address)}
          isOwner={walletAddress === tree.wallet_address}
        />
      ))}
    </group>
  );
}; 