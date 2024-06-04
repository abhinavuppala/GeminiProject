"use client";
import * as THREE from "three";
import { useRouter } from "next/router"; // Import Next.js router
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { mx_bits_to_01 } from "three/examples/jsm/nodes/materialx/lib/mx_noise.js";
import { exit } from "process";

import { OBJLoader } from "three/examples/jsm/Addons.js";
import { MTLLoader } from "three/examples/jsm/Addons.js";
import { M_PLUS_1 } from "next/font/google";
import { create } from "domain";


export default class landingScene extends THREE.Scene {
  private readonly keyDown = new Set<string>();
  private readonly camera: THREE.PerspectiveCamera;
  private directionVector = new THREE.Vector3();
  private readonly triggers = new Set<THREE.Mesh>();
  private readonly choices = new Set<THREE.Mesh>();
  private readonly mtlLoader = new MTLLoader();
  private readonly objLoader = new OBJLoader();
  private solution?:THREE.Mesh;
  private projectileDirection = new THREE.Vector3;
  private pencilGun?: THREE.Group;
  private proj?: THREE.Group;
  private shot = false;
  private lifeLeft=0;
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

  async initialize() {

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
			mesh.position.x = 22;
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
      mesh3.position.z=22;
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
      mesh4.position.z=-22;
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
    this.solution = cube;


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

    const skylight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 10 );
    this.add( skylight );
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

    //pencil gun
    
    const pencilGun = await this.createPencil();
    this.pencilGun = pencilGun;
    this.add(pencilGun);
    let cameraOffset = new THREE.Vector3(0,0.65,1);
    this.camera.position.x=pencilGun.position.x;
    this.camera.position.y=pencilGun.position.y;
    this.camera.position.z=pencilGun.position.z;
    this.camera.position.add(cameraOffset);


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
      this.camera.rotateY(0.04);
    }
    if (this.keyDown.has("arrowright")) {
      this.camera.rotateY(-0.04);

    }
    if (this.keyDown.has("arrowdown")) {
      this.camera.rotateX(-0.02);

    }
    if (this.keyDown.has("arrowup")) {
      this.camera.rotateX(0.02);

    }
    if (this.keyDown.has(" ")&&this.shot==false){
      this.shot=true;
      const projPencil = this.createPencilProj();

      const cameraDirection = new THREE.Vector3(0, 0, 1);
      cameraDirection.applyQuaternion(this.camera.quaternion);
      this.projectileDirection = cameraDirection;

    }
    // simulate a ray with endpoint my position and direction cameradirection to emulate 
    // focusing on the center of the mouse
    const dir = this.directionVector;

    this.camera.getWorldDirection(dir);

    const speed = 0.25;
    
    // Currently experimenting with locked position
    /*
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
    */
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
      //value.rotation.x+=0.02;
      //value.rotation.y+=0.02;
      //value.rotation.z+=0.02;
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
    let speed = 0.001;
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

  private async createPencil(){

    const mtl = await this.mtlLoader.loadAsync('assets/pencil.mtl');
    mtl.preload();

    this.objLoader.setMaterials(mtl);

    const modelRoot = await this.objLoader.loadAsync('assets/pencil.obj');

    modelRoot.rotateX(Math.PI * -0.35)

    modelRoot.scale.set(0.05,0.05,0.05);
    return modelRoot;
  }
  private async updatePencil(){
    if (!this.pencilGun || !this.camera) {
      return;
    }   
    
    // Calculate the camera's forward direction
    const cameraDirection = new THREE.Vector3(0, 0, 1);
    cameraDirection.applyQuaternion(this.camera.quaternion);

    // Calculate the offset based on the camera's direction and a predefined distance
    const offsetDistance = 1; // Adjust the distance as needed
    const cameraOffset = cameraDirection.clone().multiplyScalar(-offsetDistance);

    // Set the pencilGun's position to be behind the camera
    const pencilPosition = this.camera.position.clone().add(cameraOffset);
    pencilPosition.y-=0.5;
    this.pencilGun.position.copy(pencilPosition);


    // Adjust the rotation of the pencilGun to match the camera's rotation
    this.pencilGun.rotation.copy(this.camera.rotation);
    this.pencilGun.rotateX(Math.PI * -0.35)

  }
  private async createPencilProj(){
    if(this.pencilGun){
      const proj = await this.createPencil();
      proj.position.copy(this.pencilGun.position);
      proj.rotation.copy(this.pencilGun.rotation);

      proj.rotation.y=0;
      this.lifeLeft=50;
      this.add(proj);
      this.proj = proj;

      var dir = new THREE.Vector3(); // create once an reuse it
      let startPos = this.camera.position.clone();
      startPos.y-=0.5;

      dir.subVectors(this.pencilGun?.position,startPos).normalize();
      this.projectileDirection=dir;
      console.log("pencil created");
    }
    
  }
  private updatePencilProj(){
    if(this.proj && this.pencilGun){
      this.lifeLeft-=1;
      if(this.lifeLeft<=0){
        this.shot=false;
        this.remove(this.proj); 
        delete this.proj;
        return;
      }
      this.proj.position.add(this.projectileDirection);
    }
  }
  private handlePencilCollisions(){
    if(this.proj){
      this.triggers.forEach((value:THREE.Mesh)=>{
        if(value.position.distanceTo(this.proj!.position)<1){
          if(value==this.solution){
            console.log("correct");
            this.resetSquaresAndText();
            return;
          }
          else{
            console.log('incorrect');
            if (Array.isArray(value.material)) {
              // If the material is an array, loop through each material
              value.material.forEach((mat) => {
                mat.transparent = true;
                mat.opacity = 0; // Reset opacity to 1.0 (fully opaque)
              });
            } else {
              // If the material is a single material
              value.material.transparent = true;
              value.material.opacity = 0; // Reset opacity to 1.0 (fully opaque)
            }
          }
        }
      })
    }
  }
  private resetSquaresAndText(){
    const options: THREE.Vector3[] = [
      new THREE.Vector3(0, 0.25, -25),
      new THREE.Vector3(0,0.25,25),
      new THREE.Vector3(-25, 0.25, 0),
      new THREE.Vector3(25,0.25,0),
    ];
    let index=0;
    const randomNumber = Math.floor(Math.random() * 4);

    this.triggers.forEach((value:THREE.Mesh)=>{
      value.position.copy(options[index]);
      if(index==randomNumber){
        this.solution=value;
      }
      index+=1;
      if (Array.isArray(value.material)) {
        // If the material is an array, loop through each material
        value.material.forEach((mat) => {
          mat.transparent = false;
          mat.opacity = 1.0; // Reset opacity to 1.0 (fully opaque)
        });
      } else {
        // If the material is a single material
        value.material.transparent = false;
        value.material.opacity = 1.0; // Reset opacity to 1.0 (fully opaque)
      }
    })
    const textOptions: THREE.Vector3[] = [
      new THREE.Vector3(22, 0.25, -0.5),
      new THREE.Vector3(-23,0.25,0.5),
      new THREE.Vector3(0.5, 0.25, 22),
      new THREE.Vector3(-0.5,0.25,-22),
    ];
    index=0
    this.choices.forEach((value:THREE.Mesh)=>{
      value.position.copy(textOptions[index]);
      index+=1;
    })
  }
  update() {
    this.updateInput();
    this.updateSquares();
    this.updateTextRotation();
    this.moveSquaresAndTexts();
    this.updatePencil();
    this.updatePencilProj();
    this.handlePencilCollisions();
  }
}
