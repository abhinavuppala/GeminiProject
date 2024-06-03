'use client'
import Image from "next/image";
import React, { useState,useEffect,useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown';

import * as THREE from 'three'
import landingScene from "./landingScene"
export default function Home() {
  const mountRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const router = useRouter(); // Initialize the router hook

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add resize event listener
    window.addEventListener('resize', handleResize);


    const handleKeyDown = (event:KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown',].includes(event.key) || (event.key=="Space"&&event.target==document.body)) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Clean up event listener
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current || windowSize.width === 0 || windowSize.height === 0) return;

    // Setup Three.js scene
    const width = windowSize.width;
    const height = windowSize.height;
    const renderer = new THREE.WebGLRenderer({
      canvas: mountRef.current,
    });
    renderer.setSize(width, height);
    console.log(width,height);

    const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    const scene = new landingScene(mainCamera, handleObjectClick);
    scene.background = new THREE.Color( 0xFFFFFF );

    scene.initialize(); 
    // Example geometry and material
    
    // Animation loop
    const animate = () => {
      scene.update();
      renderer.render(scene, mainCamera);
      requestAnimationFrame(animate);
    };
    animate();

    // Clean up function
    return () => {
      renderer.dispose();
    };
  }, [windowSize]);

  // callback function
  const handleObjectClick = () => {
    router.push('/text'); 
  }

  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <canvas id = "app" ref={mountRef}></canvas>
    </main>
  )
}
