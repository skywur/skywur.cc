(function () {
    "use strict";
    /**
     * Refactored Three.js scene with Particle Morphing and OBJ loading.
     * Preserves original functionality (morph transitions, event listeners, etc.)
     * but reorganizes code for clarity, includes helpful comments, and uses
     * consistent naming conventions.
     */

    // Early exit for small viewports
    if (window.innerWidth <= 768) return;

    
    // Particle configuration
    const TOTAL_PARTICLES = 10000;
    const BASE_PARTICLE_SIZE = 0.1;
    const BASE_COLOR_HEX = 0xffffff;
    const PARTICLE_TEXTURE_URL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/particle-tiny.png";
    
    // Animation/speed settings
    const NORMAL_SPEED_FACTOR = 1.25 / 100;
    const MORPH_SPEED_FACTOR = 1 / 100;
    const TWEEN_MORPH_DURATION = 5;
    
    // DOM references
    const triggersContainer = document.getElementsByClassName("triggers")[0];
    const triggersList = triggersContainer.querySelectorAll("a");
    const homeLink = document.getElementsByClassName("logo")[0];
    const canvasEl = document.querySelector("#canvas");
    
    // Core Three.js objects
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(0, 0, 25);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 10));
    
    // Particle geometry containers
    const mainGeometry = new THREE.Geometry();
    const homeGeometry = new THREE.Geometry();
    const discordGeometry = new THREE.Geometry();
    const twitterGeometry = new THREE.Geometry();
    const steamGeometry = new THREE.Geometry();
    const pronounsGeometry = new THREE.Geometry();
    const mailGeometry = new THREE.Geometry();

    // Material for point cloud
    const particleMaterial = new THREE.PointCloudMaterial({
        color: BASE_COLOR_HEX,
        size: BASE_PARTICLE_SIZE,
        map: THREE.ImageUtils.loadTexture(PARTICLE_TEXTURE_URL),
        blending: THREE.AdditiveBlending,
        transparent: true,
    });

    // Build initial geometry for main particle system
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
        mainGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }

    // Particle system
    const particleSystem = new THREE.PointCloud(mainGeometry, particleMaterial);
    particleSystem.sortParticles = true;
    scene.add(particleSystem);

    // Add these constants for easy glow customization
    const GLOW_SIZE_MULTIPLIER = 1.0;
    const GLOW_OPACITY = 0.2;

    // Create a second particle system with slightly larger, semi-transparent material
    const glowMaterial = new THREE.PointCloudMaterial({
        color: 0xffffff,
        size: BASE_PARTICLE_SIZE * GLOW_SIZE_MULTIPLIER,
        map: THREE.ImageUtils.loadTexture(PARTICLE_TEXTURE_URL),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: GLOW_OPACITY,
    });
    const glowParticleSystem = new THREE.PointCloud(mainGeometry, glowMaterial);
    glowParticleSystem.sortParticles = true;
    scene.add(glowParticleSystem);

    // Animation speed state
    const animationState = { speed: NORMAL_SPEED_FACTOR };

    // Renderer setup
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);

    // Handle resizing
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);
    }
    window.addEventListener("resize", handleResize, false);

    /**
     * Creates vertex sets from geometry points and pushes them into a given
     * THREE.Geometry object.
     * @param {THREE.Geometry} targetGeometry - The geometry to populate.
     * @param {Array} pointArray - Random points in buffer geometry.
     * @param {number} yOffset - Offset along the Y axis.
     * @param {number|null} triggerIndex - If not null, re-enables the matching trigger.
     */
    function populateGeometry(targetGeometry, pointArray, yOffset, triggerIndex) {
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const v = new THREE.Vector3(
                pointArray[i].x,
                pointArray[i].y - yOffset,
                pointArray[i].z
            );
            targetGeometry.vertices.push(v);
        }
        if (triggerIndex !== null) {
            triggersList[triggerIndex].setAttribute("data-disabled", false);
        }
    }

    /**
     * Loads an OBJ file and randomly disperses points into a given geometry container.
     * @param {string} objUrl - The URL to the OBJ file.
     * @param {number} scaleVal - Scale factor for the loaded mesh.
     * @param {THREE.Geometry} targetGeometry - The geometry container for this OBJ.
     * @param {number} yOffsetAdjust - Adjust for the bounding box to center geometry.
     * @param {number|null} triggerIndex - Index of the corresponding trigger or null.
     */
    function loadAndDispersePoints(objUrl, scaleVal, targetGeometry, yOffsetAdjust, triggerIndex) {
        // Allow cross-domain requests for models
        THREE.DefaultLoadingManager.crossOrigin = 'anonymous';

        const loader = new THREE.OBJLoader();
        loader.crossOrigin = 'anonymous';

        loader.load(objUrl, (loadedObj) => {
            loadedObj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const boundingBox = new THREE.Box3().setFromObject(child);
                    const yOffset = boundingBox.max.y * scaleVal - yOffsetAdjust;
                    child.geometry.scale(scaleVal, scaleVal, scaleVal);
                    const randomPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(
                        child.geometry,
                        TOTAL_PARTICLES
                    );
                    populateGeometry(targetGeometry, randomPoints, yOffset, triggerIndex);
                }
            });
        });
    }

    // Load objects from local files
    loadAndDispersePoints("./models/main.obj", 2.5, homeGeometry, 7, 2);
    loadAndDispersePoints("./models/discord.obj", 2.5, discordGeometry, 7, 0);
    loadAndDispersePoints("./models/twitter.obj", 2.5, twitterGeometry, 7, 1);
    loadAndDispersePoints("./models/steam.obj", 2.5, steamGeometry, 8.5, 2);
    loadAndDispersePoints("./models/discord.obj", 2.5, pronounsGeometry, 7, 3);
    loadAndDispersePoints("./models/spotify.obj", 2.5, mailGeometry, 7, 4);

    /**
     * Tweens the entire particle system from its current geometry to a new geometry.
     * @param {THREE.Geometry} target - The geometry to morph to.
     * @param {string} colorHexString - Hex color string for the new particle color.
     */
    function morphTo(target, colorHexString) {
        TweenMax.to(animationState, 0.03, {
            ease: Power2.easeIn,
            speed: MORPH_SPEED_FACTOR,
            onComplete: restoreSpeed,
        });
        particleSystem.material.color.setHex(colorHexString);

        for (let i = 0; i < mainGeometry.vertices.length; i++) {
            TweenMax.to(mainGeometry.vertices[i], TWEEN_MORPH_DURATION, {
                ease: Elastic.easeOut.config(1, 0.95),
                x: target.vertices[i].x,
                y: target.vertices[i].y,
                z: target.vertices[i].z,
            });
        }
    }

    /**
     * Restores the particle rotation speed after a morph transition.
     */
    function restoreSpeed() {
        TweenMax.to(animationState, 2, {
            ease: Power2.easeOut,
            speed: NORMAL_SPEED_FACTOR,
            delay: 0.1,
        });
    }

    /**
     * Toggles the data-disabled attribute on triggers so only one trigger is disabled at a time.
     * @param {number} disabledIndex - Index of the trigger to disable.
     */
    function handleTriggers(disabledIndex) {
        for (let i = 0; i < triggersList.length; i++) {
            triggersList[i].setAttribute("data-disabled", i === disabledIndex);
        }
    }

    // Each of these functions morphs to a specific geometry and color,
    // while updating trigger states or logging as needed.
    function toHome() {
        morphTo(homeGeometry, "0x837cfc");
        console.log("home");
    }
    function toDiscord() {
        handleTriggers(0);
        morphTo(discordGeometry, "0x0d86ff");
        console.log("discord");
    }
    function toTwitter() {
        handleTriggers(1);
        morphTo(twitterGeometry, "0x1DA1F2");
        console.log("twitter");
    }
    function toSteam() {
        handleTriggers(2);
        morphTo(steamGeometry, "0xc97dff");
        console.log("steam");
    }
    function toPronouns() {
        handleTriggers(3);
        morphTo(pronounsGeometry, "0xffb5fe");
        console.log("pronouns");
    }
    function toMail() {
        handleTriggers(4);
        morphTo(mailGeometry, "0x1db954");
    }

    // Event listeners for interaction
    homeLink.addEventListener("mouseover", toHome);
    triggersList[0].addEventListener("mouseover", toDiscord);
    triggersList[1].addEventListener("mouseover", toTwitter);
    triggersList[2].addEventListener("mouseover", toSteam);
    triggersList[3].addEventListener("mouseover", toMail);
    // triggersList[4] can be added similarly if needed

    /**
     * Main animation loop: rotates the particle system and re-renders the scene.
     */
    // In the animate function, rotate both systems:
    function animate() {
        particleSystem.rotation.y += animationState.speed;
        glowParticleSystem.rotation.y += animationState.speed;
        mainGeometry.verticesNeedUpdate = true;
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // Start animation, then redirect particles to home geometry
    animate();
    // Wrap setTimeout in the loader's onLoad callback or after all objects are loaded
    setTimeout(toHome, 250);
})();