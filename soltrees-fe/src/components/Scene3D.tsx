import React, { useEffect, useState, Suspense, createContext, useContext } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { MapControls, Environment, useAnimations, useGLTF, OrbitControls } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Birds } from './Birds';

interface Scene3DContextType {
  isRotating: boolean;
  setIsRotating: (isRotating: boolean) => void;
}

const Scene3DContext = createContext<Scene3DContextType>({
  isRotating: false,
  setIsRotating: () => {},
});

export const useScene3D = () => useContext(Scene3DContext);

// Bird component
function Bird({
  position = [0, 10, 0]
}) {
  const {
    scene,
    animations
  } = useGLTF('https://models.readyplayer.me/bird.glb');
  const {
    actions
  } = useAnimations(animations, scene);
  useEffect(() => {
    // Play flying animation if available
    const flyAction = actions['Fly'];
    if (flyAction) {
      flyAction.play();
    }
  }, [actions]);
  return <primitive object={scene} position={position} scale={0.5} />;
}

// Add this new component
const CelestialObject = ({
  isNight,
  position
}: {
  isNight: boolean;
  position: [number, number, number];
}) => {
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sun03.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, '/textures/2k_moon.jpg');
  return (
    <group position={position}>
      {!isNight ? (
        // Sun
        <group>
          {/* Sun core */}
          <Sphere args={[8, 32, 32]}>
          <meshStandardMaterial 
              map={sunTexture}
              metalness={0.1} 
              roughness={0.7} 
              emissive="#C4C4C4" 
              emissiveIntensity={0.2} 
            />
          </Sphere>
          {/* Sun glow */}
          <Sphere args={[12, 32, 32]}>
            <meshBasicMaterial color="#fffbe6" transparent opacity={0.2} />
          </Sphere>
          {/* Sun rays */}
          <group>
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              return (
                <mesh key={i} rotation={[0, angle, 0]} position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.3, 0.1, 16, 8]} />
                  <meshBasicMaterial color="#FDB813" transparent opacity={0.4} />
                </mesh>
              );
            })}
          </group>
          <pointLight color="#FDB813" intensity={2} distance={500} decay={1.5} />
          <directionalLight position={[0, 1, 0]} intensity={0.8} color="#FDB813" />
        </group>
      ) : (
        // Moon
        <group>
          {/* Moon core */}
          <Sphere args={[6, 32, 32]}>
            <meshStandardMaterial 
                map={moonTexture}
                metalness={0.1} 
                roughness={0.7} 
                emissive="#C4C4C4" 
                emissiveIntensity={0.2} 
            />
          </Sphere>

          {/* Moon shading */}
          <Sphere args={[6.1, 32, 32]} position={[2, 0, 0]}>
            <meshStandardMaterial color="#000" transparent opacity={0.15} />
          </Sphere>
          <pointLight color="#C4C4C4" intensity={1} distance={300} decay={1.5} />
        </group>
      )}
    </group>
  );
};

// Add this Stars component
const Stars = ({ count = 200, radius = 180 }) => {
  const positions = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      // Random spherical coordinates
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + Math.random() * 20;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.push(x, y, z);
    }
    return new Float32Array(arr);
  }, [count, radius]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#fff" size={2} sizeAttenuation />
    </points>
  );
};

interface Scene3DProps {
  children: React.ReactNode;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  children
}) => {
  const [time, setTime] = useState(new Date());
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isNight = hour < 6 || hour > 18;
  // Scale and offset sun/moon Y position to make them lower in the sky
  const rawSunPosition = getSunPosition(hour);
  const sunPosition: [number, number, number] = [
    rawSunPosition[0],
    Math.max(rawSunPosition[1] * 0.5, 20) - 30,
    rawSunPosition[2]
  ];

  return (
    <Scene3DContext.Provider value={{ isRotating, setIsRotating }}>
      <ErrorBoundary fallbackRender={({ error }) => (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-lg text-red-500">
            Error loading 3D scene: {error.message}
          </div>
        </div>
      )}>
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center">
              <div className="text-lg">Loading 3D scene...</div>
            </div>}>
          <Canvas camera={{
            position: [0, 50, 50],
            fov: 45,
            near: 0.1,
            far: 2000
          }} style={{
            background: isNight ? 'linear-gradient(to bottom, #1a1b3b, #0f172a)' : 'linear-gradient(to bottom, #87CEEB, #E0F4FF)'
          }}>
            <Suspense fallback={null}>
              <ambientLight intensity={isNight ? 0.5 : 0.5} />
              <MapControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxDistance={500}
                minDistance={10}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
              />
              <OrbitControls 
                onStart={() => setIsRotating(true)}
                onEnd={() => setIsRotating(false)}
              />
              {isNight && <Stars />}
              <CelestialObject isNight={isNight} position={sunPosition} />
              <Terrain isNight={isNight} />
              <Birds />
              {children}
            </Suspense>
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </Scene3DContext.Provider>
  );
};

const Terrain = ({
  isNight
}: {
  isNight: boolean;
}) => {
  const grassTexture = useLoader(THREE.TextureLoader, '/textures/grass.jpg');
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 100, 100]} />
      <meshStandardMaterial 
        map={grassTexture}
        color={isNight ? '#6ee7b7' : '#4ade80'}
        metalness={0} 
        roughness={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

function getSunPosition(hour: number): [number, number, number] {
  // Map hour (0-24) to angle (0-2π)
  const angle = hour / 24 * Math.PI * 2;
  const radius = 150; // Keep large radius
  return [radius * Math.cos(angle), Math.max(radius * Math.sin(angle), 50) + 100, 0 // fixed north-south
  ];
}