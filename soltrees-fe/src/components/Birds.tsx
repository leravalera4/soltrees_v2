// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import * as THREE from 'three';

// const NUM_BIRDS = 8;
// const BIRD_URL = '/models/papercraft_birds.glb'; // Update path as needed

// const leftWingNames = ['left_wing_6', 'left_wing_8'];
// const rightWingNames = ['right_wing_5', 'right_wing_7'];

// function BirdModel({ index }: { index: number }) {
//   const { scene } = useGLTF(BIRD_URL);
//   const birdRef = useRef<THREE.Group>(null);
//   const leftWings = useRef<THREE.Object3D[]>([]);
//   const rightWings = useRef<THREE.Object3D[]>([]);

//   useEffect(() => {
//     if (!birdRef.current) return;
//     leftWings.current = [];
//     rightWings.current = [];
//     leftWingNames.forEach((name) => {
//       const obj = birdRef.current!.getObjectByName(name);
//       if (obj) leftWings.current.push(obj);
//     });
//     rightWingNames.forEach((name) => {
//       const obj = birdRef.current!.getObjectByName(name);
//       if (obj) rightWings.current.push(obj);
//     });
//   }, [scene]);

//   useEffect(() => {
//     if (scene) {
//       scene.traverse((obj) => {
//         if (obj.isMesh || obj.isObject3D) {
//           console.log('Model object:', obj.name);
//         }
//       });
//     }
//   }, [scene]);

//   useFrame(({ clock }) => {
//     const t = clock.getElapsedTime() + index;
//     if (!birdRef.current) return;
//     // Animate flight path
//     const radius = 60 + 10 * Math.sin(t * 0.2 + index);
//     const speed = 0.2 + 0.05 * index;
//     birdRef.current.position.x = Math.cos(t * speed) * radius;
//     birdRef.current.position.y = 30 + 10 * Math.sin(t * speed * 1.2 + index);
//     birdRef.current.position.z = Math.sin(t * speed) * radius;
//     birdRef.current.rotation.y = Math.PI / 2 - t * speed;
//     // Animate wings
//     const flapAngle = Math.sin(t * 10) * 0.5;
//     leftWings.current.forEach((wing) => {
//       wing.rotation.z = flapAngle;
//     });
//     rightWings.current.forEach((wing) => {
//       wing.rotation.z = -flapAngle;
//     });
//   });

//   return <primitive ref={birdRef} object={scene} scale={10} />;
// }

import React, { useEffect, useRef, useState } from 'react'
import { BirdModel } from './BirdModel'

export const Birds: React.FC = () => {
  const [birds, setBirds] = useState<any[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new window.WebSocket('wss://www.soltrees.io')
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'birds') setBirds(data.birds)
    }
    return () => { ws.current && ws.current.close() }
  }, [])

  const handleJump = (index: number) => {
    ws.current?.send(JSON.stringify({ type: 'jump', index }))
  }

  return (
    <>
      {birds.map(bird => (
        <BirdModel
          key={bird.index}
          position={[bird.position.x, bird.position.y - 0.6, bird.position.z]}
          direction={[bird.direction.x, bird.direction.y, bird.direction.z]}
          onClick={() => handleJump(bird.index)}
        />
      ))}
    </>
  )
} 
