# Model - SceneryStack Template

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

> **Replace this entire file when forking.** The template ships with no domain physics — only the
> section structure below. Real OpenPhysics sims (e.g. Stern Gerlach, Light Propagation) fill each
> section with equations, ranges, and simplifications verified against their model code.

## Overview

*One or two paragraphs describing what the simulation models and the key ideas a student should take
away. Write for a teacher, not a programmer — avoid code and class names.*

**Example (do not ship):** "The simulation models a block sliding on a ramp with adjustable friction
and angle. Students see how the component of gravity parallel to the surface sets acceleration and
how static vs kinetic friction limits motion."

The template's `SimModel` is an empty coordinator — replace it with real state and a `step(dt)` /
`reset()` that implement your physics.

## Quantities and units

*List the primary modeled quantities, their symbols, units (SI where applicable), and control ranges.
Mirror the ranges enforced in your `*Constants.ts` or model `Range` options.*

| Quantity | Symbol | Units | Range |
|---|---|---|---|
| *(example)* time | t | s | 0 – ∞ |
| *(example)* mass | m | kg | 0.1 – 5.0 |

## Governing equations

*State the equations or rules that drive the model, with a sentence explaining each. Use a smaller
fixed time step than the screen default if the integration requires it; the model makes no assumption
about frame rate.*

**Example (do not ship):** For a damped spring, m·a = −k·x − b·v (+ gravity if applicable).

## Simplifications and assumptions

*Note anything intentionally idealized or omitted relative to the real-world phenomenon (e.g. no air
resistance, point masses, instantaneous response), so educators can set expectations.*

**Example (do not ship):** "Massless spring; linear damping only; motion confined to one dimension."

## References

*Optional: textbook sections, papers, or standards the model is based on.*
