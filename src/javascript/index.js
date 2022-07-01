import * as THREE from 'three'
import GSAP, { Power4 } from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';
import isMobile from 'ismobilejs';
import Transition from './loading';

import vertexShaders from 'shaders/vertex.glsl'
import fragmentShaders from 'shaders/fragment.glsl'

class App {
   constructor() {

      this.scroller()

      this.time = 0
      this.canvas = document.getElementById('slider')
      this.scene = new THREE.Scene()

      this.vertex = vertexShaders
      this.fragment = fragmentShaders

      this.duration = 1
      this.uniforms = {
         radius: {value: 0.9, type:'f', min:0.1, max:2},
         width: {value: 0.35, type:'f', min:0., max:1},
      }
      this.debug = false
      this.easing = 'easeOut'

      this.width = this.canvas.offsetWidth
      this.height = this.canvas.offsetHeight

      this.camera = new THREE.PerspectiveCamera(
         70,
         window.innerWidth / window.innerHeight,
         0.001,
         1000
      )

      this.clickNext = document.querySelector(".slider-nav .nav-next")
      this.clickPrev = document.querySelector(".slider-nav .nav-prev")
      this.content = [...document.querySelectorAll("#slider .slides-item")]
      this.counter = document.querySelector(".slider-nav .nav-count .current")

      this.content[0].classList.add('active')

      this.camera.position.z = 2

      this.images = JSON.parse(this.canvas.getAttribute('data-images'))

      this.time = 0
      this.current = 0
      this.last = 0
      this.textures = []

      this.paused = true

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setClearColor(0xeeeeee, 1)

      this.canvas.querySelector('.slider').appendChild(this.renderer.domElement)

      
      const transition = new Transition();
      // transition.out()

      this.initiate(() => {
         
         setTimeout(() => {
            document.body.classList.add("ready")
            transition.in()
         }, 300);
         console.log(this.textures)
         this.setupResize()
         this.addObjects()
         this.clickEvent()
         this.resize()
         this.play()
      })
   }

   scroller() {
      
      this.locomotiveScroll = new LocomotiveScroll({
         el: document.querySelector("[data-scroll-container]"),
         lerp: .075,
         repeat: true,
         offset: [-100, -100],
         smooth: true,
         mobile: {
            smooth: false
         },
         tablet: {
            smooth: false
         }
      });

      this.locomotiveScroll.on("scroll", function (t, e) {
         hideShowHeader(t)
         if ( isMobile(window.navigator.userAgent).any) {
            throttle(parallax(t), 1)
         }
       })

       function throttle(fn, wait) {
         var time = Date.now();
         return function() {
           if ((time + wait - Date.now()) < 0) {
             fn();
             time = Date.now();
           }
         }
      }
      
       
      function parallax(t) {
         var parallaxes = document.querySelectorAll(".parallax");
         parallaxes.forEach((parallax, i) => {
            if (parallax.classList.contains('is-inview')) {
               var coords =  - parallax.parentNode.getBoundingClientRect().top  * .2
               parallax.style.transform = 'translateY(' + (coords) + 'px)';
            }
         })
      }

      var prevScroll = 0;
      var curScroll;
      var direction = 0;
      var prevDirection = 0;

      function hideShowHeader(t) {
         curScroll = t.scroll.y;
         if (curScroll > prevScroll) {
           direction = 2;
         }
         else if (curScroll < prevScroll) {
           direction = 1;
         }
       
         if (direction !== prevDirection) {
           toggleHeader(direction, curScroll);
         }
         prevScroll = curScroll;
       }

      var toggleHeader = function (direction, curScroll) {
         var header = document.querySelector(".header");

         if (direction === 2 && curScroll > 100) {
           header.classList.add('hide');
           prevDirection = direction;
         }
         else if (direction === 1) {
           header.classList.remove('hide');
           prevDirection = direction;
         }
       }
       
   }


   

   initiate(init) {
      const promises = []
      let that = this
      this.images.forEach((url, i) => {
         let promise = new Promise(resolve => {
            that.textures[i] = new THREE.TextureLoader().load(url, resolve)
         })
         promises.push(promise)
      })

      Promise.all(promises).then(() => {
       
         
         init()
      })
   }


   setupResize() {
      window.addEventListener('resize', this.resize.bind(this))
   }

   resize() {
      this.width = this.canvas.offsetWidth
      this.height = this.canvas.offsetHeight
      this.renderer.setSize(this.width, this.height)
      this.camera.aspect = this.width / this.height


      // Image Cover
      this.imageAspect = this.textures[0].image.height / this.textures[0].image.width

      let a1
      let a2

      if (this.height / this.width > this.imageAspect) {
         a1 = (this.width / this.height) * this.imageAspect
         a2 = 1
      } else {
         a1 = 1
         a2 = (this.height / this.width) / this.imageAspect
      }

      this.material.uniforms.resolution.value.x = this.width
      this.material.uniforms.resolution.value.y = this.height
      this.material.uniforms.resolution.value.z = a1
      this.material.uniforms.resolution.value.w = a2

      const dist = this.camera.position.z
      const height = 1
      this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist))

      this.plane.scale.x = this.camera.aspect
      this.plane.scale.y = 1

      this.camera.updateProjectionMatrix()
      
   }

   addObjects() {
      this.material = new THREE.ShaderMaterial({
         extensions: {
            derivatives: "#extension GL_OES_standard_derivatives : enable"
         },
         side: THREE.DoubleSide,
         uniforms: {
            time: { type: "f", value: 0 },
            progress: { type: "f", value: 0 },
            border: { type: "f", value: 0 },
            intensity: { type: "f", value: 0 },
            scaleX: { type: "f", value: 40 },
            scaleY: { type: "f", value: 40 },
            transition: { type: "f", value: 40 },
            swipe: { type: "f", value: 0 },
            width: { type: "f", value: 0 },
            radius: { type: "f", value: 0 },
            texture1: { type: "f", value: this.textures[0] },
            texture2: { type: "f", value: this.textures[1] },
            displacement: { type: "f", value: new THREE.TextureLoader().load('images/disp2.jpg') },
            resolution: { type: "v4", value: new THREE.Vector4() },
         },
         // wireframe: true,
         vertexShader: this.vertex,
         fragmentShader: this.fragment
      })

      this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2)

      this.plane = new THREE.Mesh(this.geometry, this.material)
      this.scene.add(this.plane)
   }

   clickEvent() {
      this.clickNext.addEventListener('click', () => {
         this.next()
      })
      this.clickPrev.addEventListener('click', () => {
         this.prev()
      })
   }

   stop() {
      this.paused = true
   }

   play() {
      this.paused = false
      this.render()
   }


   next() {
      if (this.isRunning) return

      this.isRunning = true
      this.counter.classList.add('running')

      if (this.content[this.last].classList.contains('active')) {
         this.content[this.last].classList.remove('active')
      }

      let len = this.textures.length
      let nextTexture

      if (this.current + 1 > (len - 1)) {
         nextTexture = this.textures[0]
         this.content[0].classList.add('running')
      } else {
         nextTexture = this.textures[(this.current + 1) % len]
         this.content[(this.current + 1) % len].classList.add('running')
      }
      this.material.uniforms.texture2.value = nextTexture

      let tl = new GSAP.timeline()

      tl.to(this.material.uniforms.progress, this.duration, {
         value: 1,
         ease: Power4[this.easing],
         onStart: () => {
            if (this.current + 1 > (len - 1)) {
               this.current = 0
            } else {
               this.current = (this.current + 1) % len
            }
            this.counter.classList.remove('running')
            this.content[this.current].classList.remove('running')
            this.content[this.current].classList.add('active')

            this.last = this.current

            this.counter.innerHTML = "0" + (this.current + 1)
         },
         onComplete: () => {
            

            this.material.uniforms.texture1.value = nextTexture
            this.material.uniforms.progress.value = 0

            this.isRunning = false
         }
      })
   }

   prev() {
      if (this.isRunning) return

      this.isRunning = true
      this.counter.classList.add('running')

      if (this.content[this.last].classList.contains('active')) {
         this.content[this.last].classList.remove('active')
      }

      let len = this.textures.length
      let nextTexture

      if (this.current - 1 < 0) {
         nextTexture = this.textures[len - 1]
         this.content[len - 1].classList.add('running')
      } else {
         nextTexture = this.textures[(this.current - 1) % len]
         this.content[(this.current - 1) % len].classList.add('running')
      }
      this.material.uniforms.texture2.value = nextTexture

      let tl = new GSAP.timeline()

      tl.to(this.material.uniforms.progress, this.duration, {
         value: 1,
         ease: Power4[this.easing],

         onStart: () => {
            if (this.current - 1 < 0) {
               this.current = len - 1
            } else {
               this.current = (this.current - 1) % len
            }

            this.counter.classList.remove('running')
            this.content[this.current].classList.remove('running')
            this.content[this.current].classList.add('active')

            this.last = this.current

            this.counter.innerHTML = "0" + (this.current + 1)
         },

         onComplete: () => {
            

            this.material.uniforms.texture1.value = nextTexture
            this.material.uniforms.progress.value = 0
            this.isRunning = false
         }
      })
   }

   render() {
      if (this.paused) return
      this.time += 0.05
      this.material.uniforms.time.value = this.time

      this.material.uniforms.radius.value = 0.5
      this.material.uniforms.width.value = 0.9

      this.material.uniforms.intensity.value = 0.05

      // this.material.uniforms.scaleX.value = 2.2
      // this.material.uniforms.scaleY.value = 2.2
      
      //this.material.uniforms.progress.value = this.progress;

      //this.material.uniforms[item].value = this.settings[item];

      requestAnimationFrame(this.render.bind(this))
      this.renderer.render(this.scene, this.camera)
   }
}

export default new App()
