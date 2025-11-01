"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { useGLTF, Center, OrbitControls, AdaptiveDpr, Preload } from "@react-three/drei";

function CameraController({ section, positionKeys, rotationKeys }: { section: number; positionKeys: THREE.Vector3[]; rotationKeys: THREE.Vector3[] }) {
  const targetPos = useRef(new THREE.Vector3(5.58, 3.7, 1.01));
  const targetQuat = useRef(new THREE.Quaternion());
  const ROTATION_ORDER: THREE.EulerOrder = "YXZ";
  
  useFrame((state) => {
    // Compute section-based interpolation for position and rotation (XYZ)
    const maxIndex = Math.max(positionKeys.length, rotationKeys.length) - 1;
    const sectionIndex = Math.max(0, Math.min(Math.floor(section), maxIndex));
    const nextIndex = Math.min(sectionIndex + 1, maxIndex);
    const t = THREE.MathUtils.clamp(section - sectionIndex, 0, 1);

    const posA = positionKeys[Math.min(sectionIndex, positionKeys.length - 1)] || new THREE.Vector3();
    const posB = positionKeys[Math.min(nextIndex, positionKeys.length - 1)] || new THREE.Vector3();
    const lerpedPos = new THREE.Vector3().copy(posA).lerp(posB, t);

    const rotA = rotationKeys[Math.min(sectionIndex, rotationKeys.length - 1)] || new THREE.Vector3();
    const rotB = rotationKeys[Math.min(nextIndex, rotationKeys.length - 1)] || new THREE.Vector3();
    const eulerA = new THREE.Euler(rotA.x, rotA.y, rotA.z, ROTATION_ORDER);
    const eulerB = new THREE.Euler(rotB.x, rotB.y, rotB.z, ROTATION_ORDER);
    const quatA = new THREE.Quaternion().setFromEuler(eulerA);
    const quatB = new THREE.Quaternion().setFromEuler(eulerB);
    const slerpedQuat = new THREE.Quaternion().copy(quatA).slerp(quatB, t);

    targetPos.current.copy(lerpedPos);
    targetQuat.current.copy(slerpedQuat);

    // Smoothly lerp towards targets
    state.camera.rotation.order = ROTATION_ORDER;
    state.camera.position.lerp(targetPos.current, 0.1);
    state.camera.quaternion.slerp(targetQuat.current, 0.1);
  });
  
  return null;
}

function Scene({ scrollProgress, currentSection, onCameraInfo, debugMode }: { scrollProgress: number; currentSection: number; onCameraInfo?: (info: { x: number; y: number; z: number; rxDeg: number; ryDeg: number; rzDeg: number }) => void; debugMode?: boolean }) {
  // Rotation drives the model (not the camera)
  const baseRotationY = 90;
  
  // Configuration: Number of sections
  const NUM_SECTIONS = 8;

  // Per-section camera keys (positions and XYZ rotations in radians)
  // Edit these arrays to define your sections. Arrays should have at least NUM_SECTIONS entries.
  const cameraPositionKeys = useMemo(() => [
    new THREE.Vector3(5.23, 4.28, 0.67), // section 0
    new THREE.Vector3(3.61, 5.08, 3.24), // section 1
    new THREE.Vector3(5.84, 2.84, 1.96), // section 2
    new THREE.Vector3(4.17, 2.25, 1.66), // section 3
    new THREE.Vector3(1.45, 2.99, 0.73), // section 4
    new THREE.Vector3(3.17, 0.95, 3.2), // section 5
    new THREE.Vector3(0.89, 2.6, -1.48), // section 6
    new THREE.Vector3(1.45, 2.04, -1.49), // section 7
    new THREE.Vector3(5.23, 4.28, 0.67), // section 8
    new THREE.Vector3(3.61, 5.08, 3.24), // section 9
  ], []);

  type RotationKey = THREE.Vector3 | { x: number; y: number; z: number; unit?: "deg" | "rad" };
  const cameraRotationKeys = useMemo<RotationKey[]>(() => [
    { x: -33.4, y: 85.1, z: 0, unit: "deg" }, // section 0
    { x: -42.5, y: 50.2, z: 0, unit: "deg" }, // section 1
    { x: -18.4, y: 73.1, z: 0, unit: "deg" }, // section 2
    { x: -17.1, y: 75, z: 0, unit: "deg" }, // section 3
    { x: -17.3, y: 57.1, z: 0, unit: "deg" }, // section 4
    { x: -17.8, y: 53, z: 0, unit: "deg" }, // section 5
    { x: -48.7, y: 165, z: 0, unit: "deg" }, // section 6
    { x: -36.9, y: 123.8, z: 0, unit: "deg" }, // section 7
    { x: -33.4, y: 85.1, z: 0, unit: "deg" }, // section 8
    { x: -42.5, y: 50.2, z: 0, unit: "deg" }, // section 9
  ], []);

  const cameraRotationKeysRad = useMemo(() => {
    return cameraRotationKeys.map((k) => {
      if (k instanceof THREE.Vector3) return k.clone();
      const unit = k.unit ?? "rad";
      if (unit === "deg") {
        return new THREE.Vector3(
          THREE.MathUtils.degToRad(k.x),
          THREE.MathUtils.degToRad(k.y),
          THREE.MathUtils.degToRad(k.z)
        );
      }
      return new THREE.Vector3(k.x, k.y, k.z);
    });
  }, [cameraRotationKeys]);

  // Per-section node-visibility configuration: each section lists mesh names that should be fully visible
  // Leave a section array empty to show all nodes as fully visible in that section
  // Array should have at least NUM_SECTIONS entries
  const visibleNodesBySection = useMemo<(string | RegExp)[][]>(() => [
    [], // section 0 (empty => show all)
    [], // section 1
    [], // section 2
    ["node89", "node90"], // section 3
    // Example: only specific nodes visible in section 4
    ["node194", "node195", "node196", "node197", "node98"], // section 4
    [/^node(65|87|191|24[5-9]|25\d|26\d|27\d|28[0-1])$/], // section 5 (regex-Bereichsbeispiel)
    [/^node(10[8-9]|1[1-7]\d|18[0-2])$/], // section 6
    ["node16","node19"], // section 7
    [], // section 8
    [], // section 9
  ], []);
  // Calculate section once and pass to components
  const section = currentSection + (scrollProgress - currentSection / NUM_SECTIONS) * NUM_SECTIONS;
  const sectionKey = Math.floor(section + 1e-6); // discrete section index for expensive ops
  
  // Removed old model rotation interpolation; model uses only baseRotationY
  
  const CameraReporter = () => {
    const { camera } = useThree();
    const frameCount = useRef(0);
    const ROTATION_ORDER: THREE.EulerOrder = "YXZ";
    useFrame(() => {
      if (!onCameraInfo) return;
      frameCount.current = (frameCount.current + 1) % 3; // ~20 FPS updates
      if (frameCount.current !== 0) return;
      const { x, y, z } = camera.position;
      // Normalize to consistent rotation order for reporting
      camera.rotation.order = ROTATION_ORDER;
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, ROTATION_ORDER);
      const rxDeg = THREE.MathUtils.radToDeg(euler.x);
      const ryDeg = THREE.MathUtils.radToDeg(euler.y);
      const rzDeg = THREE.MathUtils.radToDeg(euler.z);
      onCameraInfo({ x, y, z, rxDeg, ryDeg, rzDeg });
      // We keep compatibility with existing shape (ryDeg). X/Z will be rendered via camera directly in HUD.
    });
    return null;
  };

  
  const GLTFModel = ({ url, section, visibleNodesBySection }: { url: string; section: number; visibleNodesBySection: (string | RegExp)[][] }) => {
    const { scene } = useGLTF(url);
    
    const model = useMemo(() => {
      const maxIndex = visibleNodesBySection.length - 1;
      const sectionIndex = Math.max(0, Math.min(Math.floor(section), maxIndex));
      const nextIndex = Math.min(sectionIndex + 1, maxIndex);
      const t = THREE.MathUtils.clamp(section - sectionIndex, 0, 1);
      
      const visibleListA = visibleNodesBySection[sectionIndex] || [];
      const visibleListB = visibleNodesBySection[nextIndex] || [];
      
      const exactNamesA = new Set(visibleListA.filter((v) => typeof v === "string") as string[]);
      const regexListA = (visibleListA.filter((v) => v instanceof RegExp) as RegExp[]);
      const exactNamesB = new Set(visibleListB.filter((v) => typeof v === "string") as string[]);
      const regexListB = (visibleListB.filter((v) => v instanceof RegExp) as RegExp[]);
      
      const useVisibilityA = exactNamesA.size > 0 || regexListA.length > 0;
      const useVisibilityB = exactNamesB.size > 0 || regexListB.length > 0;
      
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const meshName = child.name || "";
          
          // Check visibility in section A
          const isExactA = exactNamesA.has(meshName);
          const isRegexA = regexListA.some((re) => re.test(meshName));
          const isVisibleA = useVisibilityA ? (isExactA || isRegexA) : true;
          const opacityA = isVisibleA ? 1 : 0.15;
          
          // Check visibility in section B
          const isExactB = exactNamesB.has(meshName);
          const isRegexB = regexListB.some((re) => re.test(meshName));
          const isVisibleB = useVisibilityB ? (isExactB || isRegexB) : true;
          const opacityB = isVisibleB ? 1 : 0.15;
          
          // Interpolate opacity between sections
          const opacity = THREE.MathUtils.lerp(opacityA, opacityB, t);
          
          child.material.transparent = opacity < 1 || child.material.transparent;
          child.material.opacity = opacity;
        }
      });
      return scene;
    }, [scene, section, visibleNodesBySection]);
    
    return <primitive object={model} scale={[5, 5, 5]} />;
  };

  // Preload default model
  useGLTF.preload("/UKI_model.glb");

  return (
    <>
      {/* Free camera controls in debug mode */}
      {debugMode && (
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} rotateSpeed={0.6} zoomSpeed={0.8} panSpeed={0.8} />
      )}
      {debugMode && <CameraReporter />}
      {!debugMode && (
        <CameraController section={section} positionKeys={cameraPositionKeys} rotationKeys={cameraRotationKeysRad} />
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      <Center>
        <group rotation={[0, baseRotationY, 0]}>
          <group position={[-1.5, 0, 0.5]}>
            <Suspense fallback={null}>
              <GLTFModel url="/UKI_model.glb" section={section} visibleNodesBySection={visibleNodesBySection} />
            </Suspense>
            {debugMode && <axesHelper args={[2]} />}
          </group>
          {debugMode && <axesHelper args={[2]} />}
          {debugMode && <gridHelper args={[10, 10]} />}
        </group>
      </Center>
    </>
  );
}

