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
    },
    viwire: {
      icon: '⚡', tag: 'Electricity', title: 'V-I Characteristic of a Current-Carrying Wire',
      description: 'Vary the applied voltage and resistance to study the current–voltage relationship of an ohmic wire.',
      subtitle: 'Virtual circuit with live V-I characteristic graph',
      defaults: { voltage: 10, resistance: 20 },
      controls: [
        { key: 'voltage', label: 'Applied voltage', min: 0.5, max: 20, step: 0.5, unit: 'V' },
        { key: 'resistance', label: 'Wire resistance', min: 1, max: 100, step: 1, unit: 'Ω' }
      ],
      results: ['Current', 'Resistance', 'Power', 'Conductance'],
      theory: 'For an ohmic current-carrying wire under constant physical conditions, the potential difference is proportional to current. The slope of the V-I graph represents the resistance, while electrical power is P = VI.',
      equations: ['V = IR', 'I = V/R', 'P = VI = I²R = V²/R', 'Slope of V-I graph = R'],
      footer: 'Model assumption: the wire remains ohmic and its temperature is effectively constant during the measurement.'
    },
    prism: {
      icon: '🔺', tag: 'Optics', title: 'Prism / Minimum Deviation',
      description: 'Send a ray through a triangular prism and observe refraction, deviation, and the minimum-deviation condition.',
      subtitle: 'Ray tracing through a prism with deviation analysis',
      defaults: { prismAngle: 60, refractiveIndex: 1.50, incidence: 45 },
      controls: [
        { key: 'prismAngle', label: 'Prism angle A', min: 20, max: 80, step: 1, unit: '°' },
        { key: 'refractiveIndex', label: 'Refractive index n', min: 1.10, max: 2.00, step: 0.01, unit: '' },
        { key: 'incidence', label: 'Angle of incidence i', min: 5, max: 89, step: 1, unit: '°' }
      ],
      results: ['Deviation angle', 'Critical angle', 'Minimum deviation', 'Refracted angle r₁'],
      theory: 'A light ray entering a prism refracts at the first face and again at the second face. The angular deviation δ depends on the prism angle and the incidence angle. At minimum deviation the optical path is symmetric, so i = e and r₁ = r₂.',
      equations: ['r₁ = sin⁻¹(sin i / n)', 'r₂ = A − r₁', 'e = sin⁻¹(n sin r₂)', 'δ = i + e − A', 'n = sin[(A + δₘ)/2] / sin(A/2) at minimum deviation'],
      footer: 'The ray diagram is schematic. The model uses Snell’s law and marks total internal reflection if the second-face exit condition is not satisfied.'
    },
    ydse: {
      icon: '🌈', tag: 'Wave Optics', title: "Young's Double-Slit Experiment",
      description: 'Change wavelength, slit separation, slit width, and screen distance to watch interference fringes form inside a diffraction envelope.',
      subtitle: 'Two coherent slits with visible interference + diffraction pattern',
      defaults: { wavelength: 600, slitSeparation: 0.50, screenDistance: 2.0, slitWidth: 0.08 },
      controls: [
        { key: 'wavelength', label: 'Wavelength', min: 350, max: 750, step: 10, unit: 'nm' },
        { key: 'slitSeparation', label: 'Slit separation', min: 0.10, max: 1.00, step: 0.01, unit: 'mm' },
        { key: 'screenDistance', label: 'Screen distance', min: 0.5, max: 5, step: 0.1, unit: 'm' },
        { key: 'slitWidth', label: 'Individual slit width', min: 0.02, max: 0.20, step: 0.01, unit: 'mm' }
      ],
      results: ['Fringe width β', 'Central diffraction width', 'Slit separation', 'Wavelength'],
      theory: 'Young’s double-slit experiment combines two coherent-source interference with single-slit diffraction. Fine bright and dark fringes appear inside a broader diffraction envelope produced by the finite width of each slit.',
      equations: ['β = λD/d', 'Diffraction envelope = [sin(πay/λD)/(πay/λD)]²', 'I(y) ∝ sinc²(πay/λD) cos²(πdy/λD)', 'Central diffraction width ≈ 2λD/a'],
      footer: 'The visual contrast is enhanced so the fine interference fringes and broad diffraction envelope remain obvious on a laptop display.'
    },
    thermo: {
      icon: '🌡️', tag: 'Thermodynamics', title: 'Thermodynamic Process: Isothermal vs Adiabatic',
      description: 'Compare how an ideal gas pressure changes during controlled expansion or compression on a P-V diagram.',
      subtitle: 'Interactive piston-cylinder model with live P-V curve',
      defaults: { process: 'isothermal', moles: 1, temperature: 300, gamma: 1.40, volume2: 0.040 },
      controls: [
        { key: 'process', type: 'select', label: 'Process', options: [['isothermal','Isothermal'],['adiabatic','Adiabatic']] },
        { key: 'moles', label: 'Amount of gas', min: 0.5, max: 2, step: 0.1, unit: 'mol' },
        { key: 'temperature', label: 'Initial temperature', min: 200, max: 600, step: 10, unit: 'K' },
        { key: 'gamma', label: 'Heat-capacity ratio γ', min: 1.20, max: 1.67, step: 0.01, unit: '' },
        { key: 'volume2', label: 'Final volume', min: 0.010, max: 0.080, step: 0.001, unit: 'm³' }
      ],
      results: ['Final pressure', 'Work done', 'Heat transfer Q', 'Final temperature'],
      theory: 'An isothermal process keeps temperature constant, so an ideal gas follows PV = constant. In an adiabatic process there is no heat exchange, so PV^γ = constant. The P-V curves show why the adiabatic pressure falls faster during expansion.',
      equations: ['Isothermal: PV = constant', 'Adiabatic: PV^γ = constant', 'Isothermal work: W = nRT ln(V₂/V₁)', 'Adiabatic work: W = (P₁V₁ − P₂V₂)/(γ − 1)', 'First law: ΔQ = ΔU + W'],
      footer: 'Ideal-gas model. Work is positive for expansion. The piston animation is schematic and intended to visualize the thermodynamic state change.'
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
    container.innerHTML = sim.controls.map((c) => {
      if (c.type === 'select') {
        return `
          <div class="control-group">
            <div class="control-label"><span>${c.label}</span><span id="value-${c.key}" class="value-pill"></span></div>
            <select class="sim-select control-select" data-key="${c.key}" aria-label="${c.label}">
              ${c.options.map(([value,label]) => `<option value="${value}" ${sim.defaults[c.key] === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>`;
      }
      return `
        <div class="control-group">
          <div class="control-label">
            <span>${c.label}</span>
            <span id="value-${c.key}" class="value-pill"></span>
          </div>
          <input class="sim-range" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${sim.defaults[c.key]}" data-key="${c.key}" aria-label="${c.label}" />
          <div style="display:flex;justify-content:space-between;margin-top:5px;color:var(--muted);font-size:10px;">
            <span>${c.min}${c.unit}</span><span>${c.max}${c.unit}</span>
          </div>
        </div>`;
    }).join('');

    $$('.sim-range, .control-select', container).forEach(input => {
      const handler = () => {
        const key = input.dataset.key;
        const control = sim.controls.find(c => c.key === key);
        app.params[key] = control?.type === 'select' ? input.value : Number(input.value);
        updateControlLabels(sim);
        validateParams();
        resetSimulation(false);
        drawCurrent();
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });
    updateControlLabels(sim);
  }
  function updateControlLabels(sim) {
    sim.controls.forEach(c => {
      const el = $(`#value-${c.key}`);
      if (!el) return;
      const v = app.params[c.key];
      if (c.type === 'select') {
        const option = c.options.find(([value]) => value === v);
        el.textContent = option ? option[1] : String(v);
        return;
      }
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
    if (app.current === 'prism' && app.params.refractiveIndex <= 1) {
      message = 'Prism refractive index should be greater than 1.';
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
      pendulum: 'Angular displacement vs. time', induction: 'Induced EMF vs. time', doppler: 'Observed frequency vs. source velocity',
      viwire: 'Voltage vs. current', prism: 'Deviation vs. incidence angle', ydse: 'Interference intensity across screen', thermo: 'Pressure vs. volume'
    })[key];
  }
  function graphLegendFor(key) {
    const labels = {
      projectile: [['Height', COLORS.accent]], shm: [['Displacement', COLORS.accent]], pendulum: [['Angle', COLORS.accent2]],
      induction: [['EMF', COLORS.warn]], doppler: [['Observed frequency', COLORS.accent]], optical: [['Ray', COLORS.accent]],
      viwire: [['V-I', COLORS.accent]], prism: [['Deviation', COLORS.accent2]], ydse: [['Intensity', COLORS.warn]], thermo: [['P-V', COLORS.success]]
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
      app.history.push({ x: app.t, y: dopplerState().wavelength });
    } else if (key === 'viwire') {
      const p = viWireState(); app.history.push({ x: p.current, y: p.V });
    } else if (key === 'prism') {
      const p = prismState(); if (Number.isFinite(p.deviation)) app.history.push({ x: p.incidence, y: p.deviation });
    } else if (key === 'ydse') {
      app.history.push({ x: app.t, y: ydseIntensity(0, app.params.wavelength, app.params.slitSeparation, app.params.screenDistance, app.params.slitWidth) });
    } else if (key === 'thermo') {
      const p = thermoState(app.t); app.history.push({ x: p.volume, y: p.pressure });
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

  function viWireState() {
    const V = app.params.voltage;
    const R = Math.max(0.1, app.params.resistance);
    const I = V / R;
    return { V, R, I, P: V * I, G: 1 / R, current: I };
  }

  function prismStateRaw(iDeg, ADeg, n) {
    const A = ADeg * deg;
    const i = iDeg * deg;
    const r1 = Math.asin(clamp(Math.sin(i) / n, -1, 1));
    const r2 = A - r1;
    if (r2 < 0) return { deviation: NaN, eDeg: NaN, r1Deg:r1*radToDeg, r2Deg:r2*radToDeg };
    const internalSin = n * Math.sin(r2);
    if (internalSin > 1) return { deviation: NaN, eDeg: NaN, r1Deg:r1*radToDeg, r2Deg:r2*radToDeg };
    const e = Math.asin(clamp(internalSin, -1, 1));
    return { deviation: iDeg + e * radToDeg - ADeg, eDeg:e*radToDeg, r1Deg:r1*radToDeg, r2Deg:r2*radToDeg };
  }

  function prismState(incidenceOverride = null) {
    const Adeg=app.params.prismAngle, A=Adeg*deg, n=app.params.refractiveIndex;
    const incidence=incidenceOverride == null ? app.params.incidence : incidenceOverride;
    const q=prismStateRaw(incidence,Adeg,n);
    let minDeviation=Infinity;
    for(let i=5;i<=89;i+=0.5){ const r=prismStateRaw(i,Adeg,n); if(Number.isFinite(r.deviation)) minDeviation=Math.min(minDeviation,r.deviation); }
    const critical=Math.asin(clamp(1/n,-1,1))*radToDeg;
    return { A, Adeg, n, incidence, critical, deviation:q.deviation, eDeg:q.eDeg, r1Deg:q.r1Deg, r2Deg:q.r2Deg, tir:!Number.isFinite(q.deviation), minDeviation:Number.isFinite(minDeviation)?minDeviation:NaN };
  }

  function ydseState() {
    const lambda=app.params.wavelength*1e-9;
    const d=app.params.slitSeparation*1e-3;
    const D=app.params.screenDistance;
    const a=app.params.slitWidth*1e-3;
    const fringeWidth=lambda*D/d;
    const firstDiffractionZero=lambda*D/a;
    const centralDiffractionWidth=2*firstDiffractionZero;
    return { lambda, d, D, a, fringeWidth, firstDiffractionZero, centralDiffractionWidth };
  }

  function ydseIntensity(y, wavelengthNm, dMm, D, aMm=0.08) {
    const lambda=wavelengthNm*1e-9, d=dMm*1e-3, a=aMm*1e-3;
    const beta=Math.PI*a*y/Math.max(lambda*D,1e-18);
    const alpha=Math.PI*d*y/Math.max(lambda*D,1e-18);
    const envelope=Math.abs(beta)<1e-8 ? 1 : (Math.sin(beta)/beta)**2;
    return clamp(envelope*(Math.cos(alpha)**2),0,1);
  }

  const R_GAS=8.314;
  function thermoState(t) {
    const n=app.params.moles, T1=app.params.temperature, gamma=app.params.gamma, V1=0.010, V2=Math.max(0.011,app.params.volume2);
    const phase=0.5*(1-Math.cos(t*0.75)), V=V1+(V2-V1)*phase;
    const P1=n*R_GAS*T1/V1, process=app.params.process;
    const P=process==='adiabatic'?P1*Math.pow(V1/V,gamma):P1*V1/V;
    const T=process==='adiabatic'?T1*Math.pow(V1/V,gamma-1):T1;
    const finalP=process==='adiabatic'?P1*Math.pow(V1/V2,gamma):P1*V1/V2;
    const finalT=process==='adiabatic'?T1*Math.pow(V1/V2,gamma-1):T1;
    const W=process==='adiabatic'?(P1*V1-finalP*V2)/(gamma-1):n*R_GAS*T1*Math.log(V2/V1);
    const Q=process==='adiabatic'?0:W;
    return {n,T1,gamma,V1,V2,P1,V,P,volume:V,pressure:P,temperature:T,finalP,finalT,work:W,heat:Q,currentWork:W};
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
        case 'viwire': drawVIWire(ctx,w,h); break;
        case 'prism': drawPrism(ctx,w,h); break;
        case 'ydse': drawYDSE(ctx,w,h); break;
        case 'thermo': drawThermo(ctx,w,h); break;
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

  function drawVIWire(ctx,w,h) {
    const p=viWireState();
    const yTop=h*.43, railY=h*.80, left=86, right=w-76;
    const wireStart=365, wireEnd=800;
    const currentMax=20/Math.max(p.R,1);
    const currentNorm=clamp(p.I/Math.max(currentMax,0.01),0,1);
    const heat=clamp(p.P/140,0,1);

    // Presentation header
    ctx.fillStyle='rgba(101,213,255,.08)';ctx.roundRect(24,20,370,58,14);ctx.fill();
    text(ctx,'OHMIC WIRE • V–I EXPERIMENT',44,40,12,COLORS.accent,'left','900');
    text(ctx,'Animated charge flow • live operating point',44,61,10,COLORS.muted,'left','700');

    // Main circuit rails
    ctx.strokeStyle='#62738b';ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();
    ctx.moveTo(left+55,yTop);ctx.lineTo(w*.27,yTop);ctx.lineTo(w*.34,yTop);ctx.lineTo(w*.66,yTop);ctx.lineTo(w*.73,yTop);ctx.lineTo(right,yTop);ctx.lineTo(right,railY);ctx.lineTo(left+55,railY);ctx.lineTo(left+55,yTop);ctx.stroke();

    // Battery / power supply
    const bx=left+55, by=(yTop+railY)/2;
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(bx-20,by-30);ctx.lineTo(bx+20,by-30);ctx.moveTo(bx-12,by+5);ctx.lineTo(bx+12,by+5);ctx.stroke();
    text(ctx,'DC SUPPLY',bx,by+34,10,COLORS.warn,'center','900');
    text(ctx,`${fmt(p.V,1)} V`,bx,by+52,10,COLORS.muted,'center','800');

    // Ammeter
    const ax=w*.31;
    ctx.fillStyle='rgba(99,230,190,.08)';ctx.beginPath();ctx.arc(ax,yTop,45,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=COLORS.success;ctx.lineWidth=3;ctx.beginPath();ctx.arc(ax,yTop,45,0,Math.PI*2);ctx.stroke();
    text(ctx,'A',ax,yTop-4,20,COLORS.success,'center','900');
    text(ctx,`${fmt(p.I,3)} A`,ax,yTop+62,11,COLORS.success,'center','900');

    // Test wire: glow increases with dissipated power
    ctx.strokeStyle=`rgba(255,125,142,${0.10+0.32*heat})`;ctx.lineWidth=30;ctx.beginPath();ctx.moveTo(wireStart,yTop);ctx.lineTo(wireEnd,yTop);ctx.stroke();
    ctx.strokeStyle=COLORS.accent;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(wireStart,yTop);ctx.lineTo(wireEnd,yTop);ctx.stroke();
    text(ctx,'CURRENT-CARRYING TEST WIRE', (wireStart+wireEnd)/2, yTop-45,13,COLORS.text,'center','900');
    text(ctx,`R = ${fmt(p.R,1)} Ω   •   P = ${fmt(p.P,2)} W`, (wireStart+wireEnd)/2, yTop+38,11,COLORS.muted,'center','800');

    // Animated charge carriers
    const speed=0.35+1.4*currentNorm;
    for(let i=0;i<12;i++){
      const q=((app.t*speed+i/12)%1), ex=wireStart+(wireEnd-wireStart)*q;
      ctx.fillStyle=COLORS.white;ctx.beginPath();ctx.arc(ex,yTop,4.3,0,Math.PI*2);ctx.fill();
      if(i%3===0){ctx.strokeStyle='rgba(99,230,190,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ex-14,yTop+17);ctx.lineTo(ex+10,yTop+17);ctx.stroke();ctx.fillStyle=COLORS.success;ctx.beginPath();ctx.moveTo(ex+10,yTop+17);ctx.lineTo(ex+1,yTop+12);ctx.lineTo(ex+1,yTop+22);ctx.closePath();ctx.fill();}
    }

    // Voltmeter connected across the test wire
    const vx=w*.73, vy=railY-56;
    ctx.strokeStyle='#64758c';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(wireStart,yTop);ctx.lineTo(vx,yTop);ctx.lineTo(vx,vy-45);ctx.stroke();
    ctx.beginPath();ctx.moveTo(wireEnd,yTop);ctx.lineTo(vx,yTop);ctx.stroke();
    ctx.fillStyle='rgba(255,209,102,.08)';ctx.beginPath();ctx.arc(vx,vy,44,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=3;ctx.beginPath();ctx.arc(vx,vy,44,0,Math.PI*2);ctx.stroke();
    text(ctx,'V',vx,vy-4,20,COLORS.warn,'center','900');
    text(ctx,`${fmt(p.V,2)} V`,vx,vy+61,11,COLORS.warn,'center','900');

    // Live result panel
    ctx.fillStyle='rgba(8,12,19,.78)';ctx.roundRect(w-315,18,288,92,14);ctx.fill();
    text(ctx,'LIVE MEASUREMENT',w-295,39,10,COLORS.muted,'left','900');
    text(ctx,`I = ${fmt(p.I,3)} A`,w-47,62,18,COLORS.accent,'right','900');
    text(ctx,`V = ${fmt(p.V,2)} V`,w-47,88,12,COLORS.warn,'right','800');

    text(ctx,'Ohm’s law:  V = IR',28,h-65,13,COLORS.text,'left','900');
    text(ctx,'Change V → the operating point moves.  Change R → the slope changes.',28,h-40,11,COLORS.muted,'left');

    setResult(0,fmt(p.I,3),'A');setResult(1,fmt(p.R,1),'Ω');setResult(2,fmt(p.P,2),'W');setResult(3,fmt(p.G,4),'S');
  }

  function drawPrism(ctx,w,h) {
    const p=prismState();
    const height=Math.min(h*.50,300);
    const baseY=h*.76;
    const apexX=w*.56;
    const halfBase=Math.min(w*.19,Math.max(88,height*Math.tan((p.Adeg*deg)/2)));
    const L={x:apexX-halfBase,y:baseY}, A={x:apexX,y:baseY-height}, R={x:apexX+halfBase,y:baseY};
    const leftFaceAngle=Math.atan2(A.y-L.y,A.x-L.x);
    const normalIn=leftFaceAngle+Math.PI/2;
    const entry={x:L.x+(A.x-L.x)*.50,y:L.y+(A.y-L.y)*.50};
    const dirIn={x:Math.cos(normalIn-p.incidence*deg),y:Math.sin(normalIn-p.incidence*deg)};
    const r1=p.r1Deg*deg;
    const dirInside={x:Math.cos(normalIn-r1),y:Math.sin(normalIn-r1)};
    const rightFaceAngle=Math.atan2(R.y-A.y,R.x-A.x);
    const normalOut=rightFaceAngle-Math.PI/2;
    const dirOut=Number.isFinite(p.eDeg)?{x:Math.cos(normalOut+p.eDeg*deg),y:Math.sin(normalOut+p.eDeg*deg)}:null;

    const cross=(u,v)=>u.x*v.y-u.y*v.x;
    function hitRaySegment(p0,d,a,b){
      const e={x:b.x-a.x,y:b.y-a.y}, den=cross(d,e);if(Math.abs(den)<1e-10)return null;
      const ap={x:a.x-p0.x,y:a.y-p0.y};const t=cross(ap,e)/den,u=cross(ap,d)/den;
      return (t>=0&&u>=0&&u<=1)?{x:p0.x+t*d.x,y:p0.y+t*d.y}:null;
    }
    let exit=hitRaySegment(entry,dirInside,A,R);
    if(!exit) exit={x:A.x+(R.x-A.x)*.62,y:A.y+(R.y-A.y)*.62};
    const startIn={x:entry.x-dirIn.x*310,y:entry.y-dirIn.y*310};

    // Dynamic prism body: both A and ray geometry react to controls.
    ctx.fillStyle='rgba(154,123,255,.13)';ctx.beginPath();ctx.moveTo(L.x,L.y);ctx.lineTo(A.x,A.y);ctx.lineTo(R.x,R.y);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(154,123,255,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(L.x,L.y);ctx.lineTo(A.x,A.y);ctx.lineTo(R.x,R.y);ctx.closePath();ctx.stroke();
    ctx.fillStyle='rgba(101,213,255,.06)';ctx.beginPath();ctx.moveTo(L.x+13,L.y-8);ctx.lineTo(A.x,A.y+18);ctx.lineTo(R.x-13,R.y-8);ctx.closePath();ctx.fill();

    // Base and prism-angle indicator
    ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L.x-35,baseY);ctx.lineTo(R.x+35,baseY);ctx.stroke();
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(A.x,A.y+2,45,Math.PI/2,Math.PI/2 + p.Adeg*deg);ctx.stroke();
    text(ctx,`A = ${fmt(p.Adeg,0)}°`,A.x,A.y+57,11,COLORS.warn,'center','900');

    // Rays
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(startIn.x,startIn.y);ctx.lineTo(entry.x,entry.y);ctx.stroke();
    ctx.strokeStyle=COLORS.accent;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(entry.x,entry.y);ctx.lineTo(exit.x,exit.y);ctx.stroke();
    ctx.strokeStyle=p.tir?COLORS.danger:COLORS.success;ctx.lineWidth=4;ctx.beginPath();
    if(p.tir){ctx.setLineDash([8,6]);ctx.moveTo(exit.x,exit.y);ctx.lineTo(exit.x+90,exit.y+55);ctx.stroke();ctx.setLineDash([]);} else {ctx.moveTo(exit.x,exit.y);ctx.lineTo(exit.x+dirOut.x*260,exit.y+dirOut.y*260);ctx.stroke();}

    // Normals show the incidence geometry changing on screen
    ctx.strokeStyle='rgba(255,209,102,.48)';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(entry.x-dirIn.x*62,entry.y-dirIn.y*62);ctx.lineTo(entry.x+dirIn.x*62,entry.y+dirIn.y*62);ctx.stroke();
    ctx.strokeStyle='rgba(99,230,190,.4)';ctx.beginPath();ctx.moveTo(exit.x-Math.cos(normalOut)*62,exit.y-Math.sin(normalOut)*62);ctx.lineTo(exit.x+Math.cos(normalOut)*62,exit.y+Math.sin(normalOut)*62);ctx.stroke();ctx.setLineDash([]);

    text(ctx,`i = ${fmt(p.incidence,1)}°`,Math.max(45,entry.x-105),entry.y-25,11,COLORS.warn,'center','900');
    text(ctx,`r₁ = ${fmt(p.r1Deg,2)}°`,entry.x+67,entry.y-22,11,COLORS.accent,'center','900');
    if(!p.tir) text(ctx,`e = ${fmt(p.eDeg,2)}°`,Math.min(w-80,exit.x+83),exit.y-20,11,COLORS.success,'center','900');
    text(ctx,p.tir?'TOTAL INTERNAL REFLECTION':'EMERGENT RAY',Math.min(w-155,exit.x+140),exit.y+30,12,p.tir?COLORS.danger:COLORS.success,'center','900');

    ctx.fillStyle='rgba(8,12,19,.78)';ctx.roundRect(w-315,18,288,96,14);ctx.fill();
    text(ctx,'LIVE PRISM GEOMETRY',w-295,40,10,COLORS.muted,'left','900');
    text(ctx,`A = ${fmt(p.Adeg,0)}°   i = ${fmt(p.incidence,1)}°`,w-45,64,13,COLORS.text,'right','900');
    text(ctx,`δ = ${Number.isFinite(p.deviation)?fmt(p.deviation,2)+'°':'TIR'}`,w-45,90,12,COLORS.accent,'right','800');

    setResult(0,Number.isFinite(p.deviation)?fmt(p.deviation,2):'TIR','°');setResult(1,fmt(p.critical,2),'°');setResult(2,fmt(p.minDeviation,2),'°');setResult(3,fmt(p.r1Deg,2),'°');
  }

  function drawYDSE(ctx,w,h) {
    const p=ydseState(), mid=h*.52, slitX=235, screenX=w-172, top=mid-208, bottom=mid+208;
    const screenHalfPhysical=Math.max(p.firstDiffractionZero*1.35,p.fringeWidth*7.5);

    ctx.fillStyle='rgba(255,209,102,.14)';ctx.beginPath();ctx.roundRect(32,mid-27,115,54,12);ctx.fill();
    text(ctx,'LASER',90,mid,11,COLORS.warn,'center','900');
    ctx.strokeStyle=COLORS.accent;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(147,mid);ctx.lineTo(slitX-18,mid);ctx.stroke();
    ctx.fillStyle='#1d2738';ctx.fillRect(slitX-10,mid-125,20,250);ctx.fillStyle=COLORS.white;ctx.fillRect(slitX-10,mid-31,20,11);ctx.fillRect(slitX-10,mid+20,20,11);
    text(ctx,'S₁',slitX+24,mid-26,11,COLORS.muted,'left','800');text(ctx,'S₂',slitX+24,mid+27,11,COLORS.muted,'left','800');

    // Expanding wavefronts after each finite-width slit
    for(let r=1;r<=8;r++){
      const rr=20+r*14+((app.t*32)%14);
      const alpha=Math.max(.03,.17-.016*r);
      ctx.strokeStyle=`rgba(101,213,255,${alpha})`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(slitX,mid-25,rr,-Math.PI*.49,Math.PI*.49);ctx.stroke();
      ctx.beginPath();ctx.arc(slitX,mid+25,rr,-Math.PI*.49,Math.PI*.49);ctx.stroke();
    }
    text(ctx,'DIFFRACTION AT EACH SLIT',slitX+125,mid-160,10,COLORS.accent,'center','800');

    // Bright/dark screen pattern generated from interference × diffraction.
    ctx.fillStyle='#0d1320';ctx.fillRect(screenX,top,58,bottom-top);
    const bands=420;
    for(let i=0;i<bands;i++){
      const yy=top+(bottom-top)*(i+.5)/bands;
      const physicalY=((yy-mid)/(bottom-top))*2*screenHalfPhysical;
      const I=ydseIntensity(physicalY,p.lambda*1e9,p.d*1e3,p.D,p.a*1e3);
      ctx.fillStyle=`rgba(248,250,255,${.035+.965*I})`;ctx.fillRect(screenX+2,yy,54,(bottom-top)/bands+1);
    }
    ctx.strokeStyle=COLORS.warn;ctx.lineWidth=3;ctx.strokeRect(screenX,top,58,bottom-top);

    // Broad diffraction envelope outline
    ctx.strokeStyle='rgba(154,123,255,.78)';ctx.lineWidth=2.2;ctx.setLineDash([8,5]);ctx.beginPath();
    for(let i=0;i<=160;i++){
      const q=i/160, physicalY=-screenHalfPhysical+2*screenHalfPhysical*q;
      const beta=Math.PI*p.a*physicalY/(p.lambda*p.D);
      const env=Math.abs(beta)<1e-8?1:(Math.sin(beta)/beta)**2;
      const yy=mid+(physicalY/(2*screenHalfPhysical))*(bottom-top);
      const xx=screenX-16-env*75;
      if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
    }
    ctx.stroke();ctx.setLineDash([]);

    text(ctx,'INTERFERENCE FRINGES',screenX+29,top-22,10,COLORS.text,'center','900');
    text(ctx,'DIFFRACTION ENVELOPE',screenX-94,top+20,10,COLORS.accent2,'center','900');
    ctx.fillStyle='rgba(8,12,19,.78)';ctx.roundRect(w-355,18,328,82,14);ctx.fill();
    text(ctx,'LIVE DOUBLE-SLIT PATTERN',w-335,40,10,COLORS.muted,'left','900');
    text(ctx,`β = ${fmtSmart(p.fringeWidth)} m`,w-45,62,13,COLORS.warn,'right','900');
    text(ctx,`central width ≈ ${fmtSmart(p.centralDiffractionWidth)} m`,w-45,84,11,COLORS.text,'right','800');
    text(ctx,`λ ${fmt(p.lambda*1e9,0)} nm  •  d ${fmt(p.d*1e3,2)} mm  •  a ${fmt(p.a*1e3,2)} mm  •  D ${fmt(p.D,1)} m`,w*.54,h-28,10,COLORS.muted,'center');

    setResult(0,fmtSmart(p.fringeWidth),'m');setResult(1,fmtSmart(p.centralDiffractionWidth),'m');setResult(2,fmt(p.d*1e3,2),'mm');setResult(3,fmt(p.lambda*1e9,0),'nm');
  }

  function drawThermo(ctx,w,h) {
    const p=thermoState(app.t), x=90,y=100,cw=280,ch=330,base=y+ch;
    ctx.strokeStyle='#53637a';ctx.lineWidth=4;ctx.strokeRect(x,y,cw,ch);
    const frac=clamp((p.volume-p.V1)/(p.V2-p.V1 || 1),0,1), pistonY=base-55-frac*225;
    ctx.fillStyle='rgba(99,230,190,.10)';ctx.fillRect(x+6,pistonY+18,cw-12,base-pistonY-22);ctx.fillStyle='#7f8da1';ctx.fillRect(x-12,pistonY,cw+24,18);
    text(ctx,'IDEAL GAS',x+cw/2,base+26,12,COLORS.muted,'center','800');text(ctx,`V = ${fmt(p.volume,3)} m³`,x+cw/2,pistonY-20,12,COLORS.accent,'center','800');text(ctx,`P = ${fmtSmart(p.pressure)} Pa`,x+cw/2,pistonY-42,12,COLORS.warn,'center','800');
    text(ctx,p.process==='adiabatic'?'ADIABATIC':'ISOTHERMAL',x+cw/2,y-26,13,p.process==='adiabatic'?COLORS.accent2:COLORS.success,'center','800');
    const gx=470,gy=90,gw=w-530,gh=h-145;ctx.strokeStyle='#53637a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke();
    const logMin=Math.log(Math.max(1000,p.finalP*.7)),logMax=Math.log(Math.max(p.P1*1.05,logMin+10));const px=v=>gx+(v-p.V1)/(p.V2-p.V1||1)*gw;const py=P=>gy+gh-(Math.log(Math.max(P,1))-logMin)/(logMax-logMin)*(gh-20)-10;
    ctx.strokeStyle=COLORS.success;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<160;i++){const V=p.V1+(p.V2-p.V1)*i/159;const P=p.process==='adiabatic'?p.P1*Math.pow(p.V1/V,p.gamma):p.P1*p.V1/V;const xx=px(V),yy=py(P);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.stroke();
    ctx.fillStyle=COLORS.warn;ctx.beginPath();ctx.arc(px(p.volume),py(p.pressure),6,0,Math.PI*2);ctx.fill();
    text(ctx,'P–V DIAGRAM',gx+gw/2,gy-28,13,COLORS.text,'center','800');text(ctx,'Volume (m³)',gx+gw/2,gy+gh+28,10,COLORS.muted,'center');ctx.save();ctx.translate(gx-26,gy+gh/2);ctx.rotate(-Math.PI/2);text(ctx,'Pressure (Pa)',0,0,10,COLORS.muted,'center');ctx.restore();
    text(ctx,`W = ${fmtSmart(p.work)} J`,w-24,28,13,COLORS.accent,'right','800');text(ctx,`Q = ${fmtSmart(p.heat)} J`,w-24,50,11,COLORS.muted,'right');
    setResult(0,fmtSmart(p.finalP),'Pa');setResult(1,fmtSmart(p.work),'J');setResult(2,fmtSmart(p.heat),'J');setResult(3,fmtSmart(p.finalT),'K');
  }

  function axisDecimals(step){
    if(step>=100)return 0;if(step>=10)return 0;if(step>=1)return 1;if(step>=0.1)return 2;if(step>=0.01)return 3;return 4;
  }
  function niceStep(raw){
    const r=Math.max(Math.abs(raw),1e-12), p=10**Math.floor(Math.log10(r)), n=r/p;
    return (n<=1?1:n<=2?2:n<=5?5:10)*p;
  }
  function niceBounds(min,max,intervals=6){
    if(!Number.isFinite(min)||!Number.isFinite(max)){return {min:0,max:1,step:.2};}
    if(Math.abs(max-min)<1e-12){const s=Math.max(Math.abs(max)*.25,1);min-=s;max+=s;}
    const step=niceStep((max-min)/intervals);
    let lo=Math.floor(min/step)*step;
    let hi=Math.ceil(max/step)*step;
    if (Math.abs(lo) < step*1e-10) lo=0;
    if (Math.abs(hi) < step*1e-10) hi=0;
    return {min:lo,max:hi,step};
  }

  function rangeFromPoints(points, requestedMin, requestedMax, options={}){
    const finite=points.filter(q=>Number.isFinite(q.x)&&Number.isFinite(q.y));
    if(!finite.length) return {xmin:0,xmax:1,ymin:0,ymax:1};
    const xs=finite.map(q=>q.x), ys=finite.map(q=>q.y);
    let xmin=Number.isFinite(requestedMin) ? requestedMin : Math.min(...xs);
    let xmax=Number.isFinite(requestedMax) ? requestedMax : Math.max(...xs);
    xmin=Math.min(xmin,Math.min(...xs));
    xmax=Math.max(xmax,Math.max(...xs));
    let ymin=Math.min(...ys), ymax=Math.max(...ys);
    if(options.includeYZero){ymin=Math.min(ymin,0);ymax=Math.max(ymax,0);}
    const ySpan=Math.max(Math.abs(ymax-ymin),1e-12);
    const xSpan=Math.max(Math.abs(xmax-xmin),1e-12);
    if(options.padX !== false){
      const px=Math.max(xSpan*.06, Math.abs(xmax)*.005, 1e-12);
      xmin-=px*.25; xmax+=px*.25;
      if(options.keepXZero && xmin>0) xmin=0;
    }
    if(options.padY !== false){
      const py=Math.max(ySpan*.08, Math.abs(ymax)*.005, 1e-12);
      ymin-=py; ymax+=py;
      if(options.keepYZero && ymin>0) ymin=0;
    }
    return {xmin,xmax,ymin,ymax};
  }

  function drawGraph(){
    const {ctx,w,h}=fitCanvas(app.graph);clearCanvas(ctx,w,h);const key=app.current;if(!key)return;
    const pad={l:80,r:34,t:44,b:68};let points=[];let xLabel='X',yLabel='Y',color=COLORS.accent,cx=0,cy=0,xmin=0,xmax=1,ymin=0,ymax=1,extra='';
    if(key==='projectile'){
      const u=app.params.u,a=app.params.angle*deg,g=app.params.g,T=2*u*Math.sin(a)/g,R=u*u*Math.sin(2*a)/g,H=u*u*Math.sin(a)**2/(2*g);for(let i=0;i<180;i++){const t=T*i/179;points.push({x:u*Math.cos(a)*t,y:Math.max(0,u*Math.sin(a)*t-.5*g*t*t)});}const p=projectileState(Math.min(app.t,T));xLabel='Horizontal distance x (m)';yLabel='Height y (m)';color=COLORS.accent;cx=p.x;cy=p.y;xmin=0;xmax=R;ymin=0;ymax=H;extra=`u ${fmt(u,0)} m/s   θ ${fmt(app.params.angle,0)}°`;
    } else if(key==='optical'){
      const s=opticalState();for(let i=0;i<220;i++){const q=i/219;let yy;if(s.tir){const tri=2*Math.abs(2*(q*4-Math.floor(q*4+.5)))-1;yy=tri*.82;}else yy=-.78*q;points.push({x:q,y:yy});}const tri=s.tir?2*Math.abs(2*(s.progress*4-Math.floor(s.progress*4+.5)))-1:-.78*s.progress;xLabel='Normalized propagation';yLabel='Ray height (normalized)';cx=s.progress;cy=tri*(s.tir?.82:1);xmin=0;xmax=1;ymin=-1;ymax=1;extra=`θ ${fmt(app.params.theta,1)}°   θc ${fmt(s.critical,2)}°`;
    } else if(key==='shm'){
      const p=shmState(0),span=Math.max(4,p.T*3);for(let i=0;i<220;i++){const t=span*i/219;points.push({x:t,y:app.params.amp*Math.cos(p.omega*t)});}const t=app.t%span,q=shmState(t);xLabel='Time t (s)';yLabel='Displacement x (m)';color=COLORS.accent;cx=t;cy=q.x;xmin=0;xmax=span;ymin=-app.params.amp;ymax=app.params.amp;extra=`A ${fmt(app.params.amp,2)} m   T ${fmt(p.T,2)} s`;
    } else if(key==='pendulum'){
      const p=pendulumState(0),span=Math.max(5,p.T*3);for(let i=0;i<220;i++){const t=span*i/219;points.push({x:t,y:pendulumState(t).thetaDeg});}const t=app.t%span,q=pendulumState(t);xLabel='Time t (s)';yLabel='Angular displacement θ (°)';color=COLORS.accent2;cx=t;cy=q.thetaDeg;xmin=0;xmax=span;ymin=-app.params.angle;ymax=app.params.angle;extra=`L ${fmt(app.params.length,2)} m   T ${fmt(p.T,2)} s`;
    } else if(key==='induction'){
      const span=8;for(let i=0;i<220;i++){const t=span*i/219;points.push({x:t,y:inductionState(t).emf});}const q=inductionState(app.t%span),ys=points.map(v=>Math.abs(v.y)),ym=Math.max(.1,Math.max(...ys)*1.12);xLabel='Time t (s)';yLabel='Induced EMF ε (V)';color=COLORS.warn;cx=app.t%span;cy=q.emf;xmin=0;xmax=span;ymin=-ym;ymax=ym;extra=`N ${app.params.turns} turns   B₀ ${fmt(app.params.field,2)} T`;
    } else if(key==='doppler'){
      const f=app.params.frequency, vo=app.params.observerV, v=app.params.soundV, maxVs=Math.min(app.params.soundV*.88,120), current=app.params.sourceV;
      for(let i=0;i<180;i++){const vs=maxVs*i/179;const obs=f*(v+vo)/(v-vs);points.push({x:vs,y:obs});}
      const d=dopplerState();xLabel='Source velocity toward observer (m/s)';yLabel='Observed frequency f′ (Hz)';color=COLORS.accent;cx=current;cy=d.observed;xmin=0;xmax=maxVs*1.05;ymin=Math.max(0,f*(v+vo)/v*.90);ymax=Math.max(f*1.1,d.observed*1.10);extra=`f₀ ${fmt(f,0)} Hz   current f′ ${fmtSmart(d.observed)} Hz`;
    } else if(key==='viwire'){
      const R=app.params.resistance,voltageMax=20,iMax=voltageMax/R;for(let i=0;i<160;i++){const I=iMax*i/159;points.push({x:I,y:I*R});}const q=viWireState();xLabel='Current I (A)';yLabel='Voltage V (V)';color=COLORS.accent;cx=q.I;cy=q.V;xmin=0;xmax=iMax*1.08;ymin=0;ymax=voltageMax*1.08;extra=`Operating point  I=${fmt(q.I,3)} A, V=${fmt(q.V,2)} V   R=${fmt(R,1)} Ω`;
    } else if(key==='prism'){
      for(let i=5;i<=89;i++){const q=prismStateRaw(i,app.params.prismAngle,app.params.refractiveIndex);if(Number.isFinite(q.deviation))points.push({x:i,y:q.deviation});}const q=prismState(),vals=points.map(v=>v.y);xLabel='Incidence angle i (°)';yLabel='Deviation δ (°)';color=COLORS.accent2;cx=q.incidence;cy=Number.isFinite(q.deviation)?q.deviation:0;xmin=5;xmax=89;ymin=vals.length?Math.min(...vals):0;ymax=vals.length?Math.max(...vals):90;extra=`A ${fmt(q.Adeg,0)}°   n ${fmt(q.n,2)}   i ${fmt(q.incidence,1)}°`;
    } else if(key==='ydse'){
      const p=ydseState(),span=Math.max(p.fringeWidth*9,p.firstDiffractionZero*2.7);for(let i=0;i<260;i++){const y=-span/2+span*i/259;points.push({x:y,y:ydseIntensity(y,p.lambda*1e9,p.d*1e3,p.D,p.a*1e3)});}xLabel='Screen position y (m)';yLabel='Normalized intensity';color=COLORS.warn;cx=0;cy=1;xmin=-span/2;xmax=span/2;ymin=0;ymax=1;extra=`β ${fmtSmart(p.fringeWidth)} m   central width ${fmtSmart(p.centralDiffractionWidth)} m`;
    } else if(key==='thermo'){
      const p=thermoState(app.t),arr=[];for(let i=0;i<200;i++){const V=p.V1+(p.V2-p.V1)*i/199;const P=p.process==='adiabatic'?p.P1*Math.pow(p.V1/V,p.gamma):p.P1*p.V1/V;arr.push({x:V,y:P});}const vals=arr.map(q=>q.y);xLabel='Volume V (m³)';yLabel='Pressure P (Pa)';color=COLORS.success;cx=p.volume;cy=p.pressure;xmin=p.V1;xmax=p.V2;ymin=Math.min(...vals);ymax=Math.max(...vals);extra=`${p.process==='adiabatic'?'Adiabatic':'Isothermal'}   γ ${fmt(p.gamma,2)}`;
    }
    drawLineGraph(ctx,w,h,points,color,cx,cy,xmin,xmax,ymin,ymax,pad,xLabel,yLabel,extra,key);
  }

  function drawLineGraph(ctx,w,h,points,color,cx,cy,xmin,xmax,ymin,ymax,pad,xLabel,yLabel,extraLabel='',key=''){
    const options={
      includeYZero:['projectile','prism','ydse','viwire','thermo'].includes(key),
      keepYZero:['projectile','prism','ydse','viwire'].includes(key),
      keepXZero:['projectile','optical','doppler','viwire'].includes(key)
    };
    const auto=rangeFromPoints(points,xmin,xmax,options);
    const xb=niceBounds(auto.xmin,auto.xmax,6),yb=niceBounds(auto.ymin,auto.ymax,6);
    xmin=xb.min;xmax=xb.max;ymin=yb.min;ymax=yb.max;
    const sx=x=>pad.l+(x-xmin)/(xmax-xmin)*(w-pad.l-pad.r),sy=y=>h-pad.b-(y-ymin)/(ymax-ymin)*(h-pad.t-pad.b);
    const innerW=w-pad.l-pad.r, innerH=h-pad.t-pad.b;
    // Six dynamic divisions keep the scale readable while adapting to the actual data.
    ctx.strokeStyle='rgba(110,128,153,.24)';ctx.lineWidth=1;
    for(let i=0;i<=6;i++){
      const frac=i/6,xx=pad.l+innerW*frac,yy=pad.t+innerH*(1-frac);
      ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();
    }
    const dx=xb.step,dy=yb.step;
    ctx.fillStyle=COLORS.muted;ctx.font='500 10px ui-monospace, SFMono-Regular, Menlo, monospace';ctx.textBaseline='top';ctx.textAlign='center';
    for(let i=0;i<=6;i++){
      const xv=xmin+dx*i,xx=pad.l+innerW*i/6;
      ctx.fillText(formatAxis(xv,dx),xx,h-pad.b+11);
    }
    ctx.textAlign='right';ctx.textBaseline='middle';
    for(let i=0;i<=6;i++){
      const yv=ymin+dy*i,yy=h-pad.b-innerH*i/6;
      ctx.fillText(formatAxis(yv,dy),pad.l-10,yy);
    }
    // Axis lines + tick marks make the scale explicit.
    ctx.strokeStyle='#5d6e86';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
    ctx.strokeStyle='#71819a';ctx.lineWidth=1.2;
    for(let i=0;i<=6;i++){
      const xx=pad.l+innerW*i/6, yy=h-pad.b-innerH*i/6;
      ctx.beginPath();ctx.moveTo(xx,h-pad.b);ctx.lineTo(xx,h-pad.b+6);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(pad.l-6,yy);ctx.stroke();
    }
    // Data curve
    ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();points.forEach((q,i)=>{const xx=sx(q.x),yy=sy(q.y);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);});ctx.stroke();
    if(key==='viwire'){
      ctx.setLineDash([6,5]);ctx.strokeStyle='rgba(255,209,102,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx(clamp(cx,xmin,xmax)),sy(0));ctx.lineTo(sx(clamp(cx,xmin,xmax)),sy(clamp(cy,ymin,ymax)));ctx.lineTo(sx(0),sy(clamp(cy,ymin,ymax)));ctx.stroke();ctx.setLineDash([]);
      text(ctx,'OPERATING POINT',sx(clamp(cx,xmin,xmax))+10,sy(clamp(cy,ymin,ymax))-17,9,COLORS.warn,'left','900');
    }
    const safeX=clamp(cx,xmin,xmax),safeY=clamp(cy,ymin,ymax);ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx(safeX),sy(safeY),6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(sx(safeX),sy(safeY),11,0,Math.PI*2);ctx.stroke();
    text(ctx,xLabel,(pad.l+w-pad.r)/2,h-28,11,COLORS.text,'center','800');ctx.save();ctx.translate(20,(pad.t+h-pad.b)/2);ctx.rotate(-Math.PI/2);text(ctx,yLabel,0,0,11,COLORS.text,'center','800');ctx.restore();
    text(ctx,`X scale: ${formatAxis(xmin,dx)} → ${formatAxis(xmax,dx)}  •  Δx ≈ ${formatAxis(dx,dx)}`,pad.l,17,9,COLORS.muted,'left','700');
    text(ctx,`Y scale: ${formatAxis(ymin,dy)} → ${formatAxis(ymax,dy)}  •  Δy ≈ ${formatAxis(dy,dy)}`,pad.l+265,17,9,COLORS.muted,'left','700');
    if(extraLabel)text(ctx,extraLabel,w-pad.r,17,9,COLORS.muted,'right','700');
  }

  function niceTicks(min,max,count=5){
    const span=Math.abs(max-min)||1;
    const raw=span/count;
    const power=Math.pow(10,Math.floor(Math.log10(raw)));
    const normalized=raw/power;
    const step=(normalized<1.5?1:normalized<3?2:normalized<7?5:10)*power;
    const start=Math.ceil(min/step-1e-10)*step;
    const ticks=[];
    for(let v=start;v<=max+step*0.5;v+=step){ticks.push(v);if(ticks.length>10)break;}
    if(!ticks.length) ticks.push(min,max);
    return ticks;
  }

  function formatAxis(v,range){
    const a=Math.abs(v), r=Math.abs(range)||1;
    if(a===0) return '0';
    if(a>=1000 || a<0.001 || r<0.01) return v.toExponential(2);
    if(r>=100) return v.toFixed(0);
    if(r>=10) return v.toFixed(1);
    if(r>=1) return v.toFixed(2);
    if(r>=0.1) return v.toFixed(3);
    return v.toExponential(2);
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

  // ---------- Opening intro ----------
  function initIntroScreen() {
    const intro = $('#introScreen');
    const start = $('#letsStartButton');
    if (!intro || !start) return;
    document.body.classList.add('intro-active');
    const closeIntro = () => {
      intro.classList.add('is-hidden');
      document.body.classList.remove('intro-active');
      setTimeout(() => intro.remove(), 700);
      try { start.blur(); } catch (_) {}
    };
    start.addEventListener('click', closeIntro, { once: true });
    start.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeIntro(); }
    });
    setTimeout(() => start.focus(), 60);
  }

  // ---------- Routing ----------
  function routeFromHash() {
    const key=window.location.hash.slice(1);
    if (simulations[key]) openSimulator(key,false); else showView('home');
  }

  initIntroScreen();
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
