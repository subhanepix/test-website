import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap'; // For animations

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(/* ... */);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
// ... renderer setup (size, pixel ratio)
const controls = new OrbitControls(camera, renderer.domElement);
// ... lighting setup (ambient, directional)
// ... background setup

// --- CSS Renderer for Text ---
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// --- Create Category Object (Example: Education) ---
const eduGeometry = new THREE.BoxGeometry(10, 10, 10); // Placeholder
const eduMaterial = new THREE.MeshStandardMaterial({ color: 0x0077cc });
const educationMesh = new THREE.Mesh(eduGeometry, eduMaterial);
educationMesh.name = 'education'; // Identifier
educationMesh.position.set(-30, 10, 0);
scene.add(educationMesh);

// --- Create CSS Label for Education ---
const eduDiv = document.createElement('div');
eduDiv.className = 'label'; // Style with CSS
eduDiv.innerHTML = `
    <h2>Education</h2>
    <p><strong>C. T. Bauer College of Business, University of Houston</strong></p>
    <ul>
        <li>BBA in Management Information Systems</li>
        <li>GPA: 3.65/4.00 | Honors: Dean's List</li>
        <li>May 2024</li>
    </ul>
`;
const eduLabel = new CSS2DObject(eduDiv);
eduLabel.position.set(0, 7, 0); // Position relative to the mesh
educationMesh.add(eduLabel);
eduLabel.visible = false; // Hide initially

// --- Raycaster for Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [educationMesh /*, otherCategoryMeshes... */];

function onClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Hide all labels first
        clickableObjects