export default function ThreeScene({ 
  scrollProgress = 0, 
  currentSection = 0,
  debugMode = false,
}: { 
  scrollProgress?: number;
  currentSection?: number;
  debugMode?: boolean;
}) {
  const [camInfo, setCamInfo] = useState<{ x: number; y: number; z: number; rxDeg: number; ryDeg: number; rzDeg: number }>({ x: 0, y: 0, z: 0, rxDeg: 0, ryDeg: 0, rzDeg: 0 });
  return (
    <div className="h-full w-full" style={{ position: "relative" }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        dpr={[1, 1.5]}
        shadows={false}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene scrollProgress={scrollProgress} currentSection={currentSection} onCameraInfo={setCamInfo} debugMode={debugMode} />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
      {debugMode && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "8px 10px",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 12,
            borderRadius: 6,
            lineHeight: 1.4,
            whiteSpace: "pre",
            pointerEvents: "none",
          }}
        >
          {`cam.x: ${camInfo.x.toFixed(2)}\ncam.y: ${camInfo.y.toFixed(2)}\ncam.z: ${camInfo.z.toFixed(2)}\nrotX: ${camInfo.rxDeg.toFixed(1)}°\nrotY: ${camInfo.ryDeg.toFixed(1)}°\nrotZ: ${camInfo.rzDeg.toFixed(1)}°`}
        </div>
      )}
    </div>
  );
}
