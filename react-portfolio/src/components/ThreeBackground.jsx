import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(28);

    // Subtle Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const pointLightPurple = new THREE.PointLight(0x8a2be2, 3, 100);
    pointLightPurple.position.set(12, 10, 10);
    const pointLightCyan = new THREE.PointLight(0x00e5ff, 3, 100);
    pointLightCyan.position.set(-12, -10, 10);
    scene.add(ambientLight, pointLightPurple, pointLightCyan);

    // Particle Cloud (Cyan + Purple mix)
    const particlesCount = 650;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 85;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Subtle Wireframe Floating Torus Knot
    const geometry = new THREE.TorusKnotGeometry(9, 2.5, 90, 14);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8a2be2,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      roughness: 0.4
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Mouse Interaction with Smooth Interpolation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - windowHalfX) * 0.0006;
      mouseY = (e.clientY - windowHalfY) * 0.0006;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth subtle rotation
      particlesMesh.rotation.y = elapsedTime * 0.035;
      particlesMesh.rotation.x = elapsedTime * 0.015;

      torusKnot.rotation.y += 0.003;
      torusKnot.rotation.x += 0.0015;

      // Parallax easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 10;
      camera.position.y = -targetY * 10;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />;
};

export default ThreeBackground;
