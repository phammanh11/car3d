import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
} from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'
import { CAMERA_PRESETS, SUPERCAR_CATALOG, useCarStore } from '../store/useCarStore'

/**
 * Điều khiển chuyển góc Camera mượt mà khi khách bấm chọn góc nhìn trên web
 * (Góc 3/4, Hông xe, Đầu xe, Đuôi & Máy, Từ trên cao) hoặc bấm Hotspot kỹ thuật.
 */
function CameraGlideController({ controlsRef }) {
  const { camera } = useThree()
  const cameraPreset = useCarStore((s) => s.cameraPreset)
  const cameraPresetTick = useCarStore((s) => s.cameraPresetTick)

  const isGliding = useRef(false)
  const targetCamPos = useRef(new THREE.Vector3(4.6, 1.85, 5.1))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.55, 0))

  useEffect(() => {
    if (cameraPresetTick === 0) return
    const preset = CAMERA_PRESETS.find((p) => p.id === cameraPreset) || CAMERA_PRESETS[0]
    targetCamPos.current.set(...preset.position)
    targetLookAt.current.set(...preset.target)
    isGliding.current = true
  }, [cameraPreset, cameraPresetTick])

  useFrame((_, delta) => {
    if (!isGliding.current || !controlsRef.current) return
    const t = Math.min(1, delta * 4.5)
    camera.position.lerp(targetCamPos.current, t)
    controlsRef.current.target.lerp(targetLookAt.current, t)
    controlsRef.current.update()

    if (camera.position.distanceTo(targetCamPos.current) < 0.03) {
      isGliding.current = false
    }
  })

  return null
}

/**
 * Các điểm Hotspot kỹ thuật tương tác 3D đính trực tiếp lên thân xe
 */
function SupercarHotspots() {
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelUrl = useCarStore((s) => s.customModelUrl)
  const showHotspots = useCarStore((s) => s.showHotspots)
  const activeHotspotId = useCarStore((s) => s.activeHotspotId)
  const setActiveHotspot = useCarStore((s) => s.setActiveHotspot)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )

  if (!showHotspots || customModelUrl) return null

  return (
    <group position={[0, 0.08, 0]}>
      {activeCar.hotspots.map((spot) => {
        const isOpen = activeHotspotId === spot.id
        return (
          <Html
            key={spot.id}
            position={spot.position}
            center
            distanceFactor={6}
            zIndexRange={[15, 0]}
          >
            <div className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveHotspot(isOpen ? null : spot.id)
                }}
                aria-label={spot.label}
                className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md border transition-all duration-200 shadow-lg cursor-pointer whitespace-nowrap ${
                  isOpen
                    ? 'bg-red-600 border-red-400 text-white scale-105'
                    : 'bg-black/70 border-white/30 text-slate-100 hover:bg-black/90 hover:border-white/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? 'bg-white' : 'bg-red-500 animate-pulse'
                  }`}
                />
                <span>{spot.label}</span>
              </button>

              {isOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-64 rounded-2xl bg-[#0b0e14]/95 backdrop-blur-xl border border-white/20 p-3.5 text-left shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{spot.title}</h4>
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(null)}
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    {spot.detail}
                  </p>
                </div>
              )}
            </div>
          </Html>
        )
      })}
    </group>
  )
}

/**
 * Component <Showroom />:
 * Không gian Studio trưng bày Siêu xe 3D cao cấp chuẩn Đại lý (Ferrari/Porsche Atelier).
 */
export function Showroom() {
  const autoRotate = useCarStore((s) => s.autoRotate)
  const showroomEnv = useCarStore((s) => s.showroomEnv)
  const paint = useCarStore((s) => s.paint)

  const controlsRef = useRef()
  const rimLightRef = useRef()

  useFrame((state) => {
    if (rimLightRef.current) {
      rimLightRef.current.material.emissiveIntensity =
        1.15 + Math.sin(state.clock.elapsedTime * 1.6) * 0.2
    }
  })

  return (
    <>
      <color attach="background" args={['#06070a']} />
      <fog attach="fog" args={['#06070a', 12, 30]} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        autoRotate={autoRotate}
        autoRotateSpeed={0.85}
        minDistance={3.2}
        maxDistance={9.2}
        minPolarAngle={Math.PI / 14}
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 0.55, 0]}
      />

      <CameraGlideController controlsRef={controlsRef} />

      {/* Hệ thống chiếu sáng Studio cao cấp tạo đường viền phản chiếu trên thân xe .GLB */}
      <ambientLight intensity={0.28} />
      <spotLight
        position={[5.5, 9, 5.5]}
        angle={0.45}
        penumbra={0.85}
        intensity={110}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        color="#ffffff"
      />
      <spotLight
        position={[-6, 6.5, -5]}
        angle={0.5}
        penumbra={0.9}
        intensity={55}
        color="#bae6fd"
      />
      <pointLight position={[0, 2.4, -6]} intensity={9} color={paint.hex} />

      {/* Environment HDR kết hợp dải đèn Studio Lightformer */}
      <Environment preset={showroomEnv} resolution={512}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer
            form="rect"
            intensity={3.6}
            position={[0, 5, -9]}
            scale={[11, 2.4, 1]}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={2.4}
            position={[-6, 3, 2]}
            scale={[9, 1.3, 1]}
            rotation={[0, Math.PI / 2, 0]}
            color="#e2e8f0"
          />
          <Lightformer
            form="rect"
            intensity={2.0}
            position={[6, 3, 2]}
            scale={[9, 1.3, 1]}
            rotation={[0, -Math.PI / 2, 0]}
            color="#bae6fd"
          />
          <Lightformer
            form="ring"
            intensity={1.3}
            position={[0, 9, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={9}
            color="#ffffff"
          />
        </group>
      </Environment>

      {/* Siêu xe 3D .GLB thực tế đặt trên bệ trưng bày */}
      <group position={[0, 0.08, 0]}>
        <CarModel position={[0, 0, 0]} rotation={[0, -Math.PI / 7, 0]} />
      </group>

      {/* Điểm Hotspot kỹ thuật tương tác trên xe */}
      <SupercarHotspots />

      {/* Bệ trưng bày sang trọng với vòng LED ambient */}
      <group position={[0, 0.02, 0]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[3.45, 3.6, 0.12, 72]} />
          <meshStandardMaterial color="#0b0d12" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh ref={rimLightRef} position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.38, 3.44, 96]} />
          <meshStandardMaterial
            color={paint.hex}
            emissive={paint.hex}
            emissiveIntensity={1.25}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Bóng tiếp xúc chân thực dưới gầm xe */}
      <ContactShadows
        position={[0, 0.085, 0]}
        opacity={0.75}
        scale={10}
        blur={1.8}
        far={3}
        color="#000000"
      />

      {/* Sàn Studio phản chiếu gương */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[64, 64]} />
        <MeshReflectorMaterial
          blur={[320, 90]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={0.85}
          depthScale={1.15}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#07090d"
          metalness={0.65}
          mirror={0.45}
        />
      </mesh>

      {/* Cổng vòm ánh sáng kiến trúc hậu cảnh */}
      <mesh position={[0, 4.0, -9.0]}>
        <torusGeometry args={[5.5, 0.04, 16, 100, Math.PI]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e2e8f0"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}

export default Showroom
