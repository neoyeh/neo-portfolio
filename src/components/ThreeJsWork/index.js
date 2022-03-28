import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls } from "@react-three/drei"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const Model = () => {
    const gltf = useLoader(GLTFLoader, "/scene.gltf");
    return (
      <>
        <primitive object={gltf.scene} scale={0.4} />
      </>
    );
};


const ThreeJsWork = () => {
    return (
        <Canvas>
            <Suspense fallback={null}>
            <Model />
            <OrbitControls />
            <Environment preset="sunset" />
        </Suspense>
        </Canvas>
    )
};


export default ThreeJsWork; 
