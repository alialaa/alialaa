import React, { useRef, useState, useCallback, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Color } from "three";
import Effects from "./effects";
import Stars from "./stars";
import Earth from "./earth";
import Mars from "./mars";
import Text from "./text";
import { NavigationItemType } from "@utils";
import { useMedia } from "@hooks";

// const Effects = React.lazy(() => import("./effects"));
// const Earth = React.lazy(() => import("./earth"));
// const Text = React.lazy(() => import("./text"));
// const Stars = React.lazy(() => import("./stars"));

function Camera({
    mouse,
    animations
}: {
    mouse: React.RefObject<[number, number]>;
    animations: boolean;
}) {
    const { camera } = useThree();
    useEffect(() => {
        if (!animations && mouse.current) {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.lookAt(0, 0, 0);
        }
    }, [animations]);
    useFrame(() => {
        if (!animations) return;
        if (!mouse.current) return;
        camera.position.x += 0.15 * ((1 - mouse.current[0]) * 0.2 - camera.position.x);
        camera.position.y += 0.15 * (mouse.current[1] * 0.3 - camera.position.y);
        camera.lookAt(0, 0, 0);
    });
    return null;
}

function Light({ mars }: { mars: boolean }) {
    return (
        <>
            {!mars && <directionalLight intensity={0.6} position={[1, 0.5, 0]} />}
            {mars && <directionalLight intensity={0.4} position={[0.7, 0.5, 0.5]} />}
        </>
    );
}

function Title({ page, title }: { page: NavigationItemType | undefined; title: string | null }) {
    if (!page) return null;
    const { size, viewport } = useThree();
    return (
        <group position={[0, -viewport.height / 2 + (size.width >= 1280 ? 750 : 550), -350]}>
            <Text hAlign="center" size={size.width >= 1280 ? 30 : 35} position={[0, 0, 0]}>
                {title || page.pageTitle || page.title}
            </Text>
        </group>
    );
}

// function Fps() {
//     let last = Date.now();
//     let qty = 0;
//     let currentAvg = 0;
//     useFrame(() => {
//         const now = Date.now();
//         const fps = 1 / ((now - last) / 1000);
//         const avg = Math.round((fps - currentAvg) / ++qty);
//         console.log(fps, currentAvg + avg, currentAvg);
//         currentAvg += avg;
//         last = now;
//     });
//     return null;
// }

function Space({
    page,
    night,
    animations,
    mars,
    title
}: {
    page: NavigationItemType | undefined;
    night: boolean;
    animations: boolean;
    mars: boolean;
    title: string | null;
}) {
    const [down, set] = useState<boolean>(false);
    const mouse = useRef<[number, number]>([0, 0]);
    const isSmall = useMedia(`screen and (max-width: ${890 / 16}em)`);
    useEffect(() => {
        set(true);
        setTimeout(() => {
            set(false);
        }, 250);
    }, [page]);

    const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
        mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2];
    }, []);
    const getPixelRatio = () => {
        const dpr = window.devicePixelRatio;
        if (dpr <= 1) {
            return 1;
        } else {
            return !animations || isSmall ? window.devicePixelRatio : 1.5;
        }
    };
    if (typeof window === "undefined") return null; //don't render during SSR
    return (
        <Canvas
            aria-hidden
            resize={
                (window as any).ResizeObserver
                    ? { debounce: { resize: 1000, scroll: 0 } }
                    : undefined
            }
            pixelRatio={getPixelRatio()}
            // pixelRatio={window.devicePixelRatio}
            camera={{ position: [0, 0, 2000], near: 0.01, far: 10000, fov: 40 }}
            onMouseUp={() => set(false)}
            onMouseDown={() => set(true)}
            onMouseMove={onMouseMove}
            invalidateFrameloop={!animations || isSmall}
            onCreated={({ gl, camera }) => {
                camera.lookAt(0, 0, 0);
                gl.setClearColor(new Color("#030008"));
            }}
        >
            {/* {animations && !isSmall && <Fps />} */}
            <Suspense fallback={null}>
                <Stars size={!animations || isSmall ? 0.5 : 0.8} />
            </Suspense>
            {!isSmall && (
                <>
                    <Camera mouse={mouse} animations={animations} />
                    <ambientLight intensity={0.03} />
                    <Light mars={mars} />
                    <pointLight
                        intensity={0.9}
                        position={[400, 400, -1000]}
                        color={new Color("#270a57")}
                    />
                    {page && page.to === "/" && (
                        <mesh scale={[40, 40, 40]} position={[1500, 800, -1000]}>
                            <sphereBufferGeometry attach="geometry" args={[4, 32, 32]} />
                            <meshBasicMaterial attach="material" color="#FFFF99" fog={false} />
                        </mesh>
                    )}
                    {page && page.to === "/" && (
                        <Suspense fallback={null}>
                            <Earth animations={animations} night={night} />
                        </Suspense>
                    )}
                    {mars && (
                        <Suspense fallback={null}>
                            <Mars />
                        </Suspense>
                    )}
                    <Suspense fallback={null}>
                        {page && page.to === "/" ? (
                            <group position={[350, -100, -350]}>
                                <Text size={30} position={[0, 0, 0]}>
                                    {"Hello, I'm Ali Alaa"}
                                </Text>
                                <Text size={20} position={[0, -200, 0]}>
                                    A Front-end Web Developer
                                </Text>
                            </group>
                        ) : page || title ? (
                            <Title title={title} page={page} />
                        ) : null}
                    </Suspense>
                    <Suspense fallback={null}>
                        <Effects down={down} animations={animations} />
                    </Suspense>
                </>
            )}
        </Canvas>
    );
}

export default Space;
