"use client";
import * as THREE from "three";
import { useRouter } from "next/router"; // Import Next.js router
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { mx_bits_to_01 } from "three/examples/jsm/nodes/materialx/lib/mx_noise.js";
import { exit } from "process";

export default class landingScene extends THREE.Scene {
  private readonly keyDown = new Set<string>();
  private readonly camera: THREE.PerspectiveCamera;
  private directionVector = new THREE.Vector3();
  private readonly triggers = new Set<THREE.Mesh>();
  private readonly choices = new Set<THREE.Mesh>();
  //@ts-expect-error
  private readonly handleObjectClick: (event: MouseEvent) => void;
  private clicked = false;

  constructor(camera: THREE.PerspectiveCamera, handleObjectClick: (event:MouseEvent) => void) {
    super();

    this.camera = camera;
    this.triggers.clear();
    this.choices.clear()

    this.handleObjectClick = handleObjectClick; // Assign the callback function

  }

  initialize() {

    // is there a way to minimize repeated code here for the 4 cubes?
    // look into either a class or a function
    const targetPosition = new THREE.Vector3(0, 0, 0); // The target point to face towards
    
    const loader = new FontLoader();
    loader.load( '/fonts/helvetiker_regular.typeface.json',  ( font ) => {
      

      const textGeo1 = new TextGeometry( 'Option 1', {
        font: font,
        size: 200,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,

      } );
			const textMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff});
			const mesh = new THREE.Mesh( textGeo1, textMaterial );
      mesh.scale.set(0.001, 0.001, 0.001);
			mesh.position.x = 23;
			mesh.position.y = 0.25;
      mesh.position.z=-0.5;
      this.choices.add(mesh);
			this.add( mesh );

      const textGeo2 = new TextGeometry( 'Option 2', {
        font: font,
        size: 200,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,

      } );
			const mesh2 = new THREE.Mesh( textGeo2, textMaterial );
      mesh2.scale.set(0.001, 0.001, 0.001);
			mesh2.position.x = -23;
			mesh2.position.y = 0.25;
      mesh2.position.z=0.5;
      this.choices.add(mesh2);
			this.add( mesh2 );

      const textGeo3 = new TextGeometry( 'Option 3', {
        font: font,
        size: 200,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,

      } );
			const mesh3 = new THREE.Mesh( textGeo3, textMaterial );
      mesh3.scale.set(0.001, 0.001, 0.001);
			mesh3.position.x = 0.5;
			mesh3.position.y = 0.25;
      mesh3.position.z=23;
      this.choices.add(mesh3);
			this.add( mesh3 );

      const textGeo4 = new TextGeometry( 'Option 4', {
        font: font,
        size: 200,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,

      } );
			const mesh4 = new THREE.Mesh( textGeo4, textMaterial );
      mesh4.scale.set(0.001, 0.001, 0.001);
			mesh4.position.x = -0.5;
			mesh4.position.y = 0.25;
      mesh4.position.z=-23;
      this.choices.add(mesh4);
			this.add( mesh4 );

    } );

    const geometry = new THREE.BoxGeometry();   
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -25;
    cube.position.y = 0.25;
    cube.position.x = 0;
    this.add(cube);
    this.triggers.add(cube);


    const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const cube2 = new THREE.Mesh(geometry, material2);
    cube2.position.z = 25;
    cube2.position.y = 0.25;
    cube2.position.x = 0;
    this.add(cube2);
    this.triggers.add(cube2);

    const material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube3 = new THREE.Mesh(geometry, material3);
    cube3.position.z = 0;
    cube3.position.y = 0.25;
    cube3.position.x = -25;
    this.add(cube3);
    this.triggers.add(cube3);

    const material4 = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const cube4 = new THREE.Mesh(geometry, material4);
    cube4.position.z = 0;
    cube4.position.y = 0.25;
    cube4.position.x = 25;
    this.add(cube4);
    this.triggers.add(cube4);

    //center pad
    const padMat = new THREE.MeshBasicMaterial({color: 0xff0000})
    const padGeometry = new THREE.CylinderGeometry(0.75,0.75,0.1,32);

    const landPad = new THREE.Mesh(padGeometry,padMat);
    landPad.position.x=0;
    landPad.position.y=-1;
    landPad.position.z=0;
    this.add(landPad);

    //light for center pad 
    const light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set(0,0,-1);

    this.add(light);
    // Star generation Trig + loop
    const starMat = new THREE.MeshBasicMaterial({color:0xffffff})
    const starGeometry = new THREE.SphereGeometry();
    let radius = 400;
    let i = 0;
    for (; i < 2000; i++) {
      // Generate random spherical coordinates
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle
      const phi = Math.acos(Math.random() * 2 - 1); // Polar angle
    
      // Convert spherical coordinates to Cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
    
      let newStar = new THREE.Mesh(starGeometry, starMat);
      newStar.position.set(x, y, z); // Set position
      this.add(newStar); // Assuming 'scene' is your THREE.Scene
    }

    //listeners for user input
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    const canvas = document.getElementById("app") as HTMLCanvasElement;
    canvas.addEventListener("click", this.handleObjectClick);

  }

  // add to my Set
  private handleKeyDown = (event: KeyboardEvent) => {
    this.keyDown.add(event.key.toLowerCase());
  };

  //   from my Set to prevent mem leaks
  private handleKeyUp = (event: KeyboardEvent) => {
    this.keyDown.delete(event.key.toLowerCase());
  };

  // input handling
  private updateInput() {
    // if not rendered don't update
    if (!this.camera) {
      return;
    }

    // camera rotation 4 directions
    if (this.keyDown.has("arrowleft")) {
      this.camera.rotateY(0.1);
    }
    if (this.keyDown.has("arrowright")) {
      this.camera.rotateY(-0.1);
    }
    if (this.keyDown.has("arrowdown")) {
      this.camera.rotateX(-0.02);
    }
    if (this.keyDown.has("arrowup")) {
      this.camera.rotateX(0.02);
    }

    // simulate a ray with endpoint my position and direction cameradirection to emulate 
    // focusing on the center of the mouse
    const dir = this.directionVector;

    this.camera.getWorldDirection(dir);

    const speed = 0.25;
    
    // Currently experimenting with locked position
    
    if (this.keyDown.has("w")) {
      this.camera.position.add(dir.clone().multiplyScalar(speed));
    }
    if (this.keyDown.has("s")) {
      this.camera.position.add(dir.clone().multiplyScalar(-speed));
    }
    const upVector = new THREE.Vector3(0, 1, 0);
    const strafeDir = dir.clone();
    if (this.keyDown.has("a")) {
      this.camera.position.add(
        strafeDir.applyAxisAngle(upVector, Math.PI * 0.5).multiplyScalar(speed),
      );
    }
    if (this.keyDown.has("d")) {
      this.camera.position.add(
        strafeDir
          .applyAxisAngle(upVector, Math.PI * -0.5)
          .multiplyScalar(speed),
      );
    }
  }
  // ignore this error for now, component compiles I will fix later
  //@ts-expect-error
  private handleObjectClick = (event: MouseEvent) => {
    document.removeEventListener("click", this.handleObjectClick);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calculate mouse coordinates relative to the canvas
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, this.camera); // Assuming this.camera is your camera instance

    // Perform raycast
    const objectsArray = Array.from(this.triggers);

    const intersects = raycaster.intersectObjects(objectsArray);

    // Check if any object was clicked
    if (intersects.length > 0) {
      // Navigate to a new page when the object is clicked
      const router = useRouter();
      router.push("/text"); // Replace '/new-page' with the path of the page you want to navigate to
    }
  };
  private updateSquares(){
    this.triggers.forEach((value:THREE.Mesh)=>{
      value.rotation.x+=0.02;
      value.rotation.y+=0.02;
      value.rotation.z+=0.02;
    })
  }

  private updateTextRotation() {
    this.choices.forEach((value:THREE.Mesh)=>{
      const direction = new THREE.Vector3().subVectors(this.camera.position, value.position);    
      // quaternion is calc concept relating to essentially a 3d rotation
      value.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.normalize());
    })
  }

  private moveSquaresAndTexts(){
    let speed = 0.005;
    this.choices.forEach((value:THREE.Mesh)=>{
      const dir = new THREE.Vector3().subVectors(this.camera.position, value.position);    
      value.position.add(dir.clone().multiplyScalar(speed));
    })
    this.triggers.forEach((value:THREE.Mesh)=>{
      const dir = new THREE.Vector3().subVectors(this.camera.position, value.position);    
      value.position.add(dir.clone().multiplyScalar(speed));
      const distance = this.camera.position.distanceTo(value.position);

      // clicked needed so it doesn't queue unlimited reroutes
      if(distance<1 && this.clicked==false){
        this.clicked=true;
        console.log('game over')
        this.handleObjectClick(new MouseEvent('click'));
        exit;
      }

    })
  }
  update() {
    this.updateInput();
    this.updateSquares();
    this.updateTextRotation();
    this.moveSquaresAndTexts();
  }
}
