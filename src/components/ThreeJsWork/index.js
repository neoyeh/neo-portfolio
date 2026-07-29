import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
// three's package.json only exposes this subpath via the "./addons/*"
// wildcard entry in its "exports" map. eslint-import-resolver-node@0.3.10
// (latest available) doesn't implement package.json "exports" resolution, so
// it can't find this file on disk and flags a false positive. Node's real ESM
// resolver and webpack (both of which do honor "exports") resolve it
// correctly — verified with
// `node -e "import('three/addons/loaders/GLTFLoader.js')"`, which succeeds,
// and by Task 11's `npm run build`, which compiled with no module-not-found
// errors for this import.
// eslint-disable-next-line import/no-unresolved, import/extensions
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
