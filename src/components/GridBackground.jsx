import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GridBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(10, 10, 10, 10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x4a90e2, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Set a static rotation if desired
    cube.rotation.x = 0.5;
    cube.rotation.y = 0.5;

    // Render the scene once
    renderer.render(scene, camera);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Clean up Three.js objects
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 opacity-30" />;
};

export default GridBackground;