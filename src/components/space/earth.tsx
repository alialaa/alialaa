import { TextureLoader } from "three";
import React, { useRef } from "react";
import { useLoader } from "react-three-fiber";
import earthImg from "@images/2k_earth_daymap.jpg";
import moonImg from "@images/2k_moon.jpg";
//@ts-ignore because react-spring/three has no type declerations
import { animated, useSpring } from "react-spring/three";

type EarthProps = {
    animations: boolean;
    night: boolean;
};
export default function Earth({ animations, night }: EarthProps) {
    const ref = useRef();
    const moonRef = useRef();
    const { rotation } = useSpring({
        rotation: night ? [0, Math.PI * 0.3, 0] : [0, -Math.PI * 0.5, 0],
        immediate: !animations
    });
    const [earth, moon] = useLoader<any>(TextureLoader, [earthImg, moonImg]);
    return (
        <animated.group
            ref={ref}
            scale={[100, 100, 100]}
            rotation={rotation}
            position={[-1400, -400, -1000]}
        >
            <mesh>
                <sphereBufferGeometry attach="geometry" args={[5, 32, 32]} />
                <meshStandardMaterial
                    attach="material"
                    map={earth}
                    roughness={1}
                    transparent
                    opacity={1}
                />
            </mesh>
            <mesh ref={moonRef} position={[2, 5, 5]}>
                <sphereBufferGeometry attach="geometry" args={[0.75, 32, 32]} />
                <meshStandardMaterial attach="material" roughness={1} map={moon} fog={false} />
            </mesh>
        </animated.group>
    );
}
