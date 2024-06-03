"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import * as THREE from "three";
import landingScene from "./landingScene";
export default function Home() {
  // setting a reference to the DOM element of our canvas for threejs
  const mountRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const router = useRouter(); // Initialize the router hook
  // useEffect hook ensures threejs canvas is not preloaded before the React component is rendered
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
    window.addEventListener("resize", handleResize);

    // block default value for down/up arrow, and spacebar since the interactive page uses those as controls
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown"].includes(event.key) ||
        (event.key == "Space" && event.target == document.body)
      ) {
        event.preventDefault();
      }
    };

    // prevent memory leaks by emptying event listeners after
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      // Clean up event listener
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // this conditional basically returns if the window hasn't rendered yet.
    if (!mountRef.current || windowSize.width === 0 || windowSize.height === 0)
      return;

    // Setup Three.js scene
    const width = windowSize.width;
    const height = windowSize.height;
    const renderer = new THREE.WebGLRenderer({
      canvas: mountRef.current,
    });
    renderer.setSize(width, height);
    console.log(width, height);

    // set up the camera and create a landingScene instance (see landingScene.ts for class implementation)
    const mainCamera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      500,
    );
    const scene = new landingScene(mainCamera, handleObjectClick);
    scene.background = new THREE.Color(0x000000);

    scene.initialize();

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
    router.push("/text");
  };

  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <canvas id="app" ref={mountRef}></canvas>
    </main>
  );
}
