# PHYSIX — Interactive Virtual Physics Lab

PHYSIX is a browser-based virtual physics laboratory containing 10 interactive experiments.

## Experiments
1. Projectile Motion
2. Optical Fiber / Total Internal Reflection
3. Simple Harmonic Motion
4. Simple Pendulum
5. Electromagnetic Induction
6. Doppler Effect
7. V-I Characteristic of a Current-Carrying Wire
8. Prism / Minimum Deviation
9. Young's Double-Slit Experiment
10. Thermodynamic Process: Isothermal vs Adiabatic

## Latest improvements
- V-I simulator now includes animated charge carriers, power/heating visualization, and an operating-point V-I graph.
- Prism geometry, prism angle, incidence angle, and ray paths update visibly with controls.
- Young's double-slit now shows propagating wavefronts plus an interference pattern with a visible diffraction envelope.
- All graphs now include numeric tick values, per-division scale, plotted range, and current-point coordinates.
- Doppler graph plots observed frequency against source velocity so parameter changes are visible in the graph.
- Simulator switching works without returning to the lab page.

## Run
Open `index.html` in a modern browser.

No build step or external dependencies are required.



### v8 graph improvements
All ten experiment graphs now auto-scale from the plotted data, use six readable divisions, show numeric tick values and units, and display the approximate step size (Δx/Δy) so the scale matches the experiment.
