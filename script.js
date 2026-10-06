/* PHYSIX — Interactive Virtual Physics Lab
   Pure HTML + CSS + JavaScript + Canvas. No external dependencies. */

(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const deg = Math.PI / 180;
  const radToDeg = 180 / Math.PI;
  const fmt = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : '—';
  const fmtSmart = (v) => {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a >= 1000 || (a > 0 && a < 0.01)) return v.toExponential(2);
    return a >= 100 ? v.toFixed(1) : v.toFixed(2);
  };

  const COLORS = {
    bg: '#080c13', grid: '#1b2534', text: '#e7edf7', muted: '#8290a5', accent: '#65d5ff',
    accent2: '#9a7bff', success: '#63e6be', warn: '#ffd166', danger: '#ff7d8e', white: '#ffffff'
  };

  const simulations = {
    projectile: {
      icon: '🏹', tag: 'Kinematics', title: 'Projectile Motion',
      description: 'Launch a projectile and watch its trajectory change with velocity, angle, and gravity.',
      subtitle: '2D motion under constant gravitational acceleration',
      defaults: { u: 120, angle: 45, g: 9.81 },
      controls: [
        { key: 'u', label: 'Initial velocity', min: 80, max: 200, step: 1, unit: 'm/s' },
        { key: 'angle', label: 'Launch angle', min: 1, max: 89, step: 1, unit: '°' },
        { key: 'g', label: 'Gravity', min: 1, max: 20, step: .01, unit: 'm/s²' }
      ],
      results: ['Time of flight', 'Maximum height', 'Horizontal range', 'Peak time'],
      theory: 'The projectile is modeled as two independent motions: constant horizontal velocity and constant vertical acceleration due to gravity. The visual path is generated directly from the kinematic equations.',
      equations: ['x(t) = u cos(θ) t', 'y(t) = u sin(θ) t − ½gt²', 'T = 2u sin(θ) / g', 'Hmax = u² sin²(θ) / (2g)', 'R = u² sin(2θ) / g'],
      footer: 'Assumption: ideal projectile, no air resistance, launch and landing at the same height.'
    },
    optical: {
      icon: '🔦', tag: 'Optics', title: 'Optical Fiber / TIR',
      description: 'Change refractive indices and incidence angle to visualize total internal reflection inside a fiber.',
      subtitle: 'Ray propagation, critical angle, numerical aperture',
      defaults: { n1: 1.48, n2: 1.46, theta: 85 },
      controls: [
        { key: 'n1', label: 'Core refractive index', min: 1.01, max: 2.4, step: .01, unit: '' },
        { key: 'n2', label: 'Cladding refractive index', min: 1.00, max: 2.39, step: .01, unit: '' },
        { key: 'theta', label: 'Incident angle (from normal)', min: 0, max: 89.9, step: .1, unit: '°' }
      ],
      results: ['Critical angle', 'TIR status', 'Numerical aperture', 'Acceptance angle'],
      theory: 'When light travels from a denser medium (higher refractive index) to a rarer medium, total internal reflection occurs when the incidence angle exceeds the critical angle. The simulation uses a slab representation of the fiber core and cladding.',
      equations: ['Critical angle: θc = sin⁻¹(n₂/n₁)', 'TIR when θ > θc', 'NA = √(n₁² − n₂²)', 'Acceptance angle = sin⁻¹(NA)'],
      footer: 'For the standard step-index model, n₁ > n₂ is required. The ray angle is measured relative to the normal at the boundary.'
    },
    shm: {
      icon: '🌀', tag: 'Oscillations', title: 'Simple Harmonic Motion',
      description: 'Animate a mass-spring system and inspect displacement, velocity, acceleration, and period.',
      subtitle: 'Mass-spring oscillator with live displacement graph',
      defaults: { mass: 1, k: 20, amp: .20 },
      controls: [
        { key: 'mass', label: 'Mass', min: .1, max: 10, step: .1, unit: 'kg' },
        { key: 'k', label: 'Spring constant', min: 1, max: 100, step: 1, unit: 'N/m' },
        { key: 'amp', label: 'Amplitude', min: .03, max: .8, step: .01, unit: 'm' }
      ],
      results: ['Angular frequency', 'Time period', 'Frequency', 'Current displacement'],
      theory: 'For an ideal mass-spring system, the restoring force is proportional to displacement and opposite in direction. The motion is sinusoidal, with angular frequency determined by the spring constant and mass.',
      equations: ['ω = √(k/m)', 'x(t) = A cos(ωt)', 'v(t) = −Aω sin(ωt)', 'a(t) = −ω²x(t)', 'T = 2π/ω'],
      footer: 'Assumption: ideal Hooke-law spring with negligible damping and a small enough oscillation to remain in the linear regime.'
    },
    pendulum: {
      icon: '🔔', tag: 'Mechanics', title: 'Simple Pendulum',
      description: 'Change pendulum length and release angle to explore period and angular motion.',
      subtitle: 'Small-angle pendulum model with animated swing',
      defaults: { length: 1, angle: 20, g: 9.81 },
      controls: [
        { key: 'length', label: 'Length', min: .2, max: 3, step: .05, unit: 'm' },
        { key: 'angle', label: 'Initial angle', min: 1, max: 45, step: 1, unit: '°' },
        { key: 'g', label: 'Gravity', min: 1, max: 20, step: .01, unit: 'm/s²' }
      ],
      results: ['Time period', 'Frequency', 'Angular frequency', 'Current angle'],
      theory: 'For small angular displacements, a simple pendulum behaves approximately as simple harmonic motion. Its period depends on the pendulum length and gravitational acceleration, but not on mass.',
      equations: ['T = 2π√(L/g)', 'f = 1/T', 'ω = √(g/L)', 'θ(t) ≈ θ₀ cos(ωt)'],
      footer: 'Assumption: small-angle approximation for the period and sinusoidal angular motion. The displayed swing is intentionally visual.'
    },
    induction: {
      icon: '🧲', tag: 'Electromagnetism', title: 'Electromagnetic Induction',
      description: 'Move a conceptual magnet relative to a coil and watch the induced EMF change with time.',
      subtitle: 'Faraday’s law visualized with a conceptual magnetic-field model',
      defaults: { turns: 120, speed: 1.6, field: .8 },
      controls: [
        { key: 'turns', label: 'Coil turns', min: 10, max: 500, step: 10, unit: 'turns' },
        { key: 'speed', label: 'Magnet speed', min: .2, max: 5, step: .1, unit: 'm/s' },
        { key: 'field', label: 'Peak magnetic field', min: .1, max: 2, step: .05, unit: 'T' }
      ],
      results: ['Instantaneous EMF', 'Magnetic flux', 'Magnetic field', 'Motion state'],
      theory: 'Faraday’s law states that a changing magnetic flux through a coil induces an electromotive force. Here the animation uses a smooth conceptual field profile around the coil, then numerically differentiates flux with respect to time to obtain the induced EMF.',
      equations: ['Φ = B A (conceptual model)', 'E = −N dΦ/dt', 'Lenz’s law: induced effect opposes the flux change'],
      footer: 'Educational model: the magnetic-field profile is simplified to make the relationship between motion, flux, and EMF visible. It is not a calibrated solenoid/magnet field solver.'
    },
    doppler: {
      icon: '🔊', tag: 'Waves', title: 'Doppler Effect',
      description: 'Move the source and observer and see wavefront spacing change while observed frequency updates.',
      subtitle: 'Wavefront propagation around a moving sound source',
      defaults: { frequency: 500, sourceV: 20, observerV: 0, soundV: 343 },
      controls: [
        { key: 'frequency', label: 'Source frequency', min: 100, max: 2000, step: 10, unit: 'Hz' },
        { key: 'sourceV', label: 'Source velocity toward observer', min: 0, max: 120, step: 1, unit: 'm/s' },
        { key: 'observerV', label: 'Observer velocity toward source', min: -80, max: 80, step: 1, unit: 'm/s' },
        { key: 'soundV', label: 'Speed of sound', min: 250, max: 400, step: 1, unit: 'm/s' }
      ],
      results: ['Observed frequency', 'Source period', 'Wavelength', 'Motion condition'],
      theory: 'The Doppler effect is the apparent frequency shift caused by relative motion between a wave source and an observer. For a source moving toward a stationary observer, the emitted wavefronts are compressed in front of the source.',
      equations: ['General: f′ = f (v + vₒ)/(v − vₛ)', 'For observer at rest: f′ = fv/(v − vₛ)', 'λ = v/f'],
      footer: 'Sign convention used here: vₛ > 0 means the source moves toward the observer; vₒ > 0 means the observer moves toward the source. Keep |vₛ| < v.'
    }
  };

  const app = {
    current: null,
    params: {},
    running: false,
    animationId: null,
    t: 0,
    history: [],
    lastFrame: performance.now(),
    canvas: $('#sceneCanvas'),
    graph: $('#graphCanvas'),
    renderToken: 0
  };

  function showView(name) {
    $('#homeView').classList.toggle('hidden', name !== 'home');
    $('#simulatorView').classList.toggle('hidden', name !== 'simulator');
    $('#aboutView').classList.toggle('hidden', name !== 'about');
    $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.nav === (name === 'simulator' ? 'simulators' : name)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    stopSimulation();
    app.current = null;
    showView('home');
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  function renderCards() {
    const wrap = $('#simulatorCards');
    wrap.innerHTML = Object.entries(simulations).map(([key, sim]) => `
      <article class="sim-card" data-sim="${key}" tabindex="0" role="button" aria-label="Open ${sim.title}">
        <div class="sim-icon">${sim.icon}</div>
        <h3>${sim.title}</h3>
        <p>${sim.description}</p>
        <div class="sim-card-footer">
          <div class="sim-card-tag">${sim.tag}</div>
          <div class="sim-card-arrow">→</div>
        </div>
      </article>
    `).join('');
  }

  function renderControls(sim) {
    const container = $('#controlsContainer');
    container.innerHTML = sim.controls.map((c) => `
      <div class="control-group">
        <div class="control-label">
          <span>${c.label}</span>
          <span id="value-${c.key}" class="value-pill"></span>
        </div>
        <input class="sim-range" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${sim.defaults[c.key]}" data-key="${c.key}" aria-label="${c.label}" />
        <div style="display:flex;justify-content:space-between;margin-top:5px;color:var(--muted);font-size:10px;">
          <span>${c.min}${c.unit}</span><span>${c.max}${c.unit}</span>
        </div>
      </div>
    `).join('');
    $$('.sim-range', container).forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        app.params[key] = Number(input.value);
        updateControlLabels(sim);
        validateParams();
        resetSimulation(false);
        drawCurrent();
      });
    });
    updateControlLabels(sim);
  }

  function updateControlLabels(sim) {
    sim.controls.forEach(c => {
      const el = $(`#value-${c.key}`);
      if (!el) return;
      const v = app.params[c.key];
      const d = c.step < .1 ? 2 : (Number.isInteger(c.step) ? 0 : 1);
      el.textContent = `${fmt(v, d)}${c.unit ? ` ${c.unit}` : ''}`;
    });
  }

  function updateStartButtonLabel() {
    const btn = $('#startButton');
    if (!btn) return;
    btn.textContent = '▶ Start simulation';
  }

  function validateParams() {
    let message = '';
    if (app.current === 'optical') {
      if (!(app.params.n1 > app.params.n2)) message = 'For a standard fiber, core index n₁ must be greater than cladding index n₂.';
      else if (app.params.n2 / app.params.n1 > 1) message = 'The refractive-index ratio is invalid.';
    }
    if (app.current === 'doppler' && app.params.sourceV >= app.params.soundV) {
      message = 'Source velocity must remain below the speed of sound in this model.';
    }
    $('#validationMessage').textContent = message;
    $('#startButton').disabled = Boolean(message);
    return !message;
  }

  function resultsTemplate(items) {
    return items.map((label, i) => `
      <div class="result-card">
        <div class="result-label">${label}</div>
        <div id="result-${i}" class="result-value">—</div>
        <div id="result-unit-${i}" class="result-unit"></div>
      </div>
    `).join('');
  }

  function openSimulator(key, updateHash = true) {
    const sim = simulations[key];
    if (!sim) return;

    stopSimulation();
    const token = ++app.renderToken;
    app.current = key;
    app.params = structuredClone(sim.defaults);
    app.t = 0;
    app.history = [];

    $('#simEyebrow').textContent = `${sim.tag} • PHYSICS SIMULATOR`;
    $('#simTitle').textContent = `${sim.icon} ${sim.title}`;
    $('#canvasSubtitle').textContent = sim.subtitle;
    $('#resultsGrid').innerHTML = resultsTemplate(sim.results);
    $('#graphTitle').textContent = graphTitleFor(key);
    $('#graphLegend').innerHTML = graphLegendFor(key);
    $('#theoryTitle').textContent = `${sim.title}: model and equations`;
    $('#theoryBody').textContent = sim.theory;
    $('#equationBlock').innerHTML = sim.equations.map(e => `<div>${e}</div>`).join('');
    $('#theoryFooter').textContent = sim.footer;
    renderControls(sim);
    updateStartButtonLabel();
    validateParams();

    const selector = $('#simulatorSelect');
    if (selector) selector.value = key;

    showView('simulator');
    $('#simStatus').innerHTML = '<span class="status-dot"></span> Ready';
    $('#pauseButton').disabled = true;

    // The simulator view may have just changed from hidden to visible. Wait for
    // the browser to complete layout before measuring the canvases and drawing.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== app.renderToken || app.current !== key) return;
      prepareCanvases();
      drawCurrent();
    }));

    if (updateHash && window.location.hash !== `#${key}`) {
      history.pushState(null, '', `#${key}`);
    }
  }

  function graphTitleFor(key) {
    return ({
      projectile: 'Height vs. horizontal distance', optical: 'Ray height / propagation view', shm: 'Displacement vs. time',
      pendulum: 'Angular displacement vs. time', induction: 'Induced EMF vs. time', doppler: 'Wavefront spacing over time'
    })[key];
  }
  function graphLegendFor(key) {
    const labels = {
      projectile: [['Height', COLORS.accent]], shm: [['Displacement', COLORS.accent]], pendulum: [['Angle', COLORS.accent2]],
      induction: [['EMF', COLORS.warn]], doppler: [['Wavefronts', COLORS.accent]], optical: [['Ray', COLORS.accent]]
    };
    return (labels[key] || []).map(([name, color]) => `<span class="legend-item"><span class="legend-dot" style="background:${color}"></span>${name}</span>`).join('');
  }

  function startSimulation() {
    if (!validateParams()) return;
    app.running = true;
    app.lastFrame = performance.now();
    $('#startButton').disabled = true;
    $('#pauseButton').disabled = false;
    $('#simStatus').innerHTML = '<span class="status-dot"></span> Running';
    if (!app.animationId) app.animationId = requestAnimationFrame(frame);
  }

  function pauseSimulation() {
    app.running = false;
    $('#startButton').disabled = false;
    $('#pauseButton').disabled = true;
    updateStartButtonLabel();
    $('#simStatus').innerHTML = '<span class="status-dot"></span> Paused';
  }

  function stopSimulation() {
    app.running = false;
    if (app.animationId) cancelAnimationFrame(app.animationId);
    app.animationId = null;
  }

  function resetSimulation(autoStart = false) {
    const sim = simulations[app.current];
    if (!sim) return;
    stopSimulation();
    app.t = 0;
    app.history = [];
    $('#simStatus').innerHTML = '<span class="status-dot"></span> Ready';
    $('#startButton').disabled = false;
    $('#pauseButton').disabled = true;
    updateStartButtonLabel();
    updateControlLabels(sim);
    if (autoStart) startSimulation();
  }

  function frame(now) {
    if (!app.current) return;
    const dt = clamp((now - app.lastFrame) / 1000, 0, 0.05);
    app.lastFrame = now;
    if (app.running) {
      const speed = app.current === 'doppler' ? 0.8 : 1;
      app.t += dt * speed;
      updateHistory();
      drawCurrent();
    }
    app.animationId = requestAnimationFrame(frame);
  }

  function setResult(i, value, unit = '') {
    const v = $(`#result-${i}`); const u = $(`#result-unit-${i}`);
    if (v) v.textContent = value; if (u) u.textContent = unit;
  }

  function updateHistory() {
    const key = app.current;
    let y = 0;
    if (key === 'projectile') {
      const p = projectileState(app.t); y = p.y;
      app.history.push({ x: p.x, y });
    } else if (key === 'shm') {
      const p = shmState(app.t); y = p.x; app.history.push({ x: app.t, y });
    } else if (key === 'pendulum') {
      const p = pendulumState(app.t); y = p.theta; app.history.push({ x: app.t, y });
    } else if (key === 'induction') {
      const p = inductionState(app.t); y = p.emf; app.history.push({ x: app.t, y });
    } else if (key === 'optical') {
      const p = opticalState(); app.history.push({ x: p.pathDistance, y: p.currentY });
    } else if (key === 'doppler') {
      app.history.push({ x: app.t, y: dopplerState().wavelengthObserved });
    }
    if (app.history.length > 320) app.history.shift();
  }

  // ---------- Simulation models ----------

  function projectileState(t) {
    const { u, angle, g } = app.params; const th = angle * deg;
    const T = 2 * u * Math.sin(th) / g;
    const tt = Math.min(t, T);
    const vx = u * Math.cos(th); const vy = u * Math.sin(th) - g * tt;
    const x = vx * tt; const y = Math.max(0, u * Math.sin(th) * tt - 0.5 * g * tt * tt);
    const H = u*u*Math.sin(th)**2/(2*g); const R = u*u*Math.sin(2*th)/g;
    return { T, H, R, peakTime: T/2, t: tt, x, y, vx, vy, v: Math.hypot(vx, vy) };
  }

  function opticalState() {
    const { n1, n2, theta } = app.params;
    const valid = n1 > n2;
    const ratio = valid ? clamp(n2 / n1, 0, 1) : 1;
    const critical = Math.asin(ratio) * radToDeg;
    const tir = valid && theta > critical;
    const NA = valid ? Math.sqrt(Math.max(0, n1*n1 - n2*n2)) : NaN;
    const acc = Number.isFinite(NA) ? (NA <= 1 ? Math.asin(clamp(NA,0,1))*radToDeg : 90) : NaN;
    const progress = (app.t * 0.16) % 1;
    const top = .22, bottom = .78, mid = .5;

    // The physics uses theta measured from the normal. For a highly realistic
    // step-index fiber (n1 ≈ n2), that angle is close to 90°, so a literal
    // canvas drawing would show very few bounces. We therefore use a clearly
    // labeled schematic display angle while keeping the TIR decision exact.
    const visualAngleDeg = tir
      ? clamp(8 + ((theta - critical) / Math.max(0.1, 90 - critical)) * 20, 8, 28)
      : clamp(14 + (theta / 90) * 12, 10, 26);
    const visualAngle = visualAngleDeg * deg;
    const direction = Math.tan(visualAngle);
    const bounceSpan = (bottom - top) / direction;
    const totalSpan = 1;
    const cycleWidth = clamp(bounceSpan * 1.05, 0.14, 0.42);
    const phase = progress / cycleWidth;
    const cycleIndex = Math.floor(phase);
    const cycleFrac = phase - cycleIndex;
    const fromTop = cycleIndex % 2 === 0;
    const currentY = tir
      ? (fromTop ? top + cycleFrac * (bottom - top) : bottom - cycleFrac * (bottom - top))
      : mid - progress * .25;

    return {
      valid, critical, tir, NA, acc, progress,
      top, bottom, mid, thetaR: theta * deg,
      visualAngleDeg, visualAngle, cycleWidth, cycleIndex, cycleFrac,
      currentY, pathDistance: progress
    };
  }

  function shmState(t) {
    const { mass, k, amp } = app.params; const omega = Math.sqrt(k/mass); const x = amp*Math.cos(omega*t);
    const v = -amp*omega*Math.sin(omega*t); const a = -omega*omega*x; const T=2*Math.PI/omega; const f=1/T;
    return { omega, x, v, a, T, f };
  }

  function pendulumState(t) {
    const { length, angle, g } = app.params; const omega = Math.sqrt(g/length); const theta0=angle*deg;
    const theta=theta0*Math.cos(omega*t); const T=2*Math.PI/omega; const f=1/T;
    return { omega, theta, thetaDeg: theta*radToDeg, T, f, theta0 };
  }

  function inductionState(t) {
    const { turns, speed, field } = app.params;
    // Conceptual magnet-to-coil field profile; distance oscillates smoothly.
    const area = 0.008; const x0 = 0.025;
    const x = 0.09*Math.sin(speed*t*0.9);
    const dxdt = 0.09*speed*0.9*Math.cos(speed*t*0.9);
    const B = field / (1 + (x/x0)**2);
    const dBdx = field * (-2*x/(x0*x0)) / (1+(x/x0)**2)**2;
    const dBdt = dBdx*dxdt;
    const flux = B*area;
    const emf = -turns*dBdt*0.28;
    return { x, dxdt, B, flux, emf, area };
  }

  function dopplerState() {
    const { frequency:f, sourceV:vs, observerV:vo, soundV:v } = app.params;
    const sourceToward = clamp(vs, 0, v-1);
    const observed = f*(v+vo)/(v-sourceToward);
    const wavelength = v/f;
    const frontSpacing = (v-sourceToward)/f;
    const backSpacing = (v+sourceToward)/f;
    return { observed, wavelength, frontSpacing, backSpacing };
  }

  // ---------- Drawing helpers ----------

  function prepareCanvases() {
    // Keep a stable backing size and let CSS handle visual scaling. This avoids
    // repeated resizing/clearing of the canvas when switching simulators.
    const scene = app.canvas;
    const graph = app.graph;
    [scene, graph].forEach((canvas) => {
      if (!canvas) return;
      if (canvas === scene) {
        canvas.width = 1200;
        canvas.height = 620;
      } else {
        canvas.width = 1200;
        canvas.height = 420;
      }
      canvas.style.display = 'block';
    });
  }

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(320, rect.width || canvas.clientWidth || 1000);
    const fallbackH = Number(canvas.getAttribute('data-css-height')) || (canvas === app.graph ? 420 : 620);
    const h = Math.max(220, rect.height || (w * (canvas.height / canvas.width)) || fallbackH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    // Draw in CSS pixels; the fixed backing size above keeps the context stable
    // while the browser scales it for high-DPI and different window sizes.
    const scaleX = canvas.width / w;
    const scaleY = canvas.height / h;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    return { ctx, w, h };
  }

  function clearCanvas(ctx,w,h) {
    ctx.fillStyle=COLORS.bg; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=COLORS.grid; ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  }

  function text(ctx, s, x, y, size=12, color=COLORS.text, align='left', weight='500') {
    ctx.fillStyle=color; ctx.font=`${weight} ${size}px Inter, system-ui, sans-serif`; ctx.textAlign=align; ctx.textBaseline='middle'; ctx.fillText(s,x,y);
  }

  function drawCurrent() {
    if (!app.current) return;
    try {
      const {ctx,w,h}=fitCanvas(app.canvas);
      clearCanvas(ctx,w,h);
      switch(app.current){
        case 'projectile': drawProjectile(ctx,w,h); break;
        case 'optical': drawOptical(ctx,w,h); break;
        case 'shm': drawSHM(ctx,w,h); break;
        case 'pendulum': drawPendulum(ctx,w,h); break;
        case 'induction': drawInduction(ctx,w,h); break;
        case 'doppler': drawDoppler(ctx,w,h); break;
      }
      drawGraph();
    } catch (err) {
      console.error('PHYSIX render error:', err);
      const canvas = app.canvas;
      const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      if (ctx) {
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        text(ctx, 'Simulation renderer encountered an error.', 40, 60, 18, COLORS.danger, 'left', '700');
        text(ctx, 'Reset the simulator and try again.', 40, 92, 13, COLORS.muted);
      }
      showToast('Renderer recovered — reset the simulator if needed.');
    }
  }

  function drawLauncher(ctx, x, groundY, launchAngleDeg) {
    const angle = clamp(launchAngleDeg, 1, 89) * deg;
    const baseY = groundY - 10;
    const baseX = x;
    const barrelLength = 86;
    const muzzleX = baseX + barrelLength * Math.cos(angle);
    const muzzleY = baseY - barrelLength * Math.sin(angle);

    // Simple physics launcher: no character or external image required.
    ctx.fillStyle = '#374151';
    ctx.fillRect(baseX - 34, groundY - 22, 68, 22);
    ctx.fillStyle = '#5b6778';
    ctx.fillRect(baseX - 12, groundY - 52, 24, 30);

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(-angle);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, -9, barrelLength, 18);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(barrelLength - 14, -11, 18, 22);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,209,102,.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 2);
    ctx.lineTo(baseX + 98 * Math.cos(angle), baseY - 98 * Math.sin(angle));
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, `Launch angle = ${fmt(launchAngleDeg,0)}°`, baseX + 10, baseY - 78, 11, COLORS.warn, 'left', '800');

    return { muzzleX, muzzleY };
  }

  function drawStone(ctx, x, y, held=false) {
    ctx.fillStyle = '#a8b0bc'; ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#707988'; ctx.beginPath(); ctx.arc(x-3,y-3,3,0,Math.PI*2); ctx.fill();
    if (!held) { ctx.strokeStyle='rgba(168,176,188,.4)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.stroke(); }
  }

  function drawProjectile(ctx,w,h) {
    const p = projectileState(Math.max(0, app.t));
    const pad = {l:70,r:35,t:34,b:92};
    const groundY = h - 92;

    const launcher = drawLauncher(ctx, 105, groundY, app.params.angle);
    const launchX = launcher.muzzleX;
    const handY = launcher.muzzleY;
    const availableW = Math.max(240, w-launchX-pad.r);
    const maxHeightPx = Math.min(285, h-170);
    const sx=(x)=>launchX+(x/Math.max(p.R,1))*availableW;
    const sy=(y)=>handY-(y/Math.max(p.H,1))*maxHeightPx;

    // Ground
    ctx.strokeStyle='#4b5b70';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(45,groundY);ctx.lineTo(w-30,groundY);ctx.stroke();
    for(let x=45;x<w-20;x+=55){ctx.strokeStyle='rgba(101,213,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,groundY);ctx.lineTo(x+22,groundY);ctx.stroke();}

    // Trajectory path generated from the same equations used by the numerical results.
    ctx.strokeStyle='rgba(101,213,255,.48)';ctx.lineWidth=3;ctx.beginPath();
    for(let i=0;i<=150;i++){
      const tt=p.T*i/150; const x=p.R*i/150;
      const y=Math.max(0,app.params.u*Math.sin(app.params.angle*deg)*tt-.5*app.params.g*tt*tt);
      if(i===0)ctx.moveTo(sx(x),sy(y)); else ctx.lineTo(sx(x),sy(y));
    }
    ctx.stroke();

    const released = app.t > 0.08;
    const stoneX = released ? sx(p.x) : launchX;
    const stoneY = released ? sy(p.y) : handY;
    drawStone(ctx, stoneX, stoneY, !released);

    // Launch-angle indicator updates immediately when the user changes angle.
    ctx.strokeStyle='rgba(255,209,102,.65)';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();
    ctx.moveTo(launchX,handY);ctx.lineTo(launchX+90*Math.cos(app.params.angle*deg),handY-90*Math.sin(app.params.angle*deg));ctx.stroke();ctx.setLineDash([]);

    ctx.strokeStyle='rgba(255,255,255,.1)';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(sx(p.R),groundY);ctx.lineTo(sx(p.R),sy(0));ctx.stroke();ctx.setLineDash([]);
    text(ctx,`Range = ${fmt(p.R,1)} m`,w-35,groundY+25,11,COLORS.muted,'right','700');
    text(ctx,`t = ${fmt(p.t,2)} s`,w-35,30,12,COLORS.accent,'right','700');
    text(ctx,`x = ${fmt(p.x,2)} m`,20,30,11,COLORS.muted); text(ctx,`y = ${fmt(p.y,2)} m`,20,48,11,COLORS.muted);
    if(!released) text(ctx,'PROJECTILE READY TO LAUNCH',w*.55,groundY-35,13,COLORS.success,'center','800');
    else if(p.t < p.T) text(ctx,'PROJECTILE IN FLIGHT',w*.55,groundY-35,13,COLORS.accent,'center','800');
    else text(ctx,'PROJECTILE HAS LANDED',w*.55,groundY-35,13,COLORS.warn,'center','800');

    setResult(0,fmt(p.T,2),'s'); setResult(1,fmt(p.H,2),'m'); setResult(2,fmt(p.R,2),'m'); setResult(3,fmt(p.peakTime,2),'s');
  }

  function opticalPathSegments(left, right, top, bottom, visualAngle, startY) {
    const slope = Math.max(0.05, Math.tan(visualAngle));
    const segments = [];
    let x = left;
    let y = startY;
    let downward = true;
    const EPS = 0.001;
    let guard = 0;

    while (x < right - EPS && guard++ < 64) {
      const targetY = downward ? bottom : top;
      const dx = Math.abs(targetY - y) / slope;
      const remaining = right - x;
      const step = Math.min(remaining, Math.max(dx, EPS));
      const ratio = dx < EPS ? 1 : step / dx;
      const nx = x + step;
      const ny = y + (targetY - y) * ratio;
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, len: Math.hypot(nx - x, ny - y) });
      x = nx;
      y = ny;
      if (step >= dx - EPS) downward = !downward;
    }
    return segments;
  }

  function pointAlongSegments(segments, progress) {
    if (!segments.length) return null;
    const total = segments.reduce((sum, seg) => sum + seg.len, 0);
    let target = clamp(progress, 0, 1) * total;
    for (const seg of segments) {
      if (target <= seg.len) {
        const q = seg.len > 0 ? target / seg.len : 0;
        return {
          x: seg.x1 + (seg.x2 - seg.x1) * q,
          y: seg.y1 + (seg.y2 - seg.y1) * q
        };
      }
      target -= seg.len;
    }
    const last = segments[segments.length - 1];
    return { x: last.x2, y: last.y2 };
  }

  function drawOptical(ctx,w,h) {
    const s=opticalState();
    const left=55,right=w-55,top=h*.22,bottom=h*.78;
    const fiberH=bottom-top,totalSpan=right-left;
    ctx.fillStyle='rgba(154,123,255,.08)';ctx.fillRect(left,top,right-left,fiberH);
    ctx.strokeStyle='rgba(154,123,255,.45)';ctx.lineWidth=2;ctx.strokeRect(left,top,right-left,fiberH);
    ctx.fillStyle='rgba(101,213,255,.05)';ctx.fillRect(left,top+9,right-left,fiberH-18);
    text(ctx,'CLADDING',left+10,top-16,10,COLORS.muted);
    text(ctx,'CORE',left+10,top+24,10,COLORS.accent);
    text(ctx,'SCHEMATIC RAY PATH — NOT TO SCALE',w*.5,top-16,10,COLORS.muted,'center','700');

    const yMid=(top+bottom)/2;
    const rayColor=s.tir?COLORS.accent:COLORS.danger;
    let marker={x:left,y:yMid};

    ctx.strokeStyle=rayColor;ctx.lineWidth=3;ctx.beginPath();
    if(s.tir){
      // The drawn ray is a real piecewise-reflected path. The moving particle below
      // is positioned on these exact line segments, so it never cuts across them.
      const segments=opticalPathSegments(left,right,top,bottom,s.visualAngle,yMid);
      if(segments.length){
        ctx.moveTo(segments[0].x1,segments[0].y1);
        for(const seg of segments) ctx.lineTo(seg.x2,seg.y2);
        marker=pointAlongSegments(segments,s.progress) || marker;
      }
    } else {
      // Below critical angle the ray leaves the core at the top boundary.
      const escapeAngle=clamp(s.thetaR*.55 + 12, 12, 55);
      const slope=Math.tan(escapeAngle*deg);
      const escapeDx=(yMid-top)/Math.max(slope,.001);
      const nx=Math.min(right,left+escapeDx);
      ctx.moveTo(left,yMid);
      ctx.lineTo(nx,top);
      if(nx<right) ctx.lineTo(right,Math.max(0,top-slope*(right-nx)));
      const q=s.progress;
      marker={x:left+(nx-left)*Math.min(q/.24,1),y:yMid-(yMid-top)*Math.min(q/.24,1)};
      if(q>.24){
        marker.x=nx+(right-nx)*Math.min((q-.24)/.76,1);
        marker.y=top-(top-Math.max(0,top-slope*(right-nx)))*Math.min((q-.24)/.76,1);
      }
    }
    ctx.stroke();

    // Animated light particle follows the exact zig-zag trajectory above.
    ctx.fillStyle=COLORS.white;ctx.beginPath();ctx.arc(marker.x,marker.y,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=s.tir?'rgba(99,230,190,.12)':'rgba(255,125,142,.12)';ctx.beginPath();ctx.arc(marker.x,marker.y,16,0,Math.PI*2);ctx.fill();

    const status=s.tir?'TOTAL INTERNAL REFLECTION':'RAY ESCAPES';
    const statusColor=s.tir?COLORS.success:COLORS.danger;
    ctx.fillStyle=s.tir?'rgba(99,230,190,.1)':'rgba(255,125,142,.1)';ctx.fillRect(w-285,22,250,42);
    text(ctx,status,w-160,44,12,statusColor,'center','800');
    text(ctx,`θ = ${fmt(app.params.theta,1)}° from normal`,25,h-48,11,COLORS.muted);
    text(ctx,`θc = ${fmt(s.critical,2)}°`,w-25,h-48,11,COLORS.muted,'right');
    text(ctx,`Visual ray angle ≈ ${fmt(s.visualAngleDeg,1)}° from fiber axis`,w/2,h-28,10,COLORS.muted,'center');
    setResult(0,fmt(s.critical,2),'°');
    setResult(1,s.tir?'YES':'NO');
    setResult(2,fmt(s.NA,3),'');
    setResult(3,fmt(s.acc,2),'°');
  }

  function drawSHM(ctx,w,h) {
    const p=shmState(app.t); const baseY=h*.55; const wallX=70; const centerX=w*.52; const scale=Math.min(300, w*.32)/(Math.max(app.params.amp,.08)); const massW=72,massH=48;
    ctx.strokeStyle='#6c7890';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(wallX,baseY-85);ctx.lineTo(wallX,baseY+85);ctx.stroke();
    for(let y=baseY-80;y<baseY+80;y+=16){ctx.strokeStyle='rgba(108,120,144,.35)';ctx.beginPath();ctx.moveTo(wallX-10,y);ctx.lineTo(wallX-1,y+8);ctx.stroke();}
    const x = centerX + p.x*scale;
    drawSpring(ctx,wallX,baseY,x-massW/2,11);
    ctx.fillStyle='rgba(101,213,255,.14)';ctx.fillRect(centerX-scale*app.params.amp,baseY-70,scale*app.params.amp*2,140);
    ctx.fillStyle=COLORS.accent;ctx.fillRect(x-massW/2,baseY-massH/2,massW,massH);
    text(ctx,`x = ${fmt(p.x,3)} m`,x,baseY-75,11,COLORS.text,'center','700');
    text(ctx,'equilibrium',centerX,baseY+90,10,COLORS.muted,'center');
    const phase=(p.omega*app.t)%(2*Math.PI); text(ctx,`phase = ${fmt(phase,2)} rad`,w-25,30,11,COLORS.accent,'right');
    setResult(0,fmt(p.omega,2),'rad/s'); setResult(1,fmt(p.T,2),'s'); setResult(2,fmt(p.f,2),'Hz'); setResult(3,fmt(p.x,3),'m');
  }

  function drawSpring(ctx,x1,y,x2,turns){
    const lead=14; const start=x1+lead,end=x2-lead; const usable=Math.max(20,end-start); ctx.strokeStyle=COLORS.accent2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(start,y);
    const n=16; for(let i=0;i<=n;i++){const q=i/n;const xx=start+usable*q;const yy=y+Math.sin(q*Math.PI*turns*2)*10;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.lineTo(x2,y);ctx.stroke();
  }

  function drawPendulum(ctx,w,h) {
    const p=pendulumState(app.t);
    const pivot={x:w*.5,y:78};
    // Make the rendered rod length visibly respond to the user's selected length.
    const lengthNorm=(app.params.length-.2)/(3-.2);
    const L=95 + clamp(lengthNorm,0,1)*275;
    const x=pivot.x+L*Math.sin(p.theta); const y=pivot.y+L*Math.cos(p.theta);
    const groundY=Math.min(h-48,pivot.y+L+70);

    // Support
    ctx.strokeStyle='#4f5d72';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(pivot.x-105,pivot.y);ctx.lineTo(pivot.x+105,pivot.y);ctx.stroke();
    ctx.strokeStyle='rgba(79,93,114,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pivot.x-80,pivot.y);ctx.lineTo(pivot.x-105,pivot.y-28);ctx.moveTo(pivot.x+80,pivot.y);ctx.lineTo(pivot.x+105,pivot.y-28);ctx.stroke();
    // Scale reference: same pivot, current length shown in physical proportion.
    ctx.strokeStyle='rgba(255,255,255,.11)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(pivot.x,pivot.y);ctx.lineTo(pivot.x,groundY-40);ctx.stroke();ctx.setLineDash([]);

    // Swing envelope
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(pivot.x,pivot.y,L,-45*deg,45*deg);ctx.stroke();ctx.setLineDash([]);
    // Rod + bob
    ctx.strokeStyle=COLORS.accent;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(pivot.x,pivot.y);ctx.lineTo(x,y);ctx.stroke();
    ctx.fillStyle=COLORS.accent;ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(101,213,255,.15)';ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#d9f6ff';ctx.beginPath();ctx.arc(x-5,y-6,4,0,Math.PI*2);ctx.fill();

    text(ctx,`θ = ${fmt(p.thetaDeg,2)}°`,x,y-38,12,COLORS.text,'center','700');
    text(ctx,`Physical length L = ${fmt(app.params.length,2)} m`,w-20,h-25,12,COLORS.accent,'right','800');
    text(ctx,'Longer L → visibly longer pendulum → larger period',w*.5,h-25,10,COLORS.muted,'center');
    setResult(0,fmt(p.T,2),'s'); setResult(1,fmt(p.f,2),'Hz'); setResult(2,fmt(p.omega,2),'rad/s'); setResult(3,fmt(p.thetaDeg,2),'°');
  }

  function drawInduction(ctx,w,h) {
    const p=inductionState(app.t); const coilX=w*.55; const coilY=h*.53; const magnetX=coilX+p.x*1100; const magnetY=coilY;
    // coil
    ctx.strokeStyle=COLORS.accent;ctx.lineWidth=3;
    for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(coilX,coilY,45+i*5,88+i*3,0,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#182536';ctx.fillRect(coilX-7,coilY-108,14,216);
    text(ctx,'COIL',coilX,coilY+126,10,COLORS.muted,'center','700');
    // magnet
    ctx.fillStyle='#334156';ctx.fillRect(magnetX-70,magnetY-26,140,52);ctx.fillStyle=COLORS.danger;ctx.fillRect(magnetX-70,magnetY-26,70,52);ctx.fillStyle=COLORS.accent;ctx.fillRect(magnetX,magnetY-26,70,52);
    text(ctx,'N',magnetX-35,magnetY,17,COLORS.white,'center','800'); text(ctx,'S',magnetX+35,magnetY,17,COLORS.white,'center','800');
    ctx.strokeStyle='rgba(255,209,102,.28)';ctx.lineWidth=1.5; for(let r=35;r<155;r+=25){ctx.beginPath();ctx.arc(magnetX,magnetY,r,0,Math.PI*2);ctx.stroke();}
    const emfAbs=Math.abs(p.emf); const bar=clamp(emfAbs/20,0,1);ctx.fillStyle='rgba(255,209,102,.08)';ctx.fillRect(24,h-58,250,18);ctx.fillStyle=COLORS.warn;ctx.fillRect(24,h-58,250*bar,18);text(ctx,`|EMF| visual scale`,24,h-69,10,COLORS.muted);
    text(ctx,`E = ${fmtSmart(p.emf)} V`,w-24,30,13,COLORS.warn,'right','800'); text(ctx,`B = ${fmt(p.B,2)} T`,24,30,11,COLORS.muted);
    setResult(0,fmtSmart(p.emf),'V'); setResult(1,fmt(p.flux,4),'Wb (model)'); setResult(2,fmt(p.B,3),'T'); setResult(3,Math.abs(p.dxdt)>0.02 ? 'Moving' : 'Turning');
  }

  function drawCar(ctx,x,y,bodyColor,label,flip=false){
    ctx.save();
    ctx.translate(x,y);
    if(flip)ctx.scale(-1,1);
    ctx.fillStyle=bodyColor;ctx.beginPath();ctx.roundRect(-42,-18,84,28,8);ctx.fill();
    ctx.fillStyle=bodyColor;ctx.beginPath();ctx.moveTo(-20,-18);ctx.lineTo(-6,-40);ctx.lineTo(22,-40);ctx.lineTo(38,-18);ctx.closePath();ctx.fill();
    ctx.fillStyle='#15202b';ctx.fillRect(-2,-35,20,12);ctx.fillRect(-17,-35,-1,12);
    ctx.fillStyle='#11161d';ctx.beginPath();ctx.arc(-26,12,10,0,Math.PI*2);ctx.arc(26,12,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#94a6bb';ctx.beginPath();ctx.arc(-26,12,4,0,Math.PI*2);ctx.arc(26,12,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
    text(ctx,label,x,y-58,11,COLORS.text,'center','800');
  }

  function drawDoppler(ctx,w,h) {
    const d=dopplerState();
    const centerY=h*.57;
    const leftRoad=90, rightRoad=w-90;
    const observerX=w-150;
    const cycleDuration=6.0;
    const cycleT=app.t%cycleDuration;
    const sourceX=170 + (w*.56-170)*(cycleT/cycleDuration);
    const sourceV=app.params.sourceV;

    // Road and two vehicles
    ctx.strokeStyle='#56637a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(leftRoad,centerY+34);ctx.lineTo(rightRoad,centerY+34);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=2;for(let x=leftRoad;x<rightRoad;x+=55){ctx.beginPath();ctx.moveTo(x,centerY+34);ctx.lineTo(x+28,centerY+34);ctx.stroke();}
    drawCar(ctx,sourceX,centerY,COLORS.accent,'SOURCE →');
    drawCar(ctx,observerX,centerY,COLORS.success,'OBSERVER',true);

    // Animated wavefronts. Emission interval is visual, while the front/back spacing
    // ratio comes from the actual Doppler physics. The spacing is exaggerated to make
    // the effect obvious on screen.
    const emitEvery=.32;
    const waveSpeedPx=170;
    const maxRadius=Math.min(w*.52,h*.48);
    const current=cycleT;
    const maxEmits=Math.min(18,Math.ceil(current/emitEvery)+2);
    for(let k=-1;k<maxEmits;k++){
      const emitTime=k*emitEvery;
      const age=current-emitTime;
      if(age<0)continue;
      const emitFrac=emitTime/cycleDuration;
      const emitX=170+(w*.56-170)*clamp(emitFrac,0,1);
      const r=age*waveSpeedPx;
      if(r<10 || r>maxRadius)continue;
      const alpha=clamp(.58-age/3.8,.08,.58);
      ctx.strokeStyle=`rgba(101,213,255,${alpha})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(emitX,centerY,r,0,Math.PI*2);ctx.stroke();
    }

    // Direction arrows and explanatory labels
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sourceX+50,centerY+65);ctx.lineTo(sourceX+110,centerY+65);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sourceX+110,centerY+65);ctx.lineTo(sourceX+100,centerY+59);ctx.moveTo(sourceX+110,centerY+65);ctx.lineTo(sourceX+100,centerY+71);ctx.stroke();
    text(ctx,sourceV>0?'SOURCE APPROACHING OBSERVER':'SOURCE STATIONARY',w*.5,30,13,COLORS.warn,'center','800');
    text(ctx,`f′ = ${fmtSmart(d.observed)} Hz`,24,30,13,COLORS.accent,'left','800');
    text(ctx,`λ₀ = ${fmt(d.wavelength,2)} m`,24,51,11,COLORS.muted);
    text(ctx,`front spacing ≈ ${fmt(d.frontSpacing,2)} m`,w-24,h-58,11,COLORS.muted,'right');
    text(ctx,`back spacing ≈ ${fmt(d.backSpacing,2)} m`,w-24,h-38,11,COLORS.muted,'right');
    text(ctx,'Wavefront spacing is visually exaggerated for clarity; calculations use the physical Doppler equation.',w*.5,h-18,10,COLORS.muted,'center');

    setResult(0,fmtSmart(d.observed),'Hz'); setResult(1,fmt(1/app.params.frequency,4),'s'); setResult(2,fmt(d.wavelength,2),'m'); setResult(3,app.params.sourceV>0?'Source approaching observer':'Stationary source');
  }

  function drawGraph() {
    const {ctx,w,h}=fitCanvas(app.graph); clearCanvas(ctx,w,h);
    const key=app.current; if(!key)return;
    const pad={l:58,r:22,t:24,b:42};
    ctx.strokeStyle='#48566c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
    let points=[]; let xLabel='Time'; let yLabel='Value';
    if(key==='projectile'){
      const p=projectileState(Math.min(app.t,projectileState(0).T));
      const u=app.params.u, a=app.params.angle*deg,g=app.params.g,T=2*u*Math.sin(a)/g;
      for(let i=0;i<140;i++){const t=T*i/139;const x=u*Math.cos(a)*t;const y=Math.max(0,u*Math.sin(a)*t-.5*g*t*t);points.push({x,y});} xLabel='Horizontal distance (m)';yLabel='Height (m)';
      drawLineGraph(ctx,w,h,points,COLORS.accent, p.x, p.y, 0, p.R, 0, p.H, pad,xLabel,yLabel);
    } else if(key==='shm'){
      const p=shmState(0); const span=Math.max(4,p.T*3); for(let i=0;i<200;i++){const t=span*i/199;points.push({x:t,y:app.params.amp*Math.cos(p.omega*t)});} const currentX=app.t%span,currentY=app.params.amp*Math.cos(p.omega*currentX); drawLineGraph(ctx,w,h,points,COLORS.accent,currentX,currentY,0,span,-app.params.amp,app.params.amp,pad,'Time (s)','Displacement (m)');
    } else if(key==='pendulum'){
      const p=pendulumState(0);const span=Math.max(5,p.T*3);for(let i=0;i<200;i++){const t=span*i/199;points.push({x:t,y:pendulumState(t).thetaDeg});}const cx=app.t%span,cy=pendulumState(cx).thetaDeg;drawLineGraph(ctx,w,h,points,COLORS.accent2,cx,cy,0,span,-app.params.angle,app.params.angle,pad,'Time (s)','Angle (°)');
    } else if(key==='induction'){
      const span=8;for(let i=0;i<220;i++){const t=span*i/219;points.push({x:t,y:inductionState(t).emf});}const cx=app.t%span,cy=inductionState(cx).emf;let ys=points.map(p=>Math.abs(p.y));const ym=Math.max(.1,Math.max(...ys)*1.1);drawLineGraph(ctx,w,h,points,COLORS.warn,cx,cy,0,span,-ym,ym,pad,'Time (s)','Induced EMF (V)');
    } else if(key==='optical'){
      const s=opticalState(); const n=220;
      const amp=.82;
      if(s.tir){
        for(let i=0;i<n;i++){
          const q=i/(n-1);
          const tri=2*Math.abs(2*(q*4-Math.floor(q*4+.5)))-1;
          points.push({x:q,y:tri*amp});
        }
        const q=s.progress; const tri=2*Math.abs(2*(q*4-Math.floor(q*4+.5)))-1;
        drawLineGraph(ctx,w,h,points,COLORS.accent,s.progress,tri*amp,0,1,-1,1,pad,'Normalized propagation','Schematic ray height');
      } else {
        for(let i=0;i<n;i++){const q=i/(n-1);points.push({x:q,y:-.78*q});}
        drawLineGraph(ctx,w,h,points,COLORS.danger,s.progress,-.78*s.progress,0,1,-1,1,pad,'Normalized propagation','Ray height');
      }
    } else if(key==='doppler'){
      const d=dopplerState();const span=6;for(let i=0;i<180;i++){const t=span*i/179;points.push({x:t,y:d.wavelength});}drawLineGraph(ctx,w,h,points,COLORS.accent,app.t%span,d.wavelength,0,span,0,Math.max(.1,d.wavelength*1.5),pad,'Time (s)','Wavelength (m)');
    }
  }

  function drawLineGraph(ctx,w,h,points,color,cx,cy,xmin,xmax,ymin,ymax,pad,xLabel,yLabel){
    const sx=x=>pad.l+(x-xmin)/(xmax-xmin)*(w-pad.l-pad.r);const sy=y=>h-pad.b-(y-ymin)/(ymax-ymin)*(h-pad.t-pad.b);
    ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;for(let i=0;i<=5;i++){const xx=pad.l+(w-pad.l-pad.r)*i/5;ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();const yy=pad.t+(h-pad.t-pad.b)*i/5;ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();}
    ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();points.forEach((p,i)=>{const xx=sx(p.x),yy=sy(p.y);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.stroke();
    const safeX=clamp(cx,xmin,xmax),safeY=clamp(cy,ymin,ymax);ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx(safeX),sy(safeY),5.5,0,Math.PI*2);ctx.fill();
    text(ctx,xLabel,(pad.l+w-pad.r)/2,h-17,10,COLORS.muted,'center');
    ctx.save();ctx.translate(15,(pad.t+h-pad.b)/2);ctx.rotate(-Math.PI/2);text(ctx,yLabel,0,0,10,COLORS.muted,'center');ctx.restore();
  }

  function shareCurrent() {
    if (!app.current) return;
    const url = `${window.location.origin}${window.location.pathname}#${app.current}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => showToast('Simulator link copied.')).catch(() => showToast(url));
    } else {
      showToast(url);
    }
  }

  function showToast(message) {
    const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2800);
  }

  // ---------- Routing ----------
  function routeFromHash() {
    const key=window.location.hash.slice(1);
    if (simulations[key]) openSimulator(key,false); else showView('home');
  }

  // ---------- Events ----------
  renderCards();
  $$('[data-go-simulators]').forEach(b=>b.addEventListener('click',()=>{showView('home');document.querySelector('.section-heading').scrollIntoView({behavior:'smooth'});}));
  $$('[data-open-about]').forEach(b=>b.addEventListener('click',()=>{showView('about');}));
  $$('[data-nav="home"]').forEach(b=>b.addEventListener('click',goHome));
  $$('[data-nav="simulators"]').forEach(b=>b.addEventListener('click',()=>{
    stopSimulation();
    app.current = null;
    showView('home');
    history.replaceState(null, '', window.location.pathname + window.location.search);
    requestAnimationFrame(()=>$('.section-heading')?.scrollIntoView({behavior:'smooth'}));
  }));
  $$('[data-nav="about"]').forEach(b=>b.addEventListener('click',()=>showView('about')));
  $$('[data-go-home]').forEach(b=>{b.addEventListener('click',goHome);b.addEventListener('keydown',e=>{if(e.key==='Enter')goHome();});});
  $('#backButton').addEventListener('click',goHome);
  $('#startButton').addEventListener('click',startSimulation);
  $('#pauseButton').addEventListener('click',pauseSimulation);
  $('#resetButton').addEventListener('click',()=>resetSimulation(false));
  $('#shareButton').addEventListener('click',shareCurrent);
  $('#simulatorSelect').addEventListener('change', (e) => openSimulator(e.target.value));
  $$('.sim-card').forEach(card=>{card.addEventListener('click',()=>openSimulator(card.dataset.sim));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSimulator(card.dataset.sim);}});});
  window.addEventListener('popstate',routeFromHash);
  window.addEventListener('hashchange',routeFromHash);
  window.addEventListener('resize',()=>{if(app.current){prepareCanvases();drawCurrent();}});

  prepareCanvases();
  routeFromHash();
})();
