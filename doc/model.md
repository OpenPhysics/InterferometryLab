# Interferometry Lab — Model

The physics behind the three screens. Implementation choices and code structure are in
[implementation-notes.md](implementation-notes.md).

## 1. What the whole simulation computes

Every screen reduces to one quantity: the **optical path difference** (OPD) between two or
more routes that light can take to the same point on a detector. Everything visible follows
from it.

Optical path length is the *geometric* length weighted by the refractive index, `∑ n·d`. It is
what phase actually tracks, which is why a millimetre of glass and a millimetre of air are not
the same thing to a wave. A route that is Δ longer than another arrives with its phase advanced
by

```
δ = 2π Δ / λ
```

where λ is the **vacuum** wavelength. Two routes meeting with that phase difference give

```
I = I₁ + I₂ + 2 √(I₁I₂) · V · cos δ
```

the last term being interference. `V` is the fringe visibility, `(I_max − I_min)/(I_max + I_min)`,
and it is where the source's own imperfection enters.

**Units.** The model works in nanometres throughout. Interferometry spans about nine orders of
magnitude — a metre-scale table setting a nanometre-scale phase — and nanometres are the only
unit in which every quantity here (wavelength, path difference, mirror travel, cavity spacing)
is a comfortable number. Readouts convert at the view boundary.

## 2. Coherence: why fringes stop

A perfectly monochromatic wave interferes with a delayed copy of itself at any delay. Real
sources carry a spread of wavelengths, and each wavelength accumulates a different phase over
the same Δ. Past some path difference the individual patterns are shifted enough relative to
one another that their sum washes out.

For a Gaussian line of centre λ₀ and full width at half maximum Δλ, the modulus of the complex
degree of coherence is itself a Gaussian in the path difference:

```
V(Δ) = exp( −σ_k² Δ² / 2 )      σ_k = 2π σ_λ / λ₀²      σ_λ = Δλ / 2√(2 ln 2)
```

This falls to 1/e at Δ ≈ 0.53 λ₀²/Δλ and to about 3 % at Δ = λ₀²/Δλ. The latter is quoted as
**the coherence length** `L_c = λ₀²/Δλ`: the path difference by which the fringes have gone.

| Source | Δλ | L_c |
|---|---|---|
| Helium-neon laser | 0.002 nm | ≈ 200 mm |
| Sodium lamp (one D line) | 0.005 nm | ≈ 69 mm |
| Filtered lamp | 0.5–60 nm | 5 µm – 0.7 mm |
| White light | 300 nm | ≈ 1 µm |

**Doublets behave differently.** Two narrow lines separated by δλ do not decay; they beat. Their
combined visibility is `|cos(π Δ δλ / λ₀²)|`, which vanishes at odd multiples of `λ₀²/2δλ` and
returns to 1 at even ones. Watching sodium fringes disappear and revive as the mirror moves, and
measuring the period, is how the doublet spacing is determined.

**How the model represents a spectrum.** A source is a list of Gaussian *groups*, each with a
centre, a width and a share of the power. Lasers are one narrow group; sodium is two; white
light is fifteen adjacent groups tiling the visible band. The renderer evaluates one pattern per
group and adds them.

Giving each group a width, rather than treating it as a bare monochromatic line, is what makes
broadband sources behave. A finite set of monochromatic lines is periodic in Δ, so its fringes
would revive spuriously at large path difference. Groups with the right width each damp on their
own, so the envelope decays once and stays decayed.

## 3. Where the path difference varies across a detector

The pattern is a *map*, so the model describes how Δ varies over the detector face. Positions
are given as `(u, v)`, each running −1 to +1 with the optical axis at the centre:

```
Δ(u, v) = ringOpd · cos θ(u, v)  +  tiltX · u  +  tiltY · v  +  constantOpd
```

with `tan θ = apertureTanθ · √(u² + v²)`. The three terms produce the three recognisable kinds
of pattern:

- **`ringOpd · cos θ`** — the arm difference, or the cavity round trip. Rays leaving the axis
  cross it at a slant and see less of it, so the pattern is concentric circles: *fringes of equal
  inclination*. This is the term the movable mirror changes.
- **`tiltX · u`, `tiltY · v`** — a wedge between the two wavefronts, from tilting a mirror by α.
  The reflected wavefront turns by 2α, so Δ varies linearly across the beam and the fringes are
  straight: *fringes of equal thickness*.
- **`constantOpd`** — an insert in one route. Shifts every fringe together without changing the
  pattern's shape.

**Whether there is a pattern at all** depends on the total spread of Δ across the face. Below
about one wavelength of spread the whole field sits on a single fringe and shows one flat tone —
the normal state of a well-aligned interferometer at zero path difference, and a common surprise.

## 4. Media

**Gases** follow the Gladstone-Dale relation: refractivity is proportional to number density.

```
n − 1 = (n_STP − 1) · (P/P_STP) · (T_STP/T)
```

Dry air is `n_STP = 1.000293`. A cell of length L in one Michelson arm is crossed **twice**, so
it contributes `2L(n − 1)` — about 29 µm, or 46 fringes of red light, for a 50 mm cell at one
atmosphere. Counting those fringes while the cell is evacuated measures `n − 1 = Nλ/2L`.

**Glass** uses the three-term Sellmeier equation for N-BK7 (λ in µm):

