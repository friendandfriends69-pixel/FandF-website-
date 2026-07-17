/* =========================================================
   Friend&Friends — 3D scenes (Three.js)
   1) Hero scene: a rotating hub of "crates" (products) around
      a wireframe core, with mouse parallax + scroll rotation.
   2) Network scene: a hub-and-node supply network that draws
      itself as the user scrolls through the section.
   ========================================================= */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof THREE === 'undefined') return;

  const COLORS = {
    ink: 0x10192e,
    inkSoft: 0x1b2a47,
    amber: 0xe8a63b,
    amberDark: 0xc6862a,
    teal: 0x2f6f5e,
    paper: 0xf5f2ea
  };

  /* ---------------------------------------------------------
     Shared renderer helper
     --------------------------------------------------------- */
  function makeRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
  }

  /* ===========================================================
     1) HERO SCENE
     =========================================================== */
  function initHero() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 13);

    const renderer = makeRenderer(canvas);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(COLORS.amber, 0.6);
    rim.position.set(-6, -3, -4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    // Central wireframe core (the "hub")
    const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: COLORS.amber, wireframe: true, transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const coreInnerGeo = new THREE.IcosahedronGeometry(1.15, 0);
    const coreInnerMat = new THREE.MeshStandardMaterial({ color: COLORS.inkSoft, metalness: 0.2, roughness: 0.5 });
    const coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
    group.add(coreInner);

    // Orbiting crates (products)
    const crates = [];
    const CRATE_COUNT = 20;
    const crateGeo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
    const edgesGeo = new THREE.EdgesGeometry(crateGeo);

    for (let i = 0; i < CRATE_COUNT; i++) {
      const isAmber = i % 4 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: isAmber ? COLORS.amber : COLORS.inkSoft,
        metalness: 0.15,
        roughness: 0.6
      });
      const crate = new THREE.Mesh(crateGeo, mat);

      const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: isAmber ? 0x8a5f16 : COLORS.amber, transparent: true, opacity: 0.5 }));
      crate.add(edges);

      // distribute on a fibonacci sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / CRATE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 4.4 + (i % 3) * 0.35;
      crate.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      crate.userData.spin = 0.2 + Math.random() * 0.4;
      crate.userData.axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      group.add(crate);
      crates.push(crate);
    }

    // faint starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 220;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.5 }));
    scene.add(stars);

    // mouse parallax
    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      targetRot.y = mouse.x * 0.25;
      targetRot.x = mouse.y * 0.15;
    });

    // scroll-linked rotation for the hero section
    let scrollRot = 0;
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => { scrollRot = self.progress; }
      });
    }

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.elapsedTime;

      if (!prefersReduced) {
        group.rotation.y += dt * 0.09;
        group.rotation.y += (targetRot.y - group.rotation.y) * 0.0; // reserved
        core.rotation.x += dt * 0.05;
        core.rotation.y -= dt * 0.04;
        coreInner.rotation.y += dt * 0.08;
        stars.rotation.y += dt * 0.005;

        crates.forEach((c) => {
          c.rotateOnAxis(c.userData.axis, dt * c.userData.spin);
        });
      }

      // combine base rotation + mouse parallax + scroll rotation
      group.rotation.z = targetRot.x * 0.4 + scrollRot * 1.1;
      group.rotation.x += (targetRot.x - group.rotation.x) * 0.03;
      camera.position.x += ((targetRot.y * 1.4) - camera.position.x) * 0.02;
      camera.position.y += ((-targetRot.x * 1.0) - camera.position.y) * 0.02;
      camera.position.z = 13 - scrollRot * 3.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ===========================================================
     2) NETWORK SCENE (scroll-drawn supply network)
     =========================================================== */
  function initNetwork() {
    const canvas = document.getElementById('network-canvas');
    const section = document.getElementById('network');
    if (!canvas || !section) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 9.5);

    const renderer = makeRenderer(canvas);
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(4, 5, 6);
    scene.add(dl);

    const group = new THREE.Group();
    scene.add(group);

    // Hub
    const hubGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: COLORS.amber, emissive: COLORS.amberDark, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.4 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    group.add(hub);

    const hubGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.12 })
    );
    group.add(hubGlow);

    // Category nodes — six, matching the catalogue
    const NODE_COUNT = 8;
    const nodes = [];
    const nodeGeo = new THREE.OctahedronGeometry(0.32, 0);

    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2;
      const radius = 4.2;
      const y = Math.sin(i * 1.7) * 1.1;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius - 1.5);

      const mat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? COLORS.inkSoft : COLORS.teal, metalness: 0.2, roughness: 0.55 });
      const node = new THREE.Mesh(nodeGeo, mat);
      node.position.copy(pos);
      node.scale.setScalar(0.001);
      group.add(node);

      // line from hub to node — second vertex animates outward on scroll
      const lineGeo = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, 0, 0, 0]);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.55 });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);

      nodes.push({ mesh: node, line, target: pos, threshold: i / NODE_COUNT });
    }

    let progress = 0;
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => { progress = self.progress; }
      });
    }

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (!prefersReduced) {
        group.rotation.y += dt * 0.06 + progress * 0.002;
        hub.rotation.y += dt * 0.3;
      }

      nodes.forEach((n) => {
        // local progress per node: staggered reveal across the scroll range
        const span = 1 / nodes.length;
        const localP = THREE.MathUtils.clamp((progress - n.threshold * 0.7) / (span * 2.2), 0, 1);
        const eased = localP * localP * (3 - 2 * localP); // smoothstep

        const posAttr = n.line.geometry.attributes.position;
        posAttr.setXYZ(1, n.target.x * eased, n.target.y * eased, n.target.z * eased);
        posAttr.needsUpdate = true;

        const s = 0.001 + eased * 1;
        n.mesh.scale.setScalar(s);
        n.mesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), n.target, eased);
        n.mesh.rotation.x += dt * 0.4;
        n.mesh.rotation.y += dt * 0.3;
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  window.addEventListener('DOMContentLoaded', () => {
    initHero();
    initNetwork();
  });
})();
