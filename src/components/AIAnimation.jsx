import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const AIAnimation = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (mountRef.current) {
        setDimensions({
          width: mountRef.current.clientWidth,
          height: mountRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!mountRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspectRatio = dimensions.width / dimensions.height;
    const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    rendererRef.current = renderer;

    renderer.setSize(dimensions.width, dimensions.height);

    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Wireframe sphere
    const sphereRadius = 2;
    const geometry = new THREE.SphereGeometry(sphereRadius, 20, 20);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      wireframe: true,
      wireframeLinewidth: 1,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // "Neurons" as stars
    const neuronGeometry = new THREE.SphereGeometry(0.03, 8, 8); // Smaller size for star-like appearance
    const neuronMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4299e1,
    });

    // Position neurons outside the sphere
    const neuronCount = 100; // Increased count for more stars
    const minDistance = sphereRadius * 1.2; // Minimum distance from sphere center
    const maxDistance = sphereRadius * 2.5; // Maximum distance from sphere center

    for (let i = 0; i < neuronCount; i++) {
      const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
      
      // Use spherical coordinates to position neurons
      const theta = Math.random() * Math.PI * 2; // Angle around Y-axis
      const phi = Math.acos((Math.random() * 2) - 1); // Angle from Y-axis
      const radius = minDistance + Math.random() * (maxDistance - minDistance);

      neuron.position.setFromSpherical(new THREE.Spherical(radius, phi, theta));
      group.add(neuron);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Adjust camera position and group scale based on aspect ratio
    if (aspectRatio > 1) {
      camera.position.z = 3; // Moved camera closer
      group.scale.set(1 / aspectRatio, 1 / aspectRatio, 1 / aspectRatio);
    } else {
      camera.position.z = 3; // Moved camera closer
      group.scale.set(1, 1, 1);
    }

    let animationFrameId;
    const rotationSpeed = 0.001;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Apply constant rotation
      group.rotation.y += rotationSpeed;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      const newAspectRatio = newWidth / newHeight;

      camera.aspect = newAspectRatio;
      camera.updateProjectionMatrix();

      if (newAspectRatio > 1) {
        group.scale.set(1 / newAspectRatio, 1 / newAspectRatio, 1 / newAspectRatio);
      } else {
        group.scale.set(1, 1, 1);
      }

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [dimensions]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default AIAnimation;