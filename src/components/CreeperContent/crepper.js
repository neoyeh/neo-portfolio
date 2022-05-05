import React, { useRef } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'

import face from '../../assets/images/creeper_face.png';
import skin from '../../assets/images/creeper_skin.png';

const Creeper = ({color, wireframe}) => {
    const attr = {
        emissive : color?color:"#0f0",
        wireframe : wireframe?wireframe: false,
    }
    const [headMap, skinMap] = useLoader(TextureLoader, [face, skin])

    return (
        <group dispose={null}>
            <mesh position={[0, 6, 0]}>
                <boxGeometry args={[4, 4, 4]} />
                {/* <meshPhongMaterial {...attr} /> */}
                {[...Array(6)].map((x,i)=>{
                    return <meshStandardMaterial 
                        map={(i===4)?headMap:skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        opacity= {0.9}
                        side= {'THREE.DoubleSide'}
                        attachArray="material"
                    />
                })}
            </mesh>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[4, 8, 2]}/>
                {/* <meshPhongMaterial {...attr} /> */}
                <meshStandardMaterial 
                    map={skinMap}
                    roughness= {0.3}
                    metalness= {0.8}
                    transparent= {true}
                    opacity= {0.9}
                    side= {'THREE.DoubleSide'}
                />
            </mesh>
            <group dispose={null}>
                <mesh position={[-1, -5.5, 2]}>
                    <boxGeometry args={[4, 3, 2]} />
                    {/* <meshPhongMaterial {...attr} /> */}
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        opacity= {0.9}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh position={[-1, -5.5, -2]}>
                    <boxGeometry args={[4, 3, 2]} />
                    {/* <meshPhongMaterial {...attr} /> */}
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        opacity= {0.9}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh position={[1, -5.5, 2]}>
                    <boxGeometry args={[4, 3, 2]} />
                    {/* <meshPhongMaterial {...attr} /> */}
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        opacity= {0.9}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh position={[1, -5.5, -2]}>
                    <boxGeometry args={[4, 3, 2]} />
                    {/* <meshPhongMaterial {...attr} /> */}
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        opacity= {0.9}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
            </group>
        </group>
    )
};


export default Creeper; 
