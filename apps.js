// Main variables
let scene, camera, renderer, controls;
let model = null;
let isRotating = false;
let rotationSpeed = 0.005;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add axes helper (optional)
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading message
    document.getElementById('loading').style.display = 'none';
    
    // Set up file input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // Set up rotation toggle
    document.getElementById('rotate-toggle').addEventListener('click', () => {
        isRotating = !isRotating;
    });
    
    // Start animation loop
    animate();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating && model) {
        model.rotation.y += rotationSpeed;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    // Clear previous model
    if (model) {
        scene.remove(model);
    }
    
    // Show loading message
    document.getElementById('loading').style.display = 'block';
    
    // Load OBJ file
    const objFile = Array.from(files).find(file => file.name.endsWith('.obj'));
    const mtlFile = Array.from(files).find(file => file.name.endsWith('.mtl'));
    
    if (objFile) {
        const objLoader = new THREE.OBJLoader();
        const objectUrl = URL.createObjectURL(objFile);
        
        if (mtlFile) {
            // Load with MTL materials
            const mtlLoader = new THREE.MTLLoader();
            const mtlUrl = URL.createObjectURL(mtlFile);
            
            mtlLoader.load(mtlUrl, (materials) => {
                materials.preload();
                objLoader.setMaterials(materials);
                loadObj(objLoader, objectUrl);
            });
        } else {
            // Load without materials
            loadObj(objLoader, objectUrl);
        }
    }
}

function loadObj(loader, url) {
    loader.load(url, (object) => {
        model = object;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Scale the model to fit the view
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.set(scale, scale, scale);
        
        scene.add(model);
        document.getElementById('loading').style.display = 'none';
        
        // Reset camera position
        camera.position.z = 10;
        controls.reset();
    }, undefined, (error) => {
        console.error('Error loading model:', error);
        document.getElementById('loading').textContent = 'Error loading model: ' + error.message; // Display error message
    });
}

// Start the application
init();