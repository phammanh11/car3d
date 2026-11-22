import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SUPERCAR_CATALOG, useCarStore } from '../store/useCarStore'
import { carAudio } from '../utils/soundEngine'

const DRACO_PATH = '/draco/'

SUPERCAR_CATALOG.forEach((car) => {
  useGLTF.preload(car.modelUrl, DRACO_PATH)
})

/**
 * Tạo Texture Gradient sắc nét cho tia lửa Afterburner ống xả (không dùng khối hình học đơn sắc thô)
 */
function createExhaustFlameTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // Chiều dọc Y: 0 (đỉnh nhọn ngọn lửa) -> 256 (gốc miệng ống xả)
  const grad = ctx.createLinearGradient(0, 256, 0, 0)
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)')
  grad.addColorStop(0.18, 'rgba(125, 211, 252, 0.96)') // Lõi xanh plasma nhiệt độ cao
  grad.addColorStop(0.45, 'rgba(251, 146, 60, 0.88)')  // Thân lửa cam rực
  grad.addColorStop(0.78, 'rgba(239, 68, 68, 0.45)')   // Đuôi lửa đỏ sẫm
  grad.addColorStop(1.0, 'rgba(239, 68, 68, 0.0)')

  // Làm mềm hai cạnh bên để không lộ mép phẳng
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 256)

  ctx.globalCompositeOperation = 'destination-in'
  const sideMask = ctx.createRadialGradient(64, 190, 6, 64, 140, 64)
  sideMask.addColorStop(0, 'rgba(255,255,255,1)')
  sideMask.addColorStop(0.55, 'rgba(255,255,255,0.85)')
  sideMask.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sideMask
  ctx.fillRect(0, 0, 128, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * Cụm 3D Ống Xả Nhiệt Titan & Lửa Afterburner Sắc Nét gắn đúng tọa độ miệng pô từng mẫu xe .GLB
 * Gồm:
 *  - Vòng nhiệt Titan nung đỏ bên trong miệng pô (Heat Ring)
 *  - Lõi Plasma xanh-trắng nhiệt độ cao (Inner Core)
 *  - Chùm lửa phản lực chữ thập + hình nón mềm (Cross-Fin & Outer Afterburner Cone)
 *  - Ánh sáng PointLight động hắt xuống mặt đường sau đuôi xe
 */
function ExhaustFlamesGroup({ exhaustPipes, motionRef }) {
  const flameTex = useMemo(() => createExhaustFlameTexture(), [])
  const pipeGroupRefs = useRef([])
  const heatRingRefs = useRef([])
  const coreRefs = useRef([])
  const finARefs = useRef([])
  const finBRefs = useRef([])
  const lightRef = useRef(null)

  const outerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: flameTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [flameTex]
  )

  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#bae6fd'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  )

  const heatMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ff5500'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  )

  useEffect(() => {
    return () => {
      flameTex.dispose()
      outerMat.dispose()
      coreMat.dispose()
      heatMat.dispose()
    }
  }, [flameTex, outerMat, coreMat, heatMat])

  useFrame((state) => {
    const revPulseUntil = useCarStore.getState().revPulseUntil
    const mode = useCarStore.getState().mode
    const soundEnabled = useCarStore.getState().soundEnabled
    const nowPerf = performance.now()
    const isShowroomRevving = mode === 'showroom' && nowPerf < revPulseUntil

    // Nếu người dùng bấm "Nẹt pô" trong Showroom -> chạy âm thanh & nháy lửa pô sống động
    if (isShowroomRevving) {
      const activeCar = useCarStore.getState().getActiveCar()
      const progress = 1 - (revPulseUntil - nowPerf) / 1450
      const simRpm =
        progress < 0.65 ? 1400 + (progress / 0.65) * 7400 : 8800 - ((progress - 0.65) / 0.35) * 5200
      carAudio.update({
        rpm: simRpm,
        speed: 0,
        enabled: soundEnabled,
        profileId: activeCar.soundProfile,
      })
      if (progress > 0.62 && progress < 0.72) {
        carAudio.triggerBackfire(0.95)
      }
    } else if (mode === 'showroom' && carAudio.isRunning) {
      carAudio.stop()
    }

    const flameIntensity = isShowroomRevving
      ? Math.max(0.35, Math.sin((nowPerf / 45) % Math.PI) * 1.15)
      : motionRef?.current?.flame || 0

    const heatGlow = isShowroomRevving
      ? 0.9
      : Math.max(flameIntensity, motionRef?.current?.heat || 0)

    const t = state.clock.elapsedTime
    const visible = flameIntensity > 0.03

    outerMat.opacity = THREE.MathUtils.lerp(outerMat.opacity, visible ? Math.min(0.95, flameIntensity) : 0, 0.45)
    coreMat.opacity = THREE.MathUtils.lerp(coreMat.opacity, visible ? Math.min(0.9, flameIntensity * 0.9) : 0, 0.45)
    heatMat.opacity = THREE.MathUtils.lerp(heatMat.opacity, Math.min(0.75, heatGlow * 0.7), 0.25)

    for (let i = 0; i < exhaustPipes.length; i++) {
      const flicker = 0.8 + Math.sin(t * 72 + i * 2.1) * 0.22 + Math.random() * 0.14
      const lenScale = Math.max(0.01, flameIntensity * flicker)
      const radScale = 0.7 + flameIntensity * 0.45

      const grp = pipeGroupRefs.current[i]
      if (grp) grp.visible = outerMat.opacity > 0.02 || heatMat.opacity > 0.03

      const core = coreRefs.current[i]
      if (core) {
        core.visible = outerMat.opacity > 0.02
        core.scale.set(radScale * 0.85, lenScale * 0.95, radScale * 0.85)
      }

      const finA = finARefs.current[i]
      const finB = finBRefs.current[i]
      if (finA && finB) {
        finA.visible = outerMat.opacity > 0.02
        finB.visible = outerMat.opacity > 0.02
        finA.scale.set(radScale, lenScale * 1.25, 1)
        finB.scale.set(radScale, lenScale * 1.25, 1)
      }

      const ring = heatRingRefs.current[i]
      if (ring) {
        ring.visible = heatMat.opacity > 0.02
      }
    }

    if (lightRef.current) {
      lightRef.current.intensity = visible ? 3.5 * flameIntensity + Math.random() * 1.4 : 0
    }
  })

  if (!exhaustPipes || exhaustPipes.length === 0) return null

  const centerPipe = exhaustPipes[0]

  return (
    <group>
      {/* Đèn phản chiếu ánh lửa cam-đỏ lên mặt đường nhựa sau đuôi xe */}
      <pointLight
        ref={lightRef}
        position={[0, centerPipe[1] + 0.08, centerPipe[2] + 0.45]}
        color="#ff6b1a"
        distance={5.5}
        decay={2}
        intensity={0}
      />

      {exhaustPipes.map((pos, idx) => (
        <group
          key={idx}
          ref={(el) => {
            pipeGroupRefs.current[idx] = el
          }}
          position={pos}
        >
          {/* 1. Vành nhiệt Titan nung đỏ bên trong miệng pô */}
          <mesh
            ref={(el) => {
              heatRingRefs.current[idx] = el
            }}
            rotation={[Math.PI / 2, 0, 0]}
            material={heatMat}
          >
            <cylinderGeometry args={[0.044, 0.044, 0.05, 16, 1, true]} />
          </mesh>

          {/* 2. Lõi lửa Plasma xanh-trắng nhiệt độ cao phóng dọc +Z */}
          <mesh
            ref={(el) => {
              coreRefs.current[idx] = el
            }}
            position={[0, 0, 0.14]}
            rotation={[Math.PI / 2, 0, 0]}
            material={coreMat}
          >
            <coneGeometry args={[0.036, 0.36, 12]} />
          </mesh>

          {/* 3. Cánh lửa chữ thập (Cross-plane Flame Fins) với Canvas Gradient mềm sắc nét */}
          <mesh
            ref={(el) => {
              finARefs.current[idx] = el
            }}
            position={[0, 0, 0.24]}
            rotation={[Math.PI / 2, 0, 0]}
            material={outerMat}
          >
            <planeGeometry args={[0.16, 0.52]} />
          </mesh>
          <mesh
            ref={(el) => {
              finBRefs.current[idx] = el
            }}
            position={[0, 0, 0.24]}
            rotation={[Math.PI / 2, 0, Math.PI / 2]}
            material={outerMat}
          >
            <planeGeometry args={[0.16, 0.52]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function prepareSupercarScene(gltfScene, carSpec) {
  const cloned = gltfScene.clone(true)
  cloned.updateMatrixWorld(true)

  const paintHints = (carSpec?.paintMaterialHints || ['body', 'paint', 'carpaint']).map((h) =>
    h.toLowerCase()
  )
  const rimHints = (carSpec?.rimMaterialHints || ['rim', 'wheel_rim', 'metal_gray']).map((h) =>
    h.toLowerCase()
  )

  const paintMaterials = []
  const rimMaterials = []
  const wheelNodes = []
  const seenPaintMats = new Set()
  const seenRimMats = new Set()

  let largestMesh = null
  let largestVolume = 0

  cloned.traverse((obj) => {
    if (obj.isObject3D && obj.name) {
      const n = obj.name.toLowerCase()
      if (
        n === 'wheel_fl' ||
        n === 'wheel_fr' ||
        n === 'wheel_rl' ||
        n === 'wheel_rr' ||
        n.includes('tire') ||
        n.includes('rim_')
      ) {
        wheelNodes.push(obj)
      }
    }

    if (!obj.isMesh) return
    obj.castShadow = true
    obj.receiveShadow = true

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    const nextMats = mats.map((mat) => {
      if (!mat) return mat
      const clonedMat = mat.clone()
      const matName = (clonedMat.name || '').toLowerCase()
      const meshName = (obj.name || '').toLowerCase()

      const isPaint =
        paintHints.some((h) => matName.includes(h) || meshName.includes(h)) ||
        (matName.includes('paint') && !matName.includes('glass'))

      const isRim =
        !isPaint &&
        rimHints.some((h) => matName.includes(h) || meshName.includes(h)) &&
        !matName.includes('tire') &&
        !matName.includes('rubber')

      if (isPaint && !seenPaintMats.has(clonedMat.uuid)) {
        seenPaintMats.add(clonedMat.uuid)
        if (clonedMat.isMeshStandardMaterial) paintMaterials.push(clonedMat)
      } else if (isRim && !seenRimMats.has(clonedMat.uuid)) {
        seenRimMats.add(clonedMat.uuid)
        if (clonedMat.isMeshStandardMaterial) rimMaterials.push(clonedMat)
      }

      const isExcluded =
        matName.includes('glass') ||
        matName.includes('tire') ||
        matName.includes('tyre') ||
        matName.includes('rubber') ||
        matName.includes('light') ||
        matName.includes('interior') ||
        matName.includes('carpet') ||
        matName.includes('brake') ||
        matName.includes('carbon') ||
        matName.includes('black')

      if (!isExcluded && obj.geometry) {
        obj.geometry.computeBoundingBox()
        const b = obj.geometry.boundingBox
        if (b) {
          const size = new THREE.Vector3()
          b.getSize(size)
          const vol = size.x * size.y * size.z
          if (vol > largestVolume) {
            largestVolume = vol
            largestMesh = { obj, mat: clonedMat }
          }
        }
      }

      return clonedMat
    })

    obj.material = Array.isArray(obj.material) ? nextMats : nextMats[0]
  })

  if (paintMaterials.length === 0 && largestMesh?.mat?.isMeshStandardMaterial) {
    paintMaterials.push(largestMesh.mat)
  }

  const wrapper = new THREE.Group()
  wrapper.add(cloned)

  let autoRotY = carSpec?.rotationY || 0
  cloned.rotation.y = autoRotY
  wrapper.updateMatrixWorld(true)

  const preCheckBox = new THREE.Box3().setFromObject(wrapper)
  const preCheckSize = new THREE.Vector3()
  preCheckBox.getSize(preCheckSize)

  if (!carSpec && preCheckSize.x > preCheckSize.z * 1.15) {
    autoRotY += Math.PI / 2
    cloned.rotation.y = autoRotY
    wrapper.updateMatrixWorld(true)
  }

  const rotatedBox = new THREE.Box3().setFromObject(wrapper)
  const rotatedSize = new THREE.Vector3()
  rotatedBox.getSize(rotatedSize)

  const targetLen = carSpec?.targetLength || 4.55
  const longestAxis = Math.max(rotatedSize.z, rotatedSize.x, 0.001)
  const scaleFactor = targetLen / longestAxis

  cloned.scale.multiplyScalar(scaleFactor)
  wrapper.updateMatrixWorld(true)

  const finalBox = new THREE.Box3().setFromObject(wrapper)
  const finalCenter = new THREE.Vector3()
  finalBox.getCenter(finalCenter)

  cloned.position.x -= finalCenter.x
  cloned.position.z -= finalCenter.z
  cloned.position.y -= finalBox.min.y

  return {
    root: wrapper,
    paintMaterials,
    rimMaterials,
    wheelNodes,
  }
}

export function CarModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spinVelocity = 0,
  steerAngle = 0,
  motionRef = null,
}) {
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelUrl = useCarStore((s) => s.customModelUrl)
  const paint = useCarStore((s) => s.paint)
  const rimFinish = useCarStore((s) => s.rimFinish)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )

  const modelUrl = customModelUrl || activeCar.modelUrl
  const gltf = useGLTF(modelUrl, DRACO_PATH)

  const prepared = useMemo(
    () => prepareSupercarScene(gltf.scene, customModelUrl ? null : activeCar),
    [gltf.scene, activeCar, customModelUrl]
  )

  const targetPaintColor = useMemo(() => new THREE.Color(), [])
  const targetRimColor = useMemo(() => new THREE.Color(), [])
  const wheelSpinRef = useRef(0)

  useEffect(() => {
    return () => {
      prepared.root.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m?.dispose?.())
        }
      })
    }
  }, [prepared])

  useFrame((_, delta) => {
    const t = Math.min(1, delta * 7.5)
    targetPaintColor.set(paint.hex)
    targetRimColor.set(rimFinish.hex)

    for (const mat of prepared.paintMaterials) {
      if (mat.color) mat.color.lerp(targetPaintColor, t)
      if (typeof mat.metalness === 'number') {
        mat.metalness = THREE.MathUtils.lerp(mat.metalness, paint.metalness, t)
      }
      if (typeof mat.roughness === 'number') {
        mat.roughness = THREE.MathUtils.lerp(mat.roughness, paint.roughness, t)
      }
      if ('clearcoat' in mat) {
        mat.clearcoat = THREE.MathUtils.lerp(mat.clearcoat || 0, paint.clearcoat, t)
        mat.clearcoatRoughness = THREE.MathUtils.lerp(
          mat.clearcoatRoughness || 0,
          paint.clearcoatRoughness,
          t
        )
      }
    }

    for (const mat of prepared.rimMaterials) {
      if (mat.color) mat.color.lerp(targetRimColor, t)
      if (typeof mat.metalness === 'number') {
        mat.metalness = THREE.MathUtils.lerp(mat.metalness, rimFinish.metalness, t)
      }
      if (typeof mat.roughness === 'number') {
        mat.roughness = THREE.MathUtils.lerp(mat.roughness, rimFinish.roughness, t)
      }
    }

    const currentSpin = motionRef ? motionRef.current.speed : spinVelocity
    const currentSteer = motionRef ? motionRef.current.steer : steerAngle

    if (prepared.wheelNodes.length > 0) {
      if (Math.abs(currentSpin) > 0.05) {
        wheelSpinRef.current -= currentSpin * delta * 1.6
      }
      for (const node of prepared.wheelNodes) {
        const name = node.name.toLowerCase()
        if (name.startsWith('wheel_')) {
          node.rotation.x = wheelSpinRef.current
          if (name === 'wheel_fl' || name === 'wheel_fr') {
            node.rotation.y = currentSteer * 0.7
          }
        }
      }
    }
  })

  const pipes = customModelUrl ? [[-0.35, 0.36, 2.2], [0.35, 0.36, 2.2]] : activeCar.exhaustPipes

  return (
    <group position={position} rotation={rotation}>
      <primitive object={prepared.root} />
      <ExhaustFlamesGroup exhaustPipes={pipes} motionRef={motionRef} />
    </group>
  )
}

export default CarModel
