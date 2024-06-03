'use client'
import * as THREE from 'three'
import { useRouter } from 'next/router'; // Import Next.js router

export default class landingScene extends THREE.Scene {

    private readonly keyDown = new Set<string>();
	private readonly camera: THREE.PerspectiveCamera
	private directionVector = new THREE.Vector3()
	private readonly triggers = new Set<THREE.Mesh>();
	private readonly handleObjectClick: () => void; // Callback function type

    constructor(camera: THREE.PerspectiveCamera, handleObjectClick: () => void) {
        super()

        this.camera = camera
        this.triggers.clear();
        this.handleObjectClick = handleObjectClick; // Assign the callback function
    }

    initialize(){
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.z=-10;
        cube.position.y=1;
        cube.position.x=6
        this.add(cube);
		this.triggers.add(cube);
        const material2 = new THREE.MeshBasicMaterial({ color: 0x0000FF });

        const cube2 = new THREE.Mesh(geometry, material2);
        cube2.position.z=-5;
        cube2.position.y=1;
        cube2.position.x=-3
        this.add(cube2);
		this.triggers.add(cube2);
        const light = new THREE.DirectionalLight( 0xFFFFFF,1);
        light.position.set(0,4,2);

        this.add(light);

        document.addEventListener('keydown',this.handleKeyDown);
        document.addEventListener('keyup',this.handleKeyUp);

		const canvas = document.getElementById('app') as HTMLCanvasElement;
        canvas.addEventListener('click', this.handleObjectClick);
    }

    private handleKeyDown = (event : KeyboardEvent)=>{
		this.keyDown.add(event.key.toLowerCase());
    }

    private handleKeyUp = (event : KeyboardEvent)=>{
        this.keyDown.delete(event.key.toLowerCase());
    }

    private updateInput()
	{
		if (!this.camera)
		{
			return
		}
	
		if (this.keyDown.has('arrowleft'))
		{
			this.camera.rotateY(0.02)
		}
		if (this.keyDown.has('arrowright'))
		{
			this.camera.rotateY(-0.02)
		}
		if(this.keyDown.has('arrowdown')){
			this.camera.rotateX(-0.02);
		}
		if(this.keyDown.has('arrowup')){
			this.camera.rotateX(0.02);
		}
		const dir = this.directionVector

		this.camera.getWorldDirection(dir)

		const speed = 0.1

		if (this.keyDown.has('w'))
		{
			this.camera.position.add(dir.clone().multiplyScalar(speed))
		}
		if (this.keyDown.has('s'))
		{
			this.camera.position.add(dir.clone().multiplyScalar(-speed))
		}
		const upVector = new THREE.Vector3(0, 1, 0)
		const strafeDir = dir.clone()
		if (this.keyDown.has('a'))
		{
			this.camera.position.add(
				strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
					.multiplyScalar(speed)
			)
		}
		if (this.keyDown.has('d'))
		{
			this.camera.position.add(
				strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
					.multiplyScalar(speed)
			)
		}
	}
	private handleObjectClick = (event: MouseEvent) => {
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
            router.push('/text'); // Replace '/new-page' with the path of the page you want to navigate to
        }
    }
    update(){
        this.updateInput();
    }
}