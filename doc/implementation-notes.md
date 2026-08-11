# Interferometry Lab — Implementation Notes

Architecture and the decisions behind it. The physics is in [model.md](model.md).

## The central abstraction: FringeSpec

Three quite different instruments share one renderer. They do it through
[`src/common/model/FringeSpec.ts`](../src/common/model/FringeSpec.ts), which is the contract
between a screen's model and the detector:

```ts
type FringeSpec = {
  geometry: FringeGeometry;              // how path difference varies over the detector
  groups:   readonly FringeGroup[];      // the source spectrum, ready to render
  terms:    TwoBeamTerms | MultiBeamTerms;   // how the light recombines
  contrast: number;                      // blanket visibility multiplier
  exposure: number;                      // display gain
};
```

Each screen's model reduces its whole optical layout — arm lengths, mirror tilts, inserted
samples, cavity spacing — to one of these. The renderer knows nothing about mirrors or beam
splitters; it evaluates this description per pixel.

Two things fall out of that boundary and both were the reason for drawing it:

1. **The physics is a pure function of plain data.** `fringeIntensity.ts` takes a spec and a
   position and returns an intensity, with no Scenery dependency anywhere. The unit tests
   exercise exactly the code the screens run.
2. **Adding an instrument does not touch the renderer.** A fourth interferometer would be a new
   model that emits a `FringeSpec`.

`FringeGroup` carries a per-colour path offset (`opdOffsetNm`) as well as the spectral group.
That exists because dispersion is real: uncompensated glass in one arm is worth a different
number of wavelengths to red light than to blue, so a single global path difference cannot
describe the instrument. Each group gets its own offset and the renderer adds it before working
out either the phase or the coherence envelope.

## Rendering on the CPU, not in a shader

A per-pixel intensity formula is a natural fit for a fragment shader, and this one would suit
one well. It is not used. Measured on a 2020-era laptop, at a 240 × 240 sample grid:

| Case | Time per frame |
|---|---|
| Monochromatic (1 spectral group) | ≈ 3–4 ms |
| Broadband (12 groups) | ≈ 24 ms |

A monochromatic frame is comfortably inside the 16 ms budget, and that is the case that has to
stay smooth — it is what is on screen while a slider is being dragged. Broadband is handled by
dropping to a 120 × 120 grid (a quarter of the pixels, ≈ 6 ms); broadband fringes are
low-contrast and blurred, so the lost resolution is not visible.

Against that, staying on the CPU keeps the physics in one testable TypeScript module instead of
duplicated into GLSL, and there is no WebGL context to lose or fall back from. If a future screen
needs more, `FringePatternNode` is the only file that would change.

**Loop shape.** The render loop runs pixel-outer, group-inner, over a plan built once per
repaint. Path difference depends only on position, so it is computed once per pixel and shared by
every colour in the spectrum; the per-group constants (display colour, share of power, exposure,
white balance) are folded into the plan up front. The per-pixel work is then just calls into the
shared physics module.

**Repaint policy.** The pattern is repainted when its `FringeSpec` changes, not on a clock. A
static scene costs nothing.

## Colour is computed in linear light through CIE XYZ

`src/common/view/spectralColor.ts` converts wavelengths to colour and adds them the way light
adds. This is not the obvious approach — looking up an sRGB value per wavelength is — and it is
worth saying why the obvious approach fails, because the first implementation used it and the
result was visibly wrong.

A white-light interferogram is the sum of fifteen overlapping single-wavelength patterns. Summing
sRGB triples breaks that in two ways:

1. **sRGB is gamma-encoded.** Adding encoded values is not adding light. Fringe contrast comes
   out wrong.
2. **Summing per-wavelength sRGB approximations across the visible band does not produce white.**
   It produces a yellow-green, because those approximations are clipped renderings of saturated
   colours rather than tristimulus responses that are additive by construction.

So the module works in CIE XYZ, where additivity is the defining property. Colour matching
functions come from the multi-lobe Gaussian fits in Wyman, Sloan & Shirley (JCGT 2013); each
wavelength contributes its `x̄ȳz̄`, the sum converts once to linear sRGB, and the gamma encoding
happens last, at the pixel, through a lookup table so the inner loop never calls `Math.pow`.

