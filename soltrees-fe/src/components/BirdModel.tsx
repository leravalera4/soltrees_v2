import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function BirdModel({
  position,
  direction,
  onClick,
}: {
  position: [number, number, number]
  direction: [number, number, number]
  onClick: () => void
}) {
  const gltf = useLoader(GLTFLoader, '/models/block_bird.glb')
  //const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const birdRef = useRef<THREE.Group>(null)

  const leftWingNames = ['left_wing_6', 'left_wing_8']
  const rightWingNames = ['right_wing_5', 'right_wing_7']
  const leftWingsRef = useRef<THREE.Object3D[]>([])
  const rightWingsRef = useRef<THREE.Object3D[]>([])
  const leftLegRef = useRef<THREE.Object3D | null>(null)
  const rightLegRef = useRef<THREE.Object3D | null>(null)

  // Обновляем позицию при изменении пропса
  useEffect(() => {
    if (birdRef.current) {
      birdRef.current.position.set(...position)
    }
  }, [position])

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)
  
    // Автоматически находим смещение модели по Y
    const box = new THREE.Box3().setFromObject(cloned)
    const yOffset = box.min.y
    cloned.position.y -= yOffset // смещаем вниз на высоту нижней точки
  
    return cloned
  }, [gltf.scene])
  // Получаем крылья и ноги после загрузки модели
  useEffect(() => {
    if (!birdRef.current) return

    leftWingsRef.current = leftWingNames
      .map(name => birdRef.current!.getObjectByName(name))
      .filter(Boolean) as THREE.Object3D[]

    rightWingsRef.current = rightWingNames
      .map(name => birdRef.current!.getObjectByName(name))
      .filter(Boolean) as THREE.Object3D[]

    leftLegRef.current = birdRef.current.getObjectByName('bb_main_3')
    rightLegRef.current = birdRef.current.getObjectByName('bb_main_4')
  }, [scene])

  useFrame(({ clock }) => {
    if (!birdRef.current) return

    const t = clock.getElapsedTime()

    // Поворот по направлению
    const dir = new THREE.Vector3(...direction)
    birdRef.current.lookAt(birdRef.current.position.clone().add(dir))
    birdRef.current.rotateY(Math.PI)
    // Крылья
    const flapAngle = Math.sin(t * 10) * 0.2
    leftWingsRef.current.forEach(wing => (wing.rotation.z = flapAngle))
    rightWingsRef.current.forEach(wing => (wing.rotation.z = -flapAngle))

    // Ноги
    const legAngle = Math.sin(t * 10) * 0.5
    if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle
  })

  return <primitive ref={birdRef} object={scene} scale={1.5} onClick={onClick} />
}


