import * as THREE from 'three'
import GSAP, { Power4 } from 'gsap'
import isMobile from 'ismobilejs';

import vertexShaders from 'shaders/vertex2.glsl'
import fragmentShaders from 'shaders/fragment2.glsl'

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const bounds = {
    
    ww: isMobile(window.navigator.userAgent).any ? (window.innerWidth * 2) : window.innerWidth,
    wh: window.innerHeight
};


export default class Transition {
    constructor() {
        _defineProperty(this, "render",

            () => {
                this.renderer.render(this.scene, this.camera);
                this.reverse = true;
            });
        _defineProperty(this, "out",

            () => {
                this.animating = true;
                this.reverse = true;

                const {
                    uProgress
                } = this.mat.uniforms;

                this.tl.clear().
                to(uProgress, {
                        value: 1,
                        onUpdate: () => this.render()
                    },
                    0).
                to(this.bend(), {
                        progress: 1
                    },
                    0).
                add(() => {
                    this.animating = false;
                }).
                play();
            });
        _defineProperty(this, "in",

            () => {
                this.animating = true;
                this.reverse = false;

                const {
                    uProgress,
                    uOut
                } =
                this.mat.uniforms;

                this.tl.clear().
                set(uOut, {
                    value: false
                }).
                to(uProgress, {
                        value: 0,
                        onUpdate: () => this.render()
                    },
                    0).
                to(this.bend(), {
                        progress: 1
                    },
                    0).
                set(uOut, {
                    value: true
                }).
                add(() => {
                    this.animating = false;
                }).
                play();
            });
        _defineProperty(this, "bend",

            () => {
                const {
                    uPower
                } = this.mat.uniforms;

                return GSAP.timeline({
                    paused: true,
                    defaults: {
                        ease: 'linear',
                        duration: 0.5
                    }
                }).


                to(uPower, {
                    value: 1
                }).
                to(uPower, {
                    value: 0
                });
            });
        _defineProperty(this, "resize",

            () => {
                const {
                    ww,
                    wh
                } = bounds;

                this.camera.left = ww / -2;
                this.camera.right = ww / 2;
                this.camera.top = wh / 2;
                this.camera.bottom = wh / -2;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(ww, wh);

                this.triangle.scale.set(ww / 2, wh / 2, 1);
            });
        const {
            ww: _ww,
            wh: _wh
        } = bounds;
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(_ww, _wh);
        this.renderer.setClearColor(0xffffff, 0);
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(_ww / -2, _ww / 2, _wh / 2, _wh / -2, 1, 100);
        this.camera.lookAt(this.scene.position);
        this.camera.position.z = 1;
        document.body.appendChild(this.renderer.domElement);

        this.renderer.domElement.classList.add("loadOverlay")
        this.geo = new THREE.BufferGeometry();
        const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
        const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
        this.geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.mat = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
             },
            vertexShader: vertexShaders,
            fragmentShader: fragmentShaders,
            uniforms: {
                uProgress: {
                    value: 1
                },
                uPower: {
                    value: 0
                },
                uOut: {
                    value: false
                }
            }
        });
        this.triangle = new THREE.Mesh(this.geo, this.mat);
        this.triangle.scale.set(_ww / 2, _wh / 2, 1);
        this.triangle.frustumCulled = false;
        this.scene.add(this.triangle);
        this.tl = GSAP.timeline({
            paused: true,
            defaults: {
                duration: 1.25,
                ease: 'power4.inOut'
            }
        });
        this.addEvents();
    }
    addEvents() {
        document.querySelector('.slider-title').addEventListener('click', () => {
            if (this.animating) return;
            this.reverse ? this.in() : this.out();
        });
    }
}


// window.addEventListener('resize', () => {
//     bounds.ww = isMobile(window.navigator.userAgent).any ? (window.innerWidth * 2) : window.innerWidth,
//     bounds.wh = window.innerHeight;
//     transition.resize();
// });