One further correction: sRGB's white point is D65, not the flat spectrum a broadband lamp is
modelled as, so each channel is divided by the linear sRGB of an equal-energy spectrum. That is
an ordinary white balance, and it is why the broadband source renders white rather than straw.

## Source code layout

```
src/
  InterferometryLabColors.ts       ProfileColorProperty entries
  InterferometryLabConstants.ts    every named magnitude, in SI or nm
  common/
    model/
      FringeSpec.ts                the model → renderer contract
      fringeIntensity.ts           pure per-point interference maths
      spectrum.ts                  coherence, line splitting, visibility
      refractiveIndex.ts           gases, N-BK7 Sellmeier, tilted plates
      LightSourceModel.ts          source selection → spectrum
      SourceType.ts
    view/
      FringePatternNode.ts         the renderer
      DetectorScreenNode.ts        bezelled detector + overlay layer
      OpticalTableNode.ts          breadboard background
      BeamPathNode.ts              a beam: bright core in a soft halo
      opticNodes.ts                mirror / splitter / cell / lens factories
      spectralColor.ts             CIE XYZ colour pipeline
      sourceColor.ts               spectrum → beam colour
      LightSourcePanel.ts          shared source controls
      InterferometryLabNumberControl.ts, ReadoutBlock.ts, TitledPanel.ts,
      controlFactory.ts, formatters.ts
  michelson/ | mach-zehnder/ | fabry-perot/
      model/  view/                one folder per screen
```

## Keyboard steps are a per-control decision

`InterferometryLabNumberControl` requires an accessible name and makes the keyboard steps
explicit rather than defaulted. The reason is the range problem: the same coarse slider that
travels ±200 µm also needs nudging by tens of nanometres, because that is the scale on which the
output changes. Every control sets its own arrow, shift-arrow and page steps, and several of them
are only usable from the keyboard at their finest step. That is also why both screens' keyboard
help leads with the slider section.

The Michelson's coarse stage and the Fabry-Pérot's spacing both drive a `UnitConversionProperty`
so the control reads micrometres while the model keeps nanometres.

## Single-photon sampling

`MachZehnderModel.step` draws photons from the joint distribution of the two ports. It never
assigns a photon to a path — a photon with a definite route could not produce fringes.

Because the two ports' intensities sum to the full beam at every point, the sampling is exact
rather than rejection-based: the position is uniform over the aperture, and the local phase sets
the probability of port A. Every emitted photon is detected, which is asserted in the tests.

Marks are drawn to a canvas as 2 px squares rather than as scenery nodes or arcs: there can be
several thousand of them, they are never interactive, and at that size the path overhead of
`arc()` dominates the cost.

## Tests

124 vitest specs under `tests/`, environment `happy-dom` with the template's `tests/setup.ts`.

| File | Covers |
|---|---|
| `spectrum.test.ts` | coherence length, visibility envelopes, doublet beats, line splitting |
| `fringeIntensity.test.ts` | detector geometry, two-beam and Airy intensity, finesse |
| `refractiveIndex.test.ts` | Sellmeier against published indices, Gladstone-Dale, tilted plates |
| `interferometerModels.test.ts` | all three screen models: derived values, controls, reset |
| `memory-leak.test.ts` | dispose/WeakRef regression, extended to the two listening nodes |
| `TimeModel.test.ts` | template model retained |

Several assertions are anchored to published numbers rather than to the implementation — N-BK7's
index at the helium-neon and sodium lines, its Abbe number, air's refractivity — so a wrong
constant fails rather than being locked in.

**One template fix carried here.** The template's `memory-leak.test.ts` calls `forceGC()` with no
early-exit condition in its final test, which runs all fifteen `gc()` passes and exceeds the 30 s
timeout in this environment — it fails on a pristine template checkout too. The local copy takes
a predicate and bails as soon as everything is collected. Worth upstreaming.

## Documented deviations

- **`src/common/view/spectralColor.ts`** replaces scenery-phet's `VisibleColor` for anything that
  gets summed, for the reasons above. `VisibleColor` is still fine for single-wavelength UI
  chrome; it is simply not additive.
- **Constants** live in one root `InterferometryLabConstants.ts`, per the fleet default.
- **`tests/fuzz/`** and `playwright.config.ts` are the template's, unchanged.
