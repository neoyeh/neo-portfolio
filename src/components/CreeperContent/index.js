import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Stats } from "@react-three/drei"

import Creeper from './crepper';

const CreeperContent = () => {

  const node = useRef(document.createElement('div'))

  useEffect(() => {
    node.current.id = 'fps'
    document.getElementsByClassName('page')[0].appendChild(node.current)

    return () => document.getElementsByClassName('page')[0].removeChild(node.current)
  }, [])

  return (
      <Canvas camera={{position: [25, 10, 25]}}>
        <Suspense fallback={null}>
          <OrbitControls />
          <Environment preset="sunset" />

          <Creeper/>

          <mesh position={[0, -7, 0]} rotation-x={-0.5 * Math.PI } >
            <planeGeometry args={[60, 60]}/>
            <meshLambertMaterial emissive="#666" />
          </mesh>
          
          <axesHelper args={[20]}  position={[0, -7, 0]}/>
        </Suspense>
        <Stats parent={node} className={"canvas-stats"} />
      </Canvas>
  )
};


export default CreeperContent; 
