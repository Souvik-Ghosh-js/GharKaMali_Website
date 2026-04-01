'use client';
import { useEffect, useRef } from 'react';

export default function TreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current || !containerRef.current) return;
    if (typeof window !== 'undefined' && window.innerWidth < 769) return;
    mountedRef.current = true;

    let animId: number;
    let cleanedUp = false;

    const init = async () => {
      const THREE = await import('three');
      if (cleanedUp || !containerRef.current) return;

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = (THREE as any).PCFSoftShadowMap;
      renderer.toneMapping = (THREE as any).ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      containerRef.current.appendChild(renderer.domElement);

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xfff9e1, 35, 80);

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
      camera.position.set(0, 5, 32);
      camera.lookAt(0, 5, 0);

      // ── Lighting (natural outdoor) ──
      // Sky light (top cool)
      const hemi = new THREE.HemisphereLight(0xfff4d0, 0xc8e6c9, 0.9);
      scene.add(hemi);

      // Sun directional (warm afternoon)
      const sun = new THREE.DirectionalLight(0xfff0c0, 2.2);
      sun.position.set(12, 22, 8);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.far = 80;
      sun.shadow.camera.left = -30;
      sun.shadow.camera.right = 30;
      sun.shadow.camera.top = 30;
      sun.shadow.camera.bottom = -30;
      sun.shadow.bias = -0.001;
      scene.add(sun);

      // Bounce fill (subtle green from ground)
      const bounce = new THREE.DirectionalLight(0xd4edda, 0.4);
      bounce.position.set(-5, -2, 5);
      scene.add(bounce);

      // ── Procedural bark texture ──
      function makeBarkTexture(): THREE.Texture {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        // Base brown
        ctx.fillStyle = '#7a5230';
        ctx.fillRect(0, 0, size, size);
        // Vertical striations
        for (let i = 0; i < 60; i++) {
          const x = Math.random() * size;
          const w = 1 + Math.random() * 3;
          const dark = Math.random() > 0.5;
          ctx.fillStyle = dark ? `rgba(0,0,0,${0.08 + Math.random() * 0.12})` : `rgba(255,255,255,${0.03 + Math.random() * 0.06})`;
          ctx.fillRect(x, 0, w, size);
        }
        // Knots
        for (let k = 0; k < 4; k++) {
          const kx = Math.random() * size;
          const ky = Math.random() * size;
          const r = 6 + Math.random() * 10;
          ctx.beginPath();
          ctx.ellipse(kx, ky, r * 0.6, r, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,0,0,0.25)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 4);
        return tex;
      }

      // ── Procedural leaf texture ──
      function makeLeafTexture(hue: number): THREE.Texture {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, size, size);
        // Leaf oval shape
        ctx.beginPath();
        ctx.ellipse(size / 2, size / 2, size * 0.42, size * 0.46, 0, 0, Math.PI * 2);
        // Gradient green fill
        const grad = ctx.createRadialGradient(size * 0.4, size * 0.4, 2, size / 2, size / 2, size * 0.48);
        grad.addColorStop(0, `hsl(${hue}, 50%, 38%)`);
        grad.addColorStop(0.6, `hsl(${hue - 5}, 45%, 28%)`);
        grad.addColorStop(1, `hsl(${hue - 10}, 55%, 18%)`);
        ctx.fillStyle = grad;
        ctx.fill();
        // Midrib
        ctx.beginPath();
        ctx.moveTo(size / 2, size * 0.08);
        ctx.bezierCurveTo(size * 0.52, size * 0.35, size * 0.5, size * 0.65, size / 2, size * 0.92);
        ctx.strokeStyle = `rgba(255,255,255,0.18)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Veins
        for (let v = 0; v < 5; v++) {
          const y = size * (0.2 + v * 0.14);
          ctx.beginPath();
          ctx.moveTo(size / 2, y);
          ctx.quadraticCurveTo(size * 0.65, y - 4, size * 0.78, y - 10 + v * 2);
          ctx.strokeStyle = `rgba(255,255,255,0.10)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(size / 2, y);
          ctx.quadraticCurveTo(size * 0.35, y - 4, size * 0.22, y - 10 + v * 2);
          ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
      }

      const barkTex = makeBarkTexture();
      const leafTex1 = makeLeafTexture(125); // dark green
      const leafTex2 = makeLeafTexture(115); // deeper green
      const leafTex3 = makeLeafTexture(100); // olive/warm green

      const barkMat = new THREE.MeshLambertMaterial({ map: barkTex, color: 0x9e7048 });
      const barkMatDark = new THREE.MeshLambertMaterial({ map: barkTex, color: 0x7a5230 });

      // Pre-created once and shared across all trees — creating inside buildTree caused 26+ duplicate allocations
      const leafMat1 = new THREE.MeshLambertMaterial({ map: leafTex1, transparent: true, opacity: 0.94, side: THREE.DoubleSide, alphaTest: 0.4 });
      const leafMat2 = new THREE.MeshLambertMaterial({ map: leafTex2, transparent: true, opacity: 0.94, side: THREE.DoubleSide, alphaTest: 0.4 });
      const leafMat3 = new THREE.MeshLambertMaterial({ map: leafTex3, transparent: true, opacity: 0.88, side: THREE.DoubleSide, alphaTest: 0.4 });
      const leafMat2Shrub = new THREE.MeshLambertMaterial({ map: leafTex2, transparent: true, opacity: 0.9, side: THREE.DoubleSide, alphaTest: 0.4 });

      const allMaterials = [barkMat, barkMatDark, leafMat1, leafMat2, leafMat3, leafMat2Shrub];

      function buildTree(x: number, y: number, z: number, scale: number, lMat = Math.random() > 0.5 ? leafMat1 : leafMat2) {
        const group = new THREE.Group();
        const trunkSegs = 8;
        const trunkH = 3.5 * scale;
        const trunkPoints = [];
        for (let i = 0; i <= trunkSegs; i++) {
          const t = i / trunkSegs;
          trunkPoints.push(new THREE.Vector2(
            (0.28 - t * 0.18) * scale, // radius tapers
            t * trunkH
          ));
        }
        const trunkGeo = new THREE.LatheGeometry(trunkPoints, 10);
        const trunk = new THREE.Mesh(trunkGeo, barkMat);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        // Surface roots
        for (let r = 0; r < 4; r++) {
          const angle = (r / 4) * Math.PI * 2;
          const rootGeo = new THREE.CylinderGeometry(0.04 * scale, 0.09 * scale, 0.6 * scale, 5);
          const root = new THREE.Mesh(rootGeo, barkMatDark);
          root.position.set(Math.cos(angle) * 0.25 * scale, 0.15 * scale, Math.sin(angle) * 0.25 * scale);
          root.rotation.z = Math.cos(angle) * 0.5;
          root.rotation.x = Math.sin(angle) * 0.5;
          group.add(root);
        }

        // Primary branches — emanating from upper trunk
        const branchCount = 5 + Math.floor(Math.random() * 3);
        for (let b = 0; b < branchCount; b++) {
          const t = 0.55 + (b / branchCount) * 0.45;
          const angle = (b / branchCount) * Math.PI * 2 + Math.random() * 0.6;
          const tilt = 0.3 + Math.random() * 0.5;
          const bLen = (1.2 + Math.random() * 1.0) * scale;
          const r1 = (0.1 - t * 0.06) * scale;
          const r2 = r1 * 0.45;

          const bGeo = new THREE.CylinderGeometry(r2, r1, bLen, 7);
          const branch = new THREE.Mesh(bGeo, barkMatDark);

          branch.position.set(
            Math.cos(angle) * r1 * 2,
            trunkH * t,
            Math.sin(angle) * r1 * 2
          );
          branch.rotation.z = Math.cos(angle) * tilt;
          branch.rotation.x = Math.sin(angle) * tilt;
          branch.castShadow = true;
          group.add(branch);

          // Sub-branches
          const subCount = 2 + Math.floor(Math.random() * 2);
          for (let s = 0; s < subCount; s++) {
            const sAngle = angle + (s / subCount - 0.5) * 1.4;
            const sLen = bLen * (0.45 + Math.random() * 0.3);
            const sGeo = new THREE.CylinderGeometry(r2 * 0.4, r2 * 0.7, sLen, 5);
            const sub = new THREE.Mesh(sGeo, barkMatDark);
            const bEndX = Math.cos(angle) * (bLen * 0.45) * tilt;
            const bEndY = trunkH * t + bLen * 0.5;
            const bEndZ = Math.sin(angle) * (bLen * 0.45) * tilt;
            sub.position.set(bEndX, bEndY, bEndZ);
            sub.rotation.z = Math.cos(sAngle) * (tilt + 0.3);
            sub.rotation.x = Math.sin(sAngle) * (tilt + 0.3);
            group.add(sub);
          }
        }

        const leafCount = Math.floor((50 + Math.random() * 40) * scale);
        for (let l = 0; l < leafCount; l++) {
          const leafGeo = new THREE.PlaneGeometry(
            (0.35 + Math.random() * 0.45) * scale,
            (0.30 + Math.random() * 0.40) * scale
          );
          const leaf = new THREE.Mesh(leafGeo, lMat);

          // Distribute in canopy sphere
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = (1.2 + Math.random() * 1.1) * scale;
          leaf.position.set(
            Math.sin(phi) * Math.cos(theta) * radius,
            trunkH * 0.7 + Math.cos(phi) * radius * 0.75,
            Math.sin(phi) * Math.sin(theta) * radius
          );
          leaf.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          leaf.castShadow = true;
          group.add(leaf);
        }

        const outerLeafCount = Math.floor(15 * scale);
        for (let l = 0; l < outerLeafCount; l++) {
          const leafGeo = new THREE.PlaneGeometry(0.28 * scale, 0.22 * scale);
          const leaf = new THREE.Mesh(leafGeo, leafMat3);
          const theta = Math.random() * Math.PI * 2;
          const r = (1.5 + Math.random() * 0.8) * scale;
          leaf.position.set(
            Math.cos(theta) * r,
            trunkH * 0.5 + Math.random() * 2 * scale,
            Math.sin(theta) * r
          );
          leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          group.add(leaf);
        }

        group.position.set(x, y, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        scene.add(group);
        return group;
      }

      function buildShrub(x: number, y: number, z: number, s: number) {
        const group = new THREE.Group();
        for (let i = 0; i < 18; i++) {
          const leafGeo = new THREE.PlaneGeometry((0.18 + Math.random() * 0.22) * s, (0.14 + Math.random() * 0.18) * s);
          const leaf = new THREE.Mesh(leafGeo, leafMat2Shrub);
          const theta = Math.random() * Math.PI * 2;
          const r = (0.3 + Math.random() * 0.5) * s;
          const h = (0.1 + Math.random() * 0.55) * s;
          leaf.position.set(Math.cos(theta) * r, h, Math.sin(theta) * r);
          leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          group.add(leaf);
        }
        // Tiny trunk stub
        const stubGeo = new THREE.CylinderGeometry(0.04 * s, 0.07 * s, 0.4 * s, 6);
        group.add(new THREE.Mesh(stubGeo, barkMatDark));

        group.position.set(x, y, z);
        scene.add(group);
        return group;
      }

      // ── Ground ──
      const groundGeo = new THREE.PlaneGeometry(120, 120, 1, 1);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0xe8ddb5, transparent: true, opacity: 0 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const trees: THREE.Group[] = [];
      trees.push(buildTree(-16, 0, -12, 1.9, leafMat1));
      trees.push(buildTree(16, 0, -12, 1.8, leafMat2));
      trees.push(buildTree(-8, 0, -9, 1.6, leafMat1));
      trees.push(buildTree(9, 0, -9, 1.7, leafMat2));
      trees.push(buildTree(0, 0, -14, 2.0, leafMat3));
      trees.push(buildTree(-20, 0, -2, 1.3, leafMat2));
      trees.push(buildTree(20, 0, -2, 1.4, leafMat1));
      trees.push(buildTree(-11, 0, 1, 1.1, leafMat3));
      trees.push(buildTree(12, 0, 1, 1.2, leafMat1));
      trees.push(buildTree(-24, 0, 8, 0.9, leafMat2));
      trees.push(buildTree(24, 0, 8, 0.95, leafMat3));
      trees.push(buildTree(-14, 0, 10, 0.8, leafMat1));
      trees.push(buildTree(15, 0, 10, 0.85, leafMat2));

      // Shrubs
      buildShrub(-5, 0, 13, 1.8);
      buildShrub(6, 0, 13, 1.5);
      buildShrub(-13, 0, 5, 1.3);
      buildShrub(13, 0, 5, 1.4);
      buildShrub(-3, 0, -4, 1.2);
      buildShrub(4, 0, -4, 1.1);

      // ── Floating leaf particles (realistic, not glowing) ──
      const pCount = 80;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pScale = new Float32Array(pCount);
      const pVel: number[] = [];
      const pDrift: number[] = [];
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 50;
        pPos[i * 3 + 1] = Math.random() * 16 + 3;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 3;
        pScale[i] = 0.5 + Math.random() * 0.6;
        pVel.push(0.005 + Math.random() * 0.006);
        pDrift.push((Math.random() - 0.5) * 0.008);
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('aScale', new THREE.BufferAttribute(pScale, 1));

      const pMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float aScale;
          varying float vS;
          uniform float uTime;
          void main() {
            vS = aScale;
            vec3 p = position;
            p.x += sin(uTime * 0.25 + position.y * 0.15 + aScale * 3.0) * 0.9;
            p.z += cos(uTime * 0.18 + position.x * 0.12) * 0.5;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = aScale * (200.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vS;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            // Oval leaf silhouette
            float r = uv.x * uv.x * 3.5 + uv.y * uv.y * 6.0;
            if (r > 0.24) discard;
            float edge = smoothstep(0.24, 0.10, r);
            // Natural green with slight variation
            vec3 dark = vec3(0.03, 0.22, 0.08);
            vec3 mid  = vec3(0.08, 0.35, 0.14);
            vec3 col  = mix(dark, mid, vS);
            gl_FragColor = vec4(col, edge * 0.75);
          }
        `,
        transparent: true,
        depthWrite: false,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // ── Mouse / scroll ──
      let mouseX = 0, mouseY = 0;
      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouse);

      let scrollY = 0;
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener('scroll', onScroll);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      // ── Animation loop ──
      let time = 0;
      const animate = () => {
        if (cleanedUp) return;
        animId = requestAnimationFrame(animate);
        time += 0.01;

        pMat.uniforms.uTime.value = time;

        // Leaf particles fall gently
        const pa = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          pa[i * 3 + 1] -= pVel[i];
          pa[i * 3] += pDrift[i];
          if (pa[i * 3 + 1] < -1) {
            pa[i * 3 + 1] = 16 + Math.random() * 6;
            pa[i * 3] = (Math.random() - 0.5) * 50;
          }
        }
        pGeo.attributes.position.needsUpdate = true;

        // Subtle tree sway (wind)
        trees.forEach((t, i) => {
          t.rotation.z = Math.sin(time * 0.5 + i * 1.1) * 0.008;
          t.rotation.x = Math.cos(time * 0.38 + i * 0.7) * 0.005;
        });

        // Camera drift
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 0.8 + 5 - camera.position.y) * 0.03;
        camera.position.z = 32 + scrollY * 0.006;
        camera.lookAt(0, 5, 0);

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cleanedUp = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouse);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        if (containerRef.current?.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };
    };

    init();
  }, []);

  return <div ref={containerRef} className="three-canvas-container" />;
}