```
n² − 1 = Σᵢ Bᵢλ²/(λ² − Cᵢ)
```

giving n = 1.5151 at 632.8 nm and an Abbe number of 64. The real dispersion is used rather than
a constant index because dispersion is the point: it is what destroys white-light fringes in an
uncompensated Michelson.

**A tilted plate** of thickness t adds

```
ΔOPL(θ) = t (√(n² − sin²θ) − cos θ)
```

which is `t(n − 1)` at normal incidence and grows as the plate turns.

## 5. Screen 1 — Michelson

A beam splitter, a movable mirror M₁, a fixed mirror M₂, a detector.

Light travels each arm **twice**, so moving M₁ by x changes the path difference by 2x. Half a
wavelength of mirror travel sweeps one whole fringe — the factor of two that lets a Michelson
measure displacement to a fraction of a wavelength.

Total on-axis path difference:

```
Δ = 2x + 2L(n_gas − 1)
```

Both routes carry half the power, so `I = 1 + V cos δ` between 0 and 2.

**The compensator plate.** One arm crosses the beam splitter's glass substrate twice more than
the other. The achromatic part of that extra glass is absorbed into where the mirror's zero
sits — that is what an operator does when finding the white-light fringe by moving the mirror.
What cannot be dialled out is the dispersion: each colour picks up a different extra path, so the
colours reach zero path difference at different mirror positions and no white-light fringe forms.
The model applies, per spectral group,

```
Δ_offset(λ) = 2 t_substrate (n_BK7(λ) − n_BK7(λ̄_source))
```

which is zero for any single-line source — so lasers are unaffected, exactly as on the bench —
and tens of micrometres across the visible band, which is far beyond white light's micrometre of
coherence.

## 6. Screen 2 — Mach-Zehnder

Two beam splitters, two mirrors, two separated paths, and **two output ports**.

The second splitter's outputs are complementary: light arriving at port A by reflection picks up
a half-wave that light arriving by transmission does not, and at port B the roles swap. The two
ports therefore carry cosines exactly π apart, and

```
I_A + I_B = constant
```

at every point and every path difference. A single port makes interference look as though it
destroys light; both ports together show that it only ever moves it.

The routes are collimated and recombine at the same angle, so there is no `cos θ` term: no
rings, only whatever the mirror tilt puts there.

**Single photons.** The physics is unchanged. The intensity pattern becomes a probability
distribution, and photons are drawn from it one at a time. Because the two ports' intensities
sum to the full beam at every point, each photon lands somewhere — the local phase decides only
*which* port. Nothing is lost to destructive interference. The fringes reappear in the
accumulated counts, which is the entire content of "the photon interferes with itself".

**The which-path marker** sets the contrast to zero. It does not block a path, attenuate
anything, or change the geometry; it only makes the route a matter of record. An interference
pattern is a statement that the routes were not distinguishable, so making them distinguishable
removes it, and both detectors go flat at 50/50.

## 7. Screen 3 — Fabry-Pérot

Two partly reflecting mirrors facing each other.

Light entering the cavity leaks a little out at every bounce, so the transmitted field is an
endless geometric series of ever-weaker, ever more delayed copies. That series sums to the **Airy
distribution**:

```
I = I_peak / (1 + F sin²(δ/2))        F = 4R/(1 − R)²        δ = 2π · 2nd cos θ / λ
```

This is not a cosine. A cosine spends half its time near its maximum; the Airy function is close
to zero everywhere except at narrow spikes where every round trip returns in phase. Raising R
narrows those spikes without limit.

Three derived quantities describe any etalon:

| Quantity | Formula | Depends on |
|---|---|---|
| Free spectral range | `λ²/2nd` | spacing only |
| Finesse | `F = π√R/(1 − R)` | mirrors only |
| Order at centre | `m = 2nd/λ` | both |
| Resolving power | `λ/δλ = m·F` | both |

Wide spacing buys resolving power and spends free spectral range. Higher reflectance buys
resolving power for free — except in light. With absorbing coatings the transmittance is
`T = 1 − R − A` and the peak transmission is `(T/(1 − R))²`, so a high-finesse etalon made from
lossy mirrors is beautifully sharp and almost too dim to use.

The model treats the cavity as illuminated by narrow lines, which is the regime an etalon is used
in, so the ideal (fully coherent) Airy function applies and the source's own linewidth is
negligible against the instrument's response.

## 8. Deliberate simplifications

- **The detector coordinate does double duty.** It is treated as a ray angle for the `cos θ`
  term and as a transverse position on the mirror for the wedge term. A real instrument images
  one plane or the other; carrying both at once is the standard textbook simplification, and it
  is what lets a single control sweep continuously from rings to bars.
- **Mirror motion is drawn far out of scale.** The movable mirror's whole travel is a fifth of a
  millimetre against a table drawn half a metre wide. Shown truthfully it would show nothing, so
  the drawn displacement is exaggerated by a large constant factor. Every *number* is exact.
- **Beam splitters are ideal 50/50** apart from the substrate dispersion described above.
- **The Fabry-Pérot ignores the source's finite coherence**, for the reason in §7.
- **The sodium D lines are given equal weight.** D₂ is genuinely the stronger of the pair, but
  the textbook measurement depends on the fringes vanishing *completely* at the visibility nulls,
  which only happens when the two contribute equally.
