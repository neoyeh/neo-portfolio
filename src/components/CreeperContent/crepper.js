import React, { useRef } from 'react'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'

import face from '../../assets/images/creeper_face.png';
import skin from '../../assets/images/creeper_skin.png';

const Creeper = ({color, wireframe}) => {
    const mapAttr = {
        emissive : color?color:"#0f0",
        wireframe : wireframe?wireframe: false,
    }
    const [headMap, skinMap] = useLoader(TextureLoader, [face, skin])


    const myhead = useRef()
    const mybody = useRef()
    const myfoot1 = useRef()
    const myfoot2 = useRef()
    const myfoot3 = useRef()
    const myfoot4 = useRef()
    const bodyClock = useRef(0);
    useFrame(({ clock }) => {
        bodyClock.current+=0.04
        let scaleRate = Math.abs(Math.sin(bodyClock.current)) / 16 + 1
        
        myhead.current.rotation.y = Math.sin(bodyClock.current)
        myfoot1.current.rotation.x = Math.sin(bodyClock.current)
        myfoot2.current.rotation.x = -Math.sin(bodyClock.current)
        myfoot3.current.rotation.x = -Math.sin(bodyClock.current)
        myfoot4.current.rotation.x = Math.sin(bodyClock.current)

        myhead.current.scale.set(scaleRate, scaleRate, scaleRate)
        mybody.current.scale.set(scaleRate, scaleRate, scaleRate)
        myfoot1.current.scale.set(scaleRate, scaleRate, scaleRate)
        myfoot2.current.scale.set(scaleRate, scaleRate, scaleRate)
        myfoot3.current.scale.set(scaleRate, scaleRate, scaleRate)
        myfoot4.current.scale.set(scaleRate, scaleRate, scaleRate)
    })

    return (
        <group dispose={null}>
            <mesh castShadow position={[0, 6, 0]} ref={myhead} >
                <boxGeometry args={[4, 4, 4]} />
                {[...Array(6)].map((x,i)=>{
                    return <meshStandardMaterial 
                        map={(i===4)?headMap:skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        side= {'THREE.DoubleSide'}
                        attachArray= "material"
                        key= {i}
                    />
                })}
            </mesh>
            <mesh castShadow position={[0, 0, 0]} ref={mybody}>
                <boxGeometry args={[4, 8, 2]}/>
                <meshStandardMaterial 
                    map={skinMap}
                    roughness= {0.3}
                    metalness= {0.8}
                    transparent= {true}
                    side= {'THREE.DoubleSide'}
                />
            </mesh>
            <group dispose={null}>
                <mesh castShadow position={[-1, -5.5, 2]} ref={myfoot1} >
                    <boxGeometry args={[2, 3, 2]} />
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh castShadow position={[-1, -5.5, -2]} ref={myfoot2} >
                    <boxGeometry args={[2, 3, 2]} />
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh castShadow position={[1, -5.5, 2]} ref={myfoot3} >
                    <boxGeometry args={[2, 3, 2]} />
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
                <mesh castShadow position={[1, -5.5, -2]} ref={myfoot4} >
                    <boxGeometry args={[2, 3, 2]} />
                    <meshStandardMaterial 
                        map={skinMap}
                        roughness= {0.3}
                        metalness= {0.8}
                        transparent= {true}
                        side= {'THREE.DoubleSide'}
                    />
                </mesh>
            </group>
        </group>
    )
};


export default Creeper; 
