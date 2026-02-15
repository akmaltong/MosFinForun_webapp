import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

export default function FirstPersonControls() {
    const { camera } = useThree()

    const moveForward = useRef(false)
    const moveBackward = useRef(false)
    const moveLeft = useRef(false)
    const moveRight = useRef(false)

    const velocity = useRef(new THREE.Vector3())
    const direction = useRef(new THREE.Vector3())
    const moveSpeedRef = useRef(20.0) // Base speed
    const currentRoute = useAppStore(state => state.currentRoute)
    const setRoute = useAppStore(state => state.setRoute)
    const userLocation = useAppStore(state => state.userLocation)
    const setUserLocation = useAppStore(state => state.setUserLocation)
    const setCameraPosition = useAppStore(state => state.setCameraPosition)
    const eyeLevel = 2.0

    useEffect(() => {
        // Initial jump to user location
        if (userLocation) {
            camera.position.set(userLocation.position[0], eyeLevel, userLocation.position[2])
            camera.updateMatrixWorld()
        }

        const handleWheel = (event: WheelEvent) => {
            // Speed up or slow down based on wheel direction
            moveSpeedRef.current = Math.max(5.0, Math.min(100.0, moveSpeedRef.current - event.deltaY * 0.05))
        }

        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward.current = true
                    break
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft.current = true
                    break
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward.current = true
                    break
                case 'ArrowRight':
                case 'KeyD':
                    moveRight.current = true
                    break
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward.current = false
                    break
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft.current = false
                    break
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward.current = false
                    break
                case 'ArrowRight':
                case 'KeyD':
                    moveRight.current = false
                    break
            }
        }

        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        document.addEventListener('wheel', handleWheel)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('keyup', onKeyUp)
            document.removeEventListener('wheel', handleWheel)
        }
    }, [camera, setUserLocation, userLocation])

    useFrame((state, delta) => {
        const friction = 10.0

        velocity.current.x -= velocity.current.x * friction * delta
        velocity.current.z -= velocity.current.z * friction * delta

        direction.current.z = Number(moveBackward.current) - Number(moveForward.current)
        direction.current.x = Number(moveRight.current) - Number(moveLeft.current)
        direction.current.normalize()

        if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * moveSpeedRef.current * delta
        if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * moveSpeedRef.current * delta

        // Standard eye level height
        const eyeLevel = 2.0

        state.camera.translateX(-velocity.current.x * delta)
        state.camera.translateZ(-velocity.current.z * delta)
        state.camera.position.y = eyeLevel

        // Sync state for navigation (markers follow)
        const pos: [number, number, number] = [state.camera.position.x, 0, state.camera.position.z]

        // Update both camera state and userLocation state
        setCameraPosition([state.camera.position.x, state.camera.position.y, state.camera.position.z])

        // Use functional update to avoid stale closure or massive re-renders if needed, 
        // but here we just need the latest position for routing.
        setUserLocation({
            position: pos,
            rotation: state.camera.rotation.y,
            timestamp: new Date()
        })

        // Check for arrival
        if (currentRoute) {
            const target = new THREE.Vector3(currentRoute.to[0], 0, currentRoute.to[2])
            const currentPos = new THREE.Vector3(state.camera.position.x, 0, state.camera.position.z)
            if (currentPos.distanceTo(target) < 2.0) {
                setRoute(null)
            }
        }
    })

    return <PointerLockControls />
}
