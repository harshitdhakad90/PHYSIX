# PHYSIX — Interactive Virtual Physics Lab

A browser-based educational physics project built with plain HTML, CSS, JavaScript, and the Canvas API.

## Included simulators

1. Projectile Motion — Launcher-based throw visualization, parameter-driven trajectory, live calculations and graph.
2. Optical Fiber / Total Internal Reflection — animated zig-zag ray and TIR calculations.
3. Simple Harmonic Motion — animated mass-spring system and displacement graph.
4. Simple Pendulum — animated pendulum whose visible rod length changes with the selected physical length.
5. Electromagnetic Induction — moving conceptual magnet, coil and induced EMF visualization.
6. Doppler Effect — two vehicles (source and observer), animated wavefronts, and observed-frequency calculations.

## Run locally

Open `index.html` in a modern browser.

For development, a local server is optional. No backend or external libraries are required.

## Projectile demo

The projectile launch-speed control is 80–200 m/s. Press **Start simulation** to launch a stone from the angle-controlled launcher and see the parameter-driven trajectory and live results.

## Publish for your professor / QR codes

Upload `index.html`, `style.css`, and `script.js` to a public GitHub repository and enable GitHub Pages.

The site supports direct simulator links using hashes:

- `#projectile`
- `#optical`
- `#shm`
- `#pendulum`
- `#induction`
- `#doppler`

After you have the real public URL, generate a QR code for each direct link.

## Important physics note

The electromagnetic induction simulator is explicitly a conceptual visualization rather than a calibrated field solver. The pendulum uses the small-angle model for its period, and the projectile model assumes no air resistance. Optical-fiber ray geometry is intentionally schematic so total internal reflection is visually clear.
