// this file is BAD
// i wrote it years ago and i don't want to touch it
// TODO refactor

// if viewport is not mobile
if (window.innerWidth > 768) {

const numberOfParticles = 10000

// Options

const particleImage = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/particle-tiny.png',
    particleColor = '0xFFFFFF',
    particleSize = .1;

const defaultAnimationSpeed = 1.25,
morphAnimationSpeed = 1;

// Triggers
const triggers = document.getElementsByClassName('triggers')[0].querySelectorAll('a')
const home = document.getElementsByClassName('logo')

// Renderer
const canvas = document.querySelector('#canvas')
var renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth/3, window.innerHeight/3);

// Ensure Full Screen on Resize
function fullScreen() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth/3, window.innerHeight/3);
}

window.addEventListener('resize', fullScreen, false)

// Scene
var scene = new THREE.Scene();

// Camera and position
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

camera.position.y = 0;
camera.position.z = 25;


// Lighting
var light = new THREE.AmbientLight(0x404040, 10); // soft white light
scene.add(light);

// Particle Vars
var particleCount = numberOfParticles;

let projectPoints,
    homePoints,
    discordPoints,
    twitterPoints,
    steamPoints,
    pronounsPoints,
    mailPoints;

var particles = new THREE.Geometry(),
    homeParticles = new THREE.Geometry(),
    discordParticles = new THREE.Geometry(),
    twitterParticles = new THREE.Geometry(),
    steamParticles = new THREE.Geometry(),
    pronounsParticles = new THREE.Geometry(),
    mailParticles = new THREE.Geometry();

var pMaterial = new THREE.PointCloudMaterial({
    color: particleColor,
    size: particleSize,
    map: THREE.ImageUtils.loadTexture(particleImage),
    blending: THREE.AdditiveBlending,
    transparent: true
});

// Custom (OGJ) Objects
// home
var objLoader = new THREE.OBJLoader();
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/mainFINAL.obj?v=1663222069867', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 7;

            child.geometry.scale(scale, scale, scale);
            homePoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(homeParticles, homePoints, yOffset, 2);
        }
    });
});
// discord
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/discordFINAL.obj?v=1663215088026', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 7;

            child.geometry.scale(scale, scale, scale);
            discordPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(discordParticles, discordPoints, yOffset, 0);
        }
    });
});
// twitter
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/twitterFINAL.obj?v=1663209948782', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 7;

            child.geometry.scale(scale, scale, scale);
            twitterPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(twitterParticles, twitterPoints, yOffset, 0);
        }
    });
});
// steam
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/steamFINAL.obj?v=1663215362951', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 8.5;

            child.geometry.scale(scale, scale, scale);
            steamPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(steamParticles, steamPoints, yOffset, 0);
        }
    });
});
// pronouns
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/discordFINAL.obj?v=1663215088026', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 7;

            child.geometry.scale(scale, scale, scale);
            pronounsPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(pronounsParticles, pronounsPoints, yOffset, 0);
        }
    });
});
// mail
objLoader.load('https://cdn.glitch.global/f630c6b7-9fae-41f5-b0b8-620665c52345/spotify.obj?v=1668974528479', function(object) {
    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            let scale = 2.5;

            let area = new THREE.Box3();
            area.setFromObject(child);
            let yOffset = (area.max.y * scale) - 7;

            child.geometry.scale(scale, scale, scale);
            mailPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(child.geometry, particleCount);
            createVertices(mailParticles, mailPoints, yOffset, 0);
        }
    });
});

// Particles
for (var p = 0; p < particleCount; p++) {
    var vertex = new THREE.Vector3();
    vertex.x = 0;
    vertex.y = 0;
    vertex.z = 0;

    particles.vertices.push(vertex);
}

function createVertices(emptyArray, points, yOffset = 0, trigger = null) {
    for (var p = 0; p < particleCount; p++) {
        var vertex = new THREE.Vector3();
        vertex.x = points[p]['x'];
        vertex.y = points[p]['y'] - yOffset;
        vertex.z = points[p]['z'];

        emptyArray.vertices.push(vertex);
    }
    if (trigger !== null) {
        triggers[trigger].setAttribute('data-disabled', false)
    }
}

var particleSystem = new THREE.PointCloud(
    particles,
    pMaterial
);

particleSystem.sortParticles = true;

// Add the particles to the scene
scene.add(particleSystem);

// Animate
const normalSpeed = (defaultAnimationSpeed / 100),
    fullSpeed = (morphAnimationSpeed / 100)

let animationVars = {
    speed: normalSpeed
}

function animate() {
    particleSystem.rotation.y += animationVars.speed;
    particles.verticesNeedUpdate = true;

    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
setTimeout(toHome, 250);



function toHome() {
    morphTo(homeParticles, '0x837cfc');
    console.log('home')
}

function todiscord() {
    handleTriggers(0);
    morphTo(discordParticles, '0x0d86ff');
    console.log('discord')
}

function totwitter() {
    handleTriggers(1);
    morphTo(twitterParticles, '0x1DA1F2');
    console.log('twitter')
}

function tosteam() {
    handleTriggers(2);
    morphTo(steamParticles, '0xc97dff');
    console.log('steam')
}

function topronouns() {
    handleTriggers(3);
    morphTo(pronounsParticles, '0xffb5fe');
    console.log('pronouns')
}

function tomail() {
    handleTriggers(4);
    morphTo(mailParticles, '0x1db954');
}




function morphTo(newParticles, color) {
    TweenMax.to(animationVars, .03, {
        ease: Power2.easeIn,
        speed: fullSpeed,
        onComplete: slowDown
    });
    particleSystem.material.color.setHex(color);


    for (var i = 0; i < particles.vertices.length; i++) {
        TweenMax.to(particles.vertices[i], 5, {
            ease: Elastic.easeOut.config(1, 0.95),
            x: newParticles.vertices[i].x,
            y: newParticles.vertices[i].y,
            z: newParticles.vertices[i].z
        })
    }
}

function slowDown() {
    TweenMax.to(animationVars, 2, {
        ease: Power2.easeOut,
        speed: normalSpeed,
        delay: .1
    });
}

home[0].addEventListener('mouseover', toHome)
triggers[0].addEventListener('mouseover', todiscord)
triggers[1].addEventListener('mouseover', totwitter)
triggers[2].addEventListener('mouseover', tosteam)
triggers[3].addEventListener('mouseover', tomail)
//triggers[4].addEventListener('mouseover', tomail)



function handleTriggers(disable) {
    for (var x = 0; x < triggers.length; x++) {
        if (disable == x) {
            triggers[x].setAttribute('data-disabled', true)

        } else {
            triggers[x].setAttribute('data-disabled', false)
        }
    }
}

}
toHome();
