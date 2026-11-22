import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Grid, Sky } from '@react-three/drei'
import { Physics, useBox, useCylinder, useRaycastVehicle } from '@react-three/cannon'
import * as THREE from 'three'
import CarModel from './CarModel'
import { SUPERCAR_CATALOG, useCarStore } from '../store/useCarStore'
import { carAudio } from '../utils/soundEngine'

const WHEEL_RADIUS = 0.36
const WHEEL_WIDTH = 0.28
const CHASSIS_WIDTH = 1.8
const CHASSIS_HEIGHT = 0.48
const CHASSIS_LENGTH = 4.2
const MAX_SKID_MARKS = 260
const MAX_SMOKE_PARTICLES = 180

/**
 * Tạo Texture khói thể tích mềm mịn bằng Radial Gradient (không góc cạnh thô)
 */
function createSmokePuffTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62)
  grad.addColorStop(0.0, 'rgba(235, 240, 248, 0.72)')
  grad.addColorStop(0.38, 'rgba(205, 214, 226, 0.42)')
  grad.addColorStop(0.75, 'rgba(165, 176, 194, 0.14)')
  grad.addColorStop(1.0, 'rgba(140, 150, 165, 0.0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function useVehicleControls() {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    boost: false,
  })
  const cycleCameraView = useCarStore((s) => s.cycleCameraView)
  const triggerResetCar = useCarStore((s) => s.triggerResetCar)

  useEffect(() => {
    const mapKey = (code) => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          return 'forward'
        case 'KeyS':
        case 'ArrowDown':
          return 'backward'
        case 'KeyA':
        case 'ArrowLeft':
          return 'left'
        case 'KeyD':
        case 'ArrowRight':
          return 'right'
        case 'Space':
          return 'brake'
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyF':
          return 'boost'
        default:
          return null
      }
    }

    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return

      const action = mapKey(e.code)
      if (action) {
        if (e.code === 'Space' || e.code.startsWith('Arrow')) {
          e.preventDefault()
        }
        keys.current[action] = true
      }

      if (e.code === 'KeyR' && !e.repeat) triggerResetCar()
      if (e.code === 'KeyC' && !e.repeat) cycleCameraView()
    }

    const onKeyUp = (e) => {
      const action = mapKey(e.code)
      if (action) keys.current[action] = false
    }

    const onBlur = () => {
      keys.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
        boost: false,
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [cycleCameraView, triggerResetCar])

  return keys
}

function ProvingGroundTrack() {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [0, -0.5, 0],
    args: [520, 1.0, 520],
    material: {
      friction: 0.92,
      restitution: 0.02,
    },
  }))

  return (
    <group>
      <mesh ref={ref} receiveShadow>
        <boxGeometry args={[520, 1.0, 520]} />
        <meshStandardMaterial color="#161920" roughness={0.88} metalness={0.1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -35]} receiveShadow>
        <ringGeometry args={[28, 44, 72]} />
        <meshStandardMaterial color="#1f242f" roughness={0.76} metalness={0.12} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, -6]} receiveShadow>
        <planeGeometry args={[10, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -6]} receiveShadow>
        <planeGeometry args={[10, 0.35]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>

      <Grid
        position={[0, 0.015, 0]}
        args={[400, 400]}
        cellSize={4}
        cellThickness={0.5}
        cellColor="#2c3342"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={160}
        fadeStrength={1.2}
      />
    </group>
  )
}

function TrackBarrierWall({ position, args }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args,
  }))

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#272c38" roughness={0.6} metalness={0.4} />
    </mesh>
  )
}

