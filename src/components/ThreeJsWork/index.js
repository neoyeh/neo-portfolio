import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import gltfPath from '../../assets/scene.gltf';

function Model() {
  const gltf = useLoader(GLTFLoader, gltfPath);
  return (
      <primitive object={gltf.scene} scale={0.4} />
  );
}

function ThreeJsWork() {
  return (
      <Canvas>
          <Suspense fallback={null}>
              <Model />
              <OrbitControls />
              <Environment preset="sunset" />
          </Suspense>
      </Canvas>
  );
}

export default ThreeJsWork;
