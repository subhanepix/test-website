import *->import { ColorManagement, AmbientLight } from "three";
*;
import {
  WebGLRenderer, PerspectiveCamera, Scene, Vector3, Color,
  MeshStandardMaterial, SphereGeometry, Mesh, Raycaster, Vector2, Group
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { gsap } from 'gsap';

// --- Resume Data ---
const resumeData = {
  education: {
    title: "Education",
    position: [-20, 5, 0],
    color: 0x0077cc,
    content: `
      <h3>C. T. Bauer College of Business, University of Houston</h3>
      <ul>
        <li>BBA in Management Information Systems</li>
        <li>GPA: 3.65/4.00 | Honors: Dean's List (May 2022-2023)</li>
        <li>Expected Graduation: May 2024</li>
      </ul>
    `
  },
  experience: {
    title: "Professional Experience",
    position: [20, -5, 5],
    color: 0xcc7700,
    content: `
      <h3>Ernst & Young - Cybersecurity Consulting Intern</h3>
      <ul>
        <li>Devised Azure AD assessment script (PowerShell/Graph API).</li>
        <li>Boosted IAM assessment efficiency by 200%.</li>
        <li>Automated PowerBI security dashboards.</li>
        <li><i>(June 2023 - Aug 2023)</i></li>
      </ul>
       <h3>PricewaterhouseCoopers - DAT Intern</h3>
      <ul>
        <li>Utilized Alteryx & Tableau for SOX automation.</li>
        <li>Reconstructed systems for client controls.</li>
        <li>Audited IT controls & financial reporting.</li>
        <li><i>(Aug 2022 - Dec 2022)</i></li>
      </ul>
    `
  },
  // --- Add other categories similarly ---
  // skills: { ... },
  // leadership: { ... }
};

// --- Basic Scene Setup ---
let scene, camera, renderer, controls, labelRenderer, raycaster, mouse;
let clickableObjects = [];
let activeLabel = null;

function init() {
  // Scene
  scene = new Scene();
  scene.background = new Color(0x111111);

  // Camera
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  // Renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // CSS2D Renderer for Labels
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through
  document.body.appendChild(labelRenderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  const ambientLight = new AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);


  // Raycaster for interaction
  raycaster = new Raycaster();
  mouse = new Vector2();

  // --- Create Objects and Labels ---
  createResumeObjects();

  // --- Event Listeners ---
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onClick);

  // Start animation loop
  animate();
}

function createResumeObjects() {
  const geometry = new SphereGeometry(5, 32, 32); // Simple sphere for categories

  for (const key in resumeData) {
    const data = resumeData[key];

    const material = new MeshStandardMaterial({
        color: data.color,
        roughness: 0.4,
        metalness: 0.1
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...data.position);
    mesh.userData = { category: key, content: data.content }; // Store data
    scene.add(mesh);
    clickableObjects.push(mesh); // Add to clickable list

    // Create CSS2D Label
    const div = document.createElement('div');
    div.className = 'label'; // Use class for styling
    div.innerHTML = data.content;
    const cssLabel = new CSS2DObject(div);
    cssLabel.position.set(0, 7, 0); // Position relative to the mesh center
    mesh.add(cssLabel); // Attach label to mesh
    mesh.userData.labelElement = div; // Store reference to the div itself
  }
}


function onClick(event) {
    // Update the picking ray with the camera and mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const categoryData = clickedObject.userData;

        // Hide previously active label (if any)
        if (activeLabel && activeLabel !== categoryData.labelElement) {
            activeLabel.classList.remove('visible');
        }

        // Show the new label
        activeLabel = categoryData.labelElement;
        activeLabel.classList.add('visible');


        // Animate camera focus
        const targetPosition = clickedObject.position.clone();
        const offset = new Vector3(0, 0, 20); // Zoom distance from object
        const focusPoint = targetPosition.clone(); // Point camera looks at

        gsap.to(camera.position, {
            duration: 1.5, // Animation duration in seconds
            x: targetPosition.x + offset.x,
            y: targetPosition.y + offset.y,
            z: targetPosition.z + offset.z,
            ease: 'power2.inOut',
            onUpdate: () => {
              controls.target.copy(focusPoint); // Keep looking at the object while moving
              controls.update(); // Essential for OrbitControls after manual camera move
            }
        });
         gsap.to(controls.target, {
            duration: 1.5,
            x: focusPoint.x,
            y: focusPoint.y,
            z: focusPoint.z,
            ease: 'power2.inOut',
        });

        console.log("Clicked on:", categoryData.category);

    } else {
         // Optional: Clicked on empty space - hide active label?
        // if (activeLabel) {
        //    activeLabel.classList.remove('visible');
        //    activeLabel = null;
            // Maybe animate camera back to overview?
        // }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Subtle rotation for objects (optional)
    // clickableObjects.forEach(obj => {
    //    obj.rotation.y += 0.005;
    // });

    controls.update(); // Only required if controls.enableDamping = true
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // Render labels on top
}

// --- Start everything ---
init();