function ProvingGroundStructures() {
  return (
    <group>
      <TrackBarrierWall position={[0, 1.2, -130]} args={[260, 2.4, 2]} />
      <TrackBarrierWall position={[0, 1.2, 130]} args={[260, 2.4, 2]} />
      <TrackBarrierWall position={[-130, 1.2, 0]} args={[2, 2.4, 260]} />
      <TrackBarrierWall position={[130, 1.2, 0]} args={[2, 2.4, 260]} />

      <group position={[0, 0, -10]}>
        <mesh position={[-7, 3.3, 0]} castShadow>
          <boxGeometry args={[0.7, 6.6, 0.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh position={[7, 3.3, 0]} castShadow>
          <boxGeometry args={[0.7, 6.6, 0.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh position={[0, 6.4, 0]} castShadow>
          <boxGeometry args={[15.2, 1.0, 0.9]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.65} />
        </mesh>
        <mesh position={[0, 5.85, 0]}>
          <boxGeometry args={[14.4, 0.12, 0.96]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#f8fafc"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {[-18, -28, -38, -48].map((zPos, i) => (
        <group key={i}>
          <mesh position={[-6.2, 0.45, zPos]} castShadow>
            <cylinderGeometry args={[0.14, 0.24, 0.9, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.45} />
          </mesh>
          <mesh position={[6.2, 0.45, zPos]} castShadow>
            <cylinderGeometry args={[0.14, 0.24, 0.9, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SkidMarksManager({ marksRef }) {
  const instancedRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    const mesh = instancedRef.current
    if (!mesh) return

    const marks = marksRef.current
    for (let i = 0; i < MAX_SKID_MARKS; i++) {
      if (i < marks.length) {
        const m = marks[i]
        dummy.position.set(m.x, 0.024, m.z)
        dummy.rotation.set(-Math.PI / 2, 0, m.rotY)
        dummy.scale.set(0.32, 0.78, 1)
      } else {
        dummy.position.set(0, -100, 0)
        dummy.scale.set(0.001, 0.001, 0.001)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedRef} args={[null, null, MAX_SKID_MARKS]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#050507" transparent opacity={0.6} depthWrite={false} />
    </instancedMesh>
  )
}

/**
 * Hệ thống Khói 3D Thể tích (Volumetric Tire Drift/Burnout Smoke + Exhaust Vapor Smoke)
 * Dùng InstancedMesh Billboard quay thẳng về Camera với Texture Radial Gradient mềm mịn.
 */
function VolumetricSmokeManager({ particlesRef }) {
  const { camera } = useThree()
  const instancedRef = useRef()
  const smokeTex = useMemo(() => createSmokePuffTexture(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    return () => {
      smokeTex.dispose()
    }
  }, [smokeTex])

  useFrame((_, delta) => {
    const mesh = instancedRef.current
    if (!mesh) return

    const particles = particlesRef.current
    const dt = Math.min(delta, 0.05)

    for (let i = 0; i < MAX_SMOKE_PARTICLES; i++) {
      const p = particles[i]
      if (p && p.life > 0) {
        p.life -= dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
        p.vx *= 0.96
        p.vz *= 0.96
        p.vy += 0.35 * dt // Khói bốc nhẹ lên cao
        p.size += p.growth * dt

        const lifeRatio = Math.max(0, p.life / p.maxLife)
        const scale = p.size * (0.65 + (1 - lifeRatio) * 1.15) * Math.min(1, lifeRatio * 2.2)

        dummy.position.set(p.x, p.y, p.z)
        dummy.quaternion.copy(camera.quaternion)
        dummy.rotateZ(p.rotZ + (1 - lifeRatio) * 0.8)
        dummy.scale.set(scale, scale, scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        // Màu khói chuyển dần tối -> sáng nhạt khi tan vào không khí
        const shade = p.kind === 'exhaust' ? 0.55 + (1 - lifeRatio) * 0.25 : 0.82 * lifeRatio + 0.15
        tempColor.setRGB(shade, shade, shade + 0.03)
        mesh.setColorAt(i, tempColor)
      } else {
        dummy.position.set(0, -120, 0)
        dummy.scale.set(0.001, 0.001, 0.001)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedRef} args={[null, null, MAX_SMOKE_PARTICLES]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={smokeTex}
        transparent
        opacity={0.42}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

function RaycastRealSupercar() {
  const { camera } = useThree()
  const controls = useVehicleControls()
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelUrl = useCarStore((s) => s.customModelUrl)
  const cameraView = useCarStore((s) => s.cameraView)
  const soundEnabled = useCarStore((s) => s.soundEnabled)
  const resetTrigger = useCarStore((s) => s.resetTrigger)
  const updateTelemetry = useCarStore((s) => s.updateTelemetry)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )

  // Ref cập nhật 60fps cho Model 3D: tốc độ bánh, góc lái, cường độ lửa pô (`flame`), nhiệt pô (`heat`)
  const driveMotionRef = useRef({ speed: 0, steer: 0, flame: 0, heat: 0 })

  const skidMarksRef = useRef([])
  const skidCursorRef = useRef(0)
  const lastSkidTimeRef = useRef(0)

  const smokeParticlesRef = useRef([])
  const smokeCursorRef = useRef(0)
  const lastTireSmokeRef = useRef(0)
  const lastExhaustSmokeRef = useRef(0)

  const prevGearRef = useRef('N')
  const prevThrottleRef = useRef(false)
  const backfireTimerRef = useRef(0)

  const chassisPos = useRef(new THREE.Vector3(0, 1.0, 0))
  const chassisQuat = useRef(new THREE.Quaternion())
  const chassisVel = useRef(new THREE.Vector3())
  const lastPosForDistance = useRef(new THREE.Vector3(0, 1.0, 0))
  const totalDistanceRef = useRef(0)
  const lastUiSyncRef = useRef(0)

  const smoothCamPos = useRef(new THREE.Vector3(0, 3.2, 7.2))
  const smoothLookAt = useRef(new THREE.Vector3(0, 0.9, 0))
  const desiredCamPos = useRef(new THREE.Vector3())
  const desiredLookAt = useRef(new THREE.Vector3())
  const forwardDir = useRef(new THREE.Vector3())
  const rightDir = useRef(new THREE.Vector3())

  const spawnSmoke = (x, y, z, vx, vy, vz, size, growth, maxLife, kind) => {
    const idx = smokeCursorRef.current % MAX_SMOKE_PARTICLES
    smokeParticlesRef.current[idx] = {
      x,
      y,
      z,
      vx,
      vy,
      vz,
      size,
      growth,
      life: maxLife,
      maxLife,
      rotZ: Math.random() * Math.PI * 2,
      kind,
    }
    smokeCursorRef.current += 1
  }

  const [chassisBody, chassisApi] = useBox(
    () => ({
      mass: 1200,
      position: [0, 1.0, 0],
      rotation: [0, 0, 0],
      args: [CHASSIS_WIDTH, CHASSIS_HEIGHT, CHASSIS_LENGTH],
      allowSleep: false,
      angularDamping: 0.42,
      linearDamping: 0.04,
    }),
    useRef(null)
  )

  const wheelRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]

  const wheelInfoBase = useMemo(
    () => ({
      radius: WHEEL_RADIUS,
      directionLocal: [0, -1, 0],
      suspensionStiffness: 42,
      suspensionRestLength: 0.38,
      maxSuspensionForce: 1e5,
      maxSuspensionTravel: 0.35,
      dampingRelaxation: 2.6,
      dampingCompression: 4.6,
      axleLocal: [-1, 0, 0],
      chassisConnectionPointLocal: [1, 0, 1],
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
      frictionSlip: 4.8,
      rollInfluence: 0.04,
    }),
    []
  )

  const wheelInfos = useMemo(
    () => [
      { ...wheelInfoBase, isFrontWheel: true, chassisConnectionPointLocal: [-0.88, -0.25, -1.35] },
      { ...wheelInfoBase, isFrontWheel: true, chassisConnectionPointLocal: [0.88, -0.25, -1.35] },
      {
        ...wheelInfoBase,
        isFrontWheel: false,
        frictionSlip: 4.4,
        chassisConnectionPointLocal: [-0.9, -0.25, 1.35],
      },
      {
        ...wheelInfoBase,
        isFrontWheel: false,
        frictionSlip: 4.4,
        chassisConnectionPointLocal: [0.9, -0.25, 1.35],
      },
    ],
    [wheelInfoBase]
  )

  const makeWheelBody = (ref) =>
    useCylinder(
      () => ({
        mass: 22,
        type: 'Kinematic',
        collisionFilterGroup: 0,
        args: [WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 16],
      }),
      ref
    )

  makeWheelBody(wheelRefs[0])
  makeWheelBody(wheelRefs[1])
  makeWheelBody(wheelRefs[2])
  makeWheelBody(wheelRefs[3])

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheels: wheelRefs,
      wheelInfos,
      indexForwardAxis: 2,
      indexRightAxis: 0,
      indexUpAxis: 1,
    }),
    useRef(null)
  )

  useEffect(() => {
    const unsubPos = chassisApi.position.subscribe((p) => chassisPos.current.set(p[0], p[1], p[2]))
    const unsubQuat = chassisApi.quaternion.subscribe((q) =>
      chassisQuat.current.set(q[0], q[1], q[2], q[3])
    )
    const unsubVel = chassisApi.velocity.subscribe((v) => chassisVel.current.set(v[0], v[1], v[2]))
    return () => {
      unsubPos()
      unsubQuat()
      unsubVel()
    }
  }, [chassisApi])

  useEffect(() => {
    if (resetTrigger === 0) return
    chassisApi.position.set(0, 1.0, 0)
    chassisApi.velocity.set(0, 0, 0)
    chassisApi.angularVelocity.set(0, 0, 0)
    chassisApi.rotation.set(0, 0, 0)
    for (let i = 0; i < 4; i++) {
      vehicleApi.applyEngineForce(0, i)
      vehicleApi.setBrake(0, i)
    }
  }, [resetTrigger, chassisApi, vehicleApi])

  // Đồng bộ Audio Profile theo đúng mẫu siêu xe đang chọn
  useEffect(() => {
    carAudio.setProfile(activeCar.soundProfile)
    if (soundEnabled) carAudio.start()
    else carAudio.stop()
    return () => carAudio.stop()
  }, [soundEnabled, activeCar.soundProfile])

  useFrame((state, delta) => {
    const virtualInput = useCarStore.getState().virtualInput
    const k = controls.current

    const forward = k.forward || virtualInput.forward
    const backward = k.backward || virtualInput.backward
    const left = k.left || virtualInput.left
    const right = k.right || virtualInput.right
    const brake = k.brake || virtualInput.brake
    const boost = k.boost || virtualInput.boost

    const speedMs = chassisVel.current.length()
    const speedKmh = Math.min(355, Math.round(speedMs * 3.6))

    forwardDir.current.set(0, 0, -1).applyQuaternion(chassisQuat.current)
    rightDir.current.set(1, 0, 0).applyQuaternion(chassisQuat.current)

    const forwardSpeed = chassisVel.current.dot(forwardDir.current)
    const lateralSpeed = Math.abs(chassisVel.current.dot(rightDir.current))

    // Lực đẩy +maxForce tiến về -Z (hoặc Boost +25% khi giữ Shift/F)
    const baseMaxForce = boost ? 4600 : 3600
    const reverseForce = 2200
    let engineForce = 0
    let isBrakingToStop = false

    if (forward && !backward) {
      if (forwardSpeed < -1.5) isBrakingToStop = true
      if (speedKmh < 345) {
        const torqueCurve = Math.max(0.45, 1 - speedKmh / 420)
        engineForce = baseMaxForce * torqueCurve
      }
    } else if (backward && !forward) {
      if (forwardSpeed > 2.0) {
        isBrakingToStop = true
        engineForce = 0
      } else if (speedKmh < 85) {
        engineForce = -reverseForce
      }
    }

    vehicleApi.applyEngineForce(engineForce * 0.45, 0)
    vehicleApi.applyEngineForce(engineForce * 0.45, 1)
    vehicleApi.applyEngineForce(engineForce * 0.9, 2)
    vehicleApi.applyEngineForce(engineForce * 0.9, 3)

    const speedSteerFactor = Math.max(0.32, 1 - speedKmh / 240)
    const maxSteerVal = 0.46 * speedSteerFactor
    let steerVal = 0
    if (left) steerVal += maxSteerVal
    if (right) steerVal -= maxSteerVal

    vehicleApi.setSteeringValue(steerVal, 0)
    vehicleApi.setSteeringValue(steerVal, 1)

    const brakingActive = brake || isBrakingToStop
    if (brake) {
      vehicleApi.setBrake(32, 0)
      vehicleApi.setBrake(32, 1)
      vehicleApi.setBrake(115, 2)
      vehicleApi.setBrake(115, 3)
    } else if (isBrakingToStop) {
      vehicleApi.setBrake(95, 0)
      vehicleApi.setBrake(95, 1)
      vehicleApi.setBrake(85, 2)
      vehicleApi.setBrake(85, 3)
    } else if (!forward && !backward) {
      for (let i = 0; i < 4; i++) vehicleApi.setBrake(4.5, i)
    } else {
      for (let i = 0; i < 4; i++) vehicleApi.setBrake(0, i)
    }

    // Vết lốp & Phát hiện Burnout/Drift
    const isDrifting = (brake && speedKmh > 20) || (lateralSpeed > 3.8 && speedKmh > 26)
    const isBurnoutLaunch = forward && brake
    const nowTime = state.clock.elapsedTime

    if ((isDrifting || (brakingActive && speedKmh > 32)) && nowTime - lastSkidTimeRef.current > 0.032) {
      lastSkidTimeRef.current = nowTime
      const euler = new THREE.Euler().setFromQuaternion(chassisQuat.current, 'YXZ')
      const rearOffsets = [
        new THREE.Vector3(-0.88, -0.65, 1.35),
        new THREE.Vector3(0.88, -0.65, 1.35),
      ]
      rearOffsets.forEach((offset) => {
        const worldWheel = offset.clone().applyQuaternion(chassisQuat.current).add(chassisPos.current)
        if (worldWheel.y < 0.78) {
          const idx = skidCursorRef.current % MAX_SKID_MARKS
          skidMarksRef.current[idx] = { x: worldWheel.x, z: worldWheel.z, rotY: euler.y }
          skidCursorRef.current += 1
        }
      })
    }

    // Sinh Khói lốp 3D khi Drift / Phanh cháy đường / Đốt lốp Burnout
    const tireSmoking = isDrifting || isBurnoutLaunch || (brakingActive && speedKmh > 28)
    if (tireSmoking && nowTime - lastTireSmokeRef.current > 0.035) {
      lastTireSmokeRef.current = nowTime
      const rearOffsets = [
        new THREE.Vector3(-0.88, -0.68, 1.35),
        new THREE.Vector3(0.88, -0.68, 1.35),
      ]
      rearOffsets.forEach((offset) => {
        const worldWheel = offset.clone().applyQuaternion(chassisQuat.current).add(chassisPos.current)
        const backwardVel = forwardDir.current.clone().multiplyScalar(-2.4)
        spawnSmoke(
          worldWheel.x + (Math.random() - 0.5) * 0.25,
          Math.max(0.22, worldWheel.y + 0.15),
          worldWheel.z + (Math.random() - 0.5) * 0.25,
          backwardVel.x + (Math.random() - 0.5) * 1.4,
          0.7 + Math.random() * 0.8,
          backwardVel.z + (Math.random() - 0.5) * 1.4,
          0.75 + Math.random() * 0.35,
          1.45,
          0.95 + Math.random() * 0.45,
          'tire'
        )
      })
    }

    // Camera Chase bám đuôi xe
    const distBack = cameraView === 'far' ? 8.2 : cameraView === 'hood' ? -0.35 : 5.8
    const heightUp = cameraView === 'far' ? 2.6 : cameraView === 'hood' ? 0.65 : 2.0
    const speedZoomOut = cameraView === 'hood' ? 0 : Math.min(1.6, speedKmh / 145)

    const localCamOffset = new THREE.Vector3(0, heightUp, distBack + speedZoomOut)
    desiredCamPos.current
      .copy(localCamOffset)
      .applyQuaternion(chassisQuat.current)
      .add(chassisPos.current)

    if (desiredCamPos.current.y < 0.65) desiredCamPos.current.y = 0.65

    const lookAheadZ = cameraView === 'hood' ? -12 : -4.5
    desiredLookAt.current
      .set(0, cameraView === 'hood' ? 0.45 : 0.4, lookAheadZ)
      .applyQuaternion(chassisQuat.current)
      .add(chassisPos.current)

    const lerpFactor = cameraView === 'hood' ? 1 : Math.min(1, delta * 7.5)
    smoothCamPos.current.lerp(desiredCamPos.current, lerpFactor)
    smoothLookAt.current.lerp(desiredLookAt.current, Math.min(1, delta * 11))

    camera.position.copy(smoothCamPos.current)
    camera.lookAt(smoothLookAt.current)

    // Tính RPM & Số tự động DCT
    const gearThresholds = [0, 48, 95, 148, 205, 265, 355]
    let gear = 'N'
    let rpm = 900

    if (forwardSpeed < -1.0 && backward) {
      gear = 'R'
      rpm = Math.min(8200, 1500 + speedKmh * 95)
    } else if (speedKmh >= 2) {
      let g = 1
      for (let i = 1; i < gearThresholds.length; i++) {
        if (speedKmh > gearThresholds[i]) g = i + 1
      }
      g = Math.min(6, g)
      gear = String(g)
      const prevMax = gearThresholds[g - 1]
      const currMax = gearThresholds[g]
      const ratioInGear = Math.max(0, Math.min(1, (speedKmh - prevMax) / (currMax - prevMax)))
      rpm = Math.round(2400 + ratioInGear * 6400 + (forward ? 450 : 0))
    } else if (forward || boost) {
      rpm = boost ? 8600 : 4800
    }

    // Phát hiện thời điểm sang số hoặc nhả chân ga đột ngột để Bắn Lửa Pô (Backfire Flame & Pop Sound)
    const isShifting = prevGearRef.current !== gear && gear !== 'N' && speedKmh > 25
    const throttleReleasedAtHighRpm = prevThrottleRef.current && !forward && rpm > 4200

    if (isShifting || throttleReleasedAtHighRpm) {
      backfireTimerRef.current = 0.24
      if (soundEnabled) {
        carAudio.triggerBackfire(isShifting ? 0.95 : 0.78)
      }
    }

    prevGearRef.current = gear
    prevThrottleRef.current = forward

    if (backfireTimerRef.current > 0) {
      backfireTimerRef.current = Math.max(0, backfireTimerRef.current - delta)
    }

    // Cường độ lửa ống pô: Rực mạnh khi Boost (Shift/F), khi vừa sang số/nhả ga, hoặc khi đạp ga ở tua > 6,600 RPM
    const redlineFlame = forward && rpm > 6600 ? ((rpm - 6600) / 2400) * 0.75 : 0
    const burstFlame = backfireTimerRef.current > 0 ? 1.15 : 0
    const boostFlame = boost ? 1.35 : 0
    const targetFlame = Math.min(1.4, Math.max(redlineFlame, burstFlame, boostFlame))

    driveMotionRef.current.speed = forwardSpeed
    driveMotionRef.current.steer = steerVal
    driveMotionRef.current.flame = THREE.MathUtils.lerp(
      driveMotionRef.current.flame,
      targetFlame,
      Math.min(1, delta * 24)
    )
    driveMotionRef.current.heat = Math.min(1, (rpm - 900) / 7000)

    // Sinh khói xả mảnh từ đúng tọa độ họng pô của từng mẫu xe
    const pipes = customModelUrl ? [[-0.35, 0.36, 2.2], [0.35, 0.36, 2.2]] : activeCar.exhaustPipes
    const exhaustSmokeInterval = forward || boost ? 0.045 : 0.11
    if (pipes && nowTime - lastExhaustSmokeRef.current > exhaustSmokeInterval) {
      lastExhaustSmokeRef.current = nowTime
      const ejectVel = forwardDir.current.clone().multiplyScalar(-3.2 - (forward ? 2.5 : 0))
      for (let i = 0; i < pipes.length; i++) {
        // Chỉ phát 1 ống luân phiên để khói thanh thoát và tiết kiệm hạt
        if (i !== Math.floor(nowTime * 20) % pipes.length && !boost) continue
        const p = pipes[i]
        const localPipe = new THREE.Vector3(p[0], p[1] - 0.92, p[2] + 0.14)
        const worldPipe = localPipe.applyQuaternion(chassisQuat.current).add(chassisPos.current)
        spawnSmoke(
          worldPipe.x,
          worldPipe.y,
          worldPipe.z,
          ejectVel.x + (Math.random() - 0.5) * 0.4,
          0.32 + Math.random() * 0.35,
          ejectVel.z + (Math.random() - 0.5) * 0.4,
          boost ? 0.36 : 0.24,
          0.75,
          0.55 + Math.random() * 0.25,
          'exhaust'
        )
      }
    }

    carAudio.update({
      rpm: boost ? Math.max(rpm, 8400) : rpm,
      speed: speedKmh,
      isDrifting: tireSmoking,
      isBraking: brakingActive,
      enabled: soundEnabled,
      profileId: activeCar.soundProfile,
    })

    if (nowTime - lastUiSyncRef.current > 0.05) {
      lastUiSyncRef.current = nowTime
      const stepDist = chassisPos.current.distanceTo(lastPosForDistance.current)
      if (stepDist < 15) totalDistanceRef.current += stepDist
      lastPosForDistance.current.copy(chassisPos.current)

      updateTelemetry({
        speed: speedKmh,
        rpm: Math.min(9000, boost ? Math.max(rpm, 8400) : rpm),
        gear,
        isBraking: brakingActive,
        isDrifting: tireSmoking,
        distance: Number((totalDistanceRef.current / 1000).toFixed(2)),
      })
    }
  })

  return (
    <group ref={vehicle}>
      <group ref={chassisBody}>
        <CarModel position={[0, -0.92, 0]} motionRef={driveMotionRef} />
      </group>

      <group ref={wheelRefs[0]} />
      <group ref={wheelRefs[1]} />
      <group ref={wheelRefs[2]} />
      <group ref={wheelRefs[3]} />

      <SkidMarksManager marksRef={skidMarksRef} />
      <VolumetricSmokeManager particlesRef={smokeParticlesRef} />
    </group>
  )
}

export function DrivableCar() {
  return (
    <>
      <color attach="background" args={['#0b111e']} />
      <fog attach="fog" args={['#0b111e', 55, 195]} />

      <Sky
        distance={450000}
        sunPosition={[120, 42, -90]}
        inclination={0.48}
        azimuth={0.25}
        mieCoefficient={0.005}
        rayleigh={1.2}
      />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[40, 55, 25]}
        intensity={2.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />

      <Environment preset="city" resolution={256} />

      <Physics broadphase="SAP" gravity={[0, -9.82, 0]} allowSleep={false}>
        <ProvingGroundTrack />
        <ProvingGroundStructures />
        <RaycastRealSupercar />
      </Physics>
    </>
  )
}

export default DrivableCar
