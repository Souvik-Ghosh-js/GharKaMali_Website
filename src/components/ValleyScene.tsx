'use client';
import { useEffect, useRef } from 'react';

export default function ValleyScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    // Render on all devices — same hero background for desktop & mobile

    let cleanup: (() => void) | undefined;

    const init = async () => {
      const THREE = await import('three');
      const mount = mountRef.current!;
      if (!mount) return;

      const W = mount.clientWidth || window.innerWidth;
      const H = mount.clientHeight || window.innerHeight;

      /* ── Renderer ── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);

      /* ── Scene ── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb8e3ff); // soft sky blue
      scene.fog = new THREE.FogExp2(0xd0eeff, 0.018);

      /* ── Camera ── */
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 500);
      camera.position.set(0, 12, 50);
      camera.lookAt(0, 2, 0);

      /* ── Lighting ── */
      const ambient = new THREE.AmbientLight(0xfff4e0, 1.0);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xfff9e1, 2.0);
      sun.position.set(60, 120, 40);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 300;
      sun.shadow.camera.left = -80;
      sun.shadow.camera.right = 80;
      sun.shadow.camera.top = 80;
      sun.shadow.camera.bottom = -80;
      scene.add(sun);

      const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a8c3f, 0.8);
      scene.add(hemi);

      /* ── Sky gradient sphere ── */
      const skyGeo = new THREE.SphereGeometry(400, 32, 16);
      const skyMat = new THREE.MeshBasicMaterial({
        color: 0xaee4ff,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(skyGeo, skyMat));

      /* ── Terrain ── */
      const terrainW = 200, terrainD = 200, segs = 120;
      const terrainGeo = new THREE.PlaneGeometry(terrainW, terrainD, segs, segs);
      const verts = terrainGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < verts.length; i += 3) {
        const x = verts[i];
        const z = verts[i + 2];
        // Multi-octave rolling hills
        const h =
          Math.sin(x * 0.04) * 8 +
          Math.cos(z * 0.035) * 6 +
          Math.sin(x * 0.09 + z * 0.06) * 3 +
          Math.cos(x * 0.15 - z * 0.12) * 2 +
          Math.sin(x * 0.25 + z * 0.2) * 1 -
          4;
        verts[i + 1] = h;
      }
      terrainGeo.attributes.position.needsUpdate = true;
      terrainGeo.computeVertexNormals();

      // Green gradient terrain via vertex colors
      const terrainColors = new Float32Array(verts.length);
      for (let i = 0; i < verts.length; i += 3) {
        const height = verts[i + 1];
        // Low = dark green, high = lighter green/yellow
        const t = Math.max(0, Math.min(1, (height + 4) / 12));
        const r = 0.18 + t * 0.22;
        const g = 0.48 + t * 0.25;
        const b = 0.18 + t * 0.05;
        terrainColors[i] = r;
        terrainColors[i + 1] = g;
        terrainColors[i + 2] = b;
      }
      terrainGeo.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));

      const terrainMat = new THREE.MeshLambertMaterial({
        vertexColors: true,
      });
      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      terrain.rotation.x = -Math.PI / 2;
      terrain.receiveShadow = true;
      scene.add(terrain);

      /* ── Flowers / Particles ── */
      const FLOWER_COUNT = 6000;
      const fGeo = new THREE.BufferGeometry();
      const fPos = new Float32Array(FLOWER_COUNT * 3);
      const fCol = new Float32Array(FLOWER_COUNT * 3);
      const fSiz = new Float32Array(FLOWER_COUNT);
      const fOff = new Float32Array(FLOWER_COUNT); // wave phase offsets
      const fOrigX = new Float32Array(FLOWER_COUNT);
      const fOrigY = new Float32Array(FLOWER_COUNT);
      const fOrigZ = new Float32Array(FLOWER_COUNT);

      const flowerPalette = [
        [1.0, 0.42, 0.61],  // hot pink
        [1.0, 0.70, 0.28],  // golden orange
        [1.0, 0.30, 0.30],  // coral red
        [1.0, 1.0, 0.35],   // bright yellow
        [1.0, 1.0, 1.0],    // white
        [0.75, 0.40, 1.0],  // lavender
        [0.40, 0.88, 1.0],  // sky blue
        [1.0, 0.60, 0.80],  // light pink
        [0.55, 1.0, 0.55],  // mint
        [1.0, 0.82, 0.44],  // pale gold
      ];

      for (let i = 0; i < FLOWER_COUNT; i++) {
        const x = (Math.random() - 0.5) * 160;
        const z = (Math.random() - 0.5) * 160 - 5;
        // Approximate terrain height
        const th =
          Math.sin(x * 0.04) * 8 +
          Math.cos(z * 0.035) * 6 +
          Math.sin(x * 0.09 + z * 0.06) * 3 +
          Math.cos(x * 0.15 - z * 0.12) * 2 - 4;
        const y = th + Math.random() * 1.2 + 0.3;

        fPos[i * 3] = x;
        fPos[i * 3 + 1] = y;
        fPos[i * 3 + 2] = z;
        fOrigX[i] = x;
        fOrigY[i] = y;
        fOrigZ[i] = z;

        const col = flowerPalette[Math.floor(Math.random() * flowerPalette.length)];
        fCol[i * 3] = col[0];
        fCol[i * 3 + 1] = col[1];
        fCol[i * 3 + 2] = col[2];

        fSiz[i] = Math.random() * 3.5 + 1.5;
        fOff[i] = Math.random() * Math.PI * 2;
      }

      fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
      fGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
      fGeo.setAttribute('size', new THREE.BufferAttribute(fSiz, 1));

      const fMat = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const flowers = new THREE.Points(fGeo, fMat);
      scene.add(flowers);

      /* ── Distant Mountains (simple silhouettes) ── */
      const mtGeo = new THREE.PlaneGeometry(300, 80, 60, 1);
      const mtVerts = mtGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < mtVerts.length; i += 3) {
        const x = mtVerts[i];
        if (mtVerts[i + 1] > 30) {
          mtVerts[i + 1] = 0;
        } else {
          const peak = Math.sin(x * 0.04) * 30 + Math.cos(x * 0.07) * 20 + Math.sin(x * 0.015) * 40;
          mtVerts[i + 1] = Math.max(0, peak);
        }
      }
      mtGeo.attributes.position.needsUpdate = true;
      const mtMat = new THREE.MeshBasicMaterial({ color: 0x2d6e4e, transparent: true, opacity: 0.65 });
      const mountains = new THREE.Mesh(mtGeo, mtMat);
      mountains.rotation.x = -Math.PI / 2;
      mountains.position.set(0, 2, -80);
      scene.add(mountains);

      /* ── Mouse tracking ── */
      let targetMouseX = 0, targetMouseY = 0;
      let smoothMouseX = 0, smoothMouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      /* ── Animate ── */
      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth mouse lerp
        smoothMouseX += (targetMouseX - smoothMouseX) * 0.04;
        smoothMouseY += (targetMouseY - smoothMouseY) * 0.04;

        // Wind parameters
        const windSpeed = 1.4 + Math.abs(smoothMouseX) * 1.5;
        const windDirX = smoothMouseX * 1.2;
        const windDirZ = smoothMouseY * 0.4;

        const pos = fGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < FLOWER_COUNT; i++) {
          const phase = fOff[i];
          // Wave sway
          const swayX = Math.sin(t * windSpeed * 0.8 + phase) * 0.5;
          const swayY = Math.abs(Math.sin(t * windSpeed * 0.6 + phase * 1.3)) * 0.25;
          const swayZ = Math.cos(t * windSpeed * 0.5 + phase * 0.7) * 0.3;

          pos[i * 3] = fOrigX[i] + swayX + windDirX * 0.4;
          pos[i * 3 + 1] = fOrigY[i] + swayY;
          pos[i * 3 + 2] = fOrigZ[i] + swayZ + windDirZ * 0.3;
        }
        fGeo.attributes.position.needsUpdate = true;

        // Gentle camera parallax on mouse move
        camera.position.x += (smoothMouseX * 4 - camera.position.x) * 0.02;
        camera.position.y += (12 + smoothMouseY * 3 - camera.position.y) * 0.02;
        camera.lookAt(0, 2, 0);

        renderer.render(scene, camera);
      };
      animate();

      /* ── Resize ── */
      const onResize = () => {
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        if (mount && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        fGeo.dispose();
        fMat.dispose();
        terrainGeo.dispose();
        terrainMat.dispose();
      };
    };

    init().then(fn => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
}
