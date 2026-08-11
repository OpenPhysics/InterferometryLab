/**
 * fringeIntensity.test.ts
 *
 * The interference maths every screen renders through: where the path difference
 * lands on the detector, and what the recombining light does when it gets there.
 */

import { describe, expect, it } from "vitest";
import type { FringeGeometry, FringeSpec, MultiBeamTerms, TwoBeamTerms } from "../src/common/model/FringeSpec.js";
import {
  airyIntensity,
  airyPeakTransmission,
  axialCosine,
  coefficientOfFinesse,
  intensityProfile,
  opdSpread,
  opticalPathDifference,
  reflectiveFinesse,
  twoBeamIntensity,
} from "../src/common/model/fringeIntensity.js";

const flatGeometry: FringeGeometry = {
  ringOpdNm: 0,
  constantOpdNm: 0,
  tiltXNm: 0,
  tiltYNm: 0,
  apertureTanTheta: 0.2,
};

const equalRoutes: TwoBeamTerms = {
  kind: "two-beam",
  intensityA: 0.5,
  intensityB: 0.5,
  extraPhaseRad: 0,
};

describe("axialCosine", () => {
  it("is 1 on the optical axis", () => {
    expect(axialCosine(flatGeometry, 0, 0)).toBeCloseTo(1, 12);
  });

  it("decreases away from the axis", () => {
    expect(axialCosine(flatGeometry, 1, 0)).toBeLessThan(1);
    expect(axialCosine(flatGeometry, 1, 1)).toBeLessThan(axialCosine(flatGeometry, 1, 0));
  });

  it("matches 1/√(1 + tan²θ)", () => {
    const tanTheta = 0.2 * Math.SQRT2;
    expect(axialCosine(flatGeometry, 1, 1)).toBeCloseTo(1 / Math.sqrt(1 + tanTheta * tanTheta), 12);
  });

  it("is radially symmetric", () => {
    expect(axialCosine(flatGeometry, 0.6, 0.8)).toBeCloseTo(axialCosine(flatGeometry, -0.8, 0.6), 12);
  });
});

describe("opticalPathDifference", () => {
  it("returns the constant term when nothing else is set", () => {
    const geometry = { ...flatGeometry, constantOpdNm: 1234 };
    expect(opticalPathDifference(geometry, 0.3, -0.7)).toBeCloseTo(1234, 12);
  });

  it("shortens the ring term off axis, which is what makes rings", () => {
    const geometry = { ...flatGeometry, ringOpdNm: 100_000 };
    const onAxis = opticalPathDifference(geometry, 0, 0);
    const offAxis = opticalPathDifference(geometry, 1, 0);
    expect(onAxis).toBeCloseTo(100_000, 6);
    expect(offAxis).toBeLessThan(onAxis);
  });

  it("varies linearly across the detector under tilt, which is what makes bars", () => {
    const geometry = { ...flatGeometry, tiltXNm: 500 };
    expect(opticalPathDifference(geometry, -1, 0)).toBeCloseTo(-500, 10);
    expect(opticalPathDifference(geometry, 0, 0)).toBeCloseTo(0, 10);
    expect(opticalPathDifference(geometry, 1, 0)).toBeCloseTo(500, 10);
  });
});

describe("opdSpread", () => {
  it("is zero when nothing varies across the detector", () => {
    expect(opdSpread(flatGeometry)).toBeCloseTo(0, 12);
  });

  it("grows with the arm difference", () => {
    const small = opdSpread({ ...flatGeometry, ringOpdNm: 10_000 });
    const large = opdSpread({ ...flatGeometry, ringOpdNm: 100_000 });
    expect(large).toBeGreaterThan(small);
  });

  it("counts a tilt across the full width of the detector", () => {
    expect(opdSpread({ ...flatGeometry, tiltXNm: 300 })).toBeCloseTo(600, 10);
  });
});

describe("twoBeamIntensity", () => {
  it("is maximal at zero path difference for equal routes", () => {
    expect(twoBeamIntensity(0, 600, equalRoutes, 1)).toBeCloseTo(2, 12);
  });

  it("is exactly dark at half a wavelength", () => {
    expect(twoBeamIntensity(300, 600, equalRoutes, 1)).toBeCloseTo(0, 12);
  });

  it("repeats every wavelength", () => {
    const first = twoBeamIntensity(150, 600, equalRoutes, 1);
    const second = twoBeamIntensity(150 + 600, 600, equalRoutes, 1);
    expect(second).toBeCloseTo(first, 10);
  });

  it("conserves power across the two complementary ports", () => {
    const portB: TwoBeamTerms = { ...equalRoutes, extraPhaseRad: Math.PI };
    for (const opd of [0, 75, 150, 225, 300, 412, 599]) {
      const total = twoBeamIntensity(opd, 600, equalRoutes, 1) + twoBeamIntensity(opd, 600, portB, 1);
      expect(total).toBeCloseTo(2, 10);
    }
  });

  it("flattens to the incoherent sum when visibility is zero", () => {
    for (const opd of [0, 150, 300, 450]) {
      expect(twoBeamIntensity(opd, 600, equalRoutes, 0)).toBeCloseTo(1, 12);
    }
  });

  it("never goes fully dark when the routes carry unequal power", () => {
    const unequal: TwoBeamTerms = { kind: "two-beam", intensityA: 0.9, intensityB: 0.1, extraPhaseRad: 0 };
    const minimum = twoBeamIntensity(300, 600, unequal, 1);
    // I_min = (√I_A − √I_B)² = (0.9487 − 0.3162)² ≈ 0.4
    expect(minimum).toBeCloseTo((Math.sqrt(0.9) - Math.sqrt(0.1)) ** 2, 10);
    expect(minimum).toBeGreaterThan(0);
  });
});

describe("Fabry-Pérot coefficients", () => {
  it("coefficient of finesse is 4R/(1 − R)²", () => {
    expect(coefficientOfFinesse(0.8)).toBeCloseTo((4 * 0.8) / 0.2 ** 2, 10);
  });

  it("reflective finesse is π√R/(1 − R)", () => {
    expect(reflectiveFinesse(0.85)).toBeCloseTo((Math.PI * Math.sqrt(0.85)) / 0.15, 10);
  });

  it("finesse grows without bound as R approaches 1", () => {
    expect(reflectiveFinesse(0.99)).toBeGreaterThan(reflectiveFinesse(0.9));
    expect(reflectiveFinesse(0.999)).toBeGreaterThan(reflectiveFinesse(0.99));
  });

  it("peak transmission is 1 for lossless mirrors at any reflectance", () => {
    for (const reflectance of [0.1, 0.5, 0.9, 0.99]) {
      expect(airyPeakTransmission(reflectance, 0)).toBeCloseTo(1, 10);
    }
  });

  it("absorption costs far more peak transmission at high reflectance", () => {
    const lowR = airyPeakTransmission(0.5, 0.01);
    const highR = airyPeakTransmission(0.98, 0.01);
    expect(highR).toBeLessThan(lowR);
    // Half a percent of loss against a two-percent transmission is crippling.
    expect(highR).toBeLessThan(0.5);
  });
});

describe("airyIntensity", () => {
  const cavity: MultiBeamTerms = { kind: "multi-beam", reflectance: 0.9, absorptance: 0, extraPhaseRad: 0 };

  it("peaks at 1 when the round trip is a whole number of wavelengths", () => {
    expect(airyIntensity(0, 600, cavity, 1)).toBeCloseTo(1, 10);
    expect(airyIntensity(6000, 600, cavity, 1)).toBeCloseTo(1, 10);
  });

  it("is deeply suppressed between orders", () => {
    // Halfway between resonances the transmission is 1/(1 + F).
    const expected = 1 / (1 + coefficientOfFinesse(0.9));
    expect(airyIntensity(300, 600, cavity, 1)).toBeCloseTo(expected, 10);
    expect(airyIntensity(300, 600, cavity, 1)).toBeLessThan(0.01);
  });

  it("is sharper at higher reflectance", () => {
    const offResonanceNm = 30;
    const low = airyIntensity(offResonanceNm, 600, { ...cavity, reflectance: 0.3 }, 1);
    const high = airyIntensity(offResonanceNm, 600, { ...cavity, reflectance: 0.95 }, 1);
    expect(high).toBeLessThan(low);
  });

  it("reduces to the two-beam cosine shape at low reflectance", () => {
    // At small R the Airy function is a shallow ripple, not a set of spikes:
    // its minimum stays a large fraction of its maximum.
    const shallow: MultiBeamTerms = { ...cavity, reflectance: 0.05 };
    const peak = airyIntensity(0, 600, shallow, 1);
    const trough = airyIntensity(300, 600, shallow, 1);
    expect(trough / peak).toBeGreaterThan(0.8);
  });

  it("flattens toward the incoherent mean as contrast falls", () => {
    const peak = airyIntensity(0, 600, cavity, 1);
    const flattened = airyIntensity(0, 600, cavity, 0);
    expect(flattened).toBeLessThan(peak);
    expect(flattened).toBeCloseTo(1 / Math.sqrt(1 + coefficientOfFinesse(0.9)), 10);
  });
});

describe("intensityProfile", () => {
  /** A single monochromatic line, as a laser produces. */
  const laserGroup = { wavelengthNm: 600, bandwidthNm: 0, weight: 1, opdOffsetNm: 0 };

  /** The trace across a pattern with a horizontal wedge and nothing else. */
  const wedgeSpec = (tiltXNm: number, extraPhaseRad = 0): FringeSpec => ({
    geometry: { ...flatGeometry, apertureTanTheta: 0, tiltXNm },
    groups: [laserGroup],
    terms: { ...equalRoutes, extraPhaseRad },
    contrast: 1,
    exposure: 0.5,
  });

  it("is flat when the path difference does not vary across the detector", () => {
    const values = intensityProfile(wedgeSpec(0), 64);
    expect(values).toHaveLength(64);
    for (const value of values) {
      expect(value).toBeCloseTo(values[0] ?? 0, 12);
    }
  });

  it("draws one bright fringe per wavelength of wedge across the field", () => {
    // tiltX is the extra path difference at the u = +1 edge, so the path
    // difference sweeps 2·tiltX from edge to edge: four wavelengths here, and so
    // four bright fringes.
    const values = intensityProfile(wedgeSpec(2 * 600), 4000);

    let peaks = 0;
    let above = false;
    const midpoint = 0.5;
    for (const value of values) {
      if (value > midpoint && !above) {
        above = true;
      } else if (value <= midpoint && above) {
        above = false;
        peaks++;
      }
    }
    expect(peaks).toBe(4);
  });

  it("keeps the two Mach-Zehnder ports' traces summing to a constant", () => {
    // The claim the Mach-Zehnder screen exists to make: the second splitter's
    // outputs are a half-wave apart, so whatever leaves one port is missing from
    // the other and the total is the same everywhere. Interference redistributes
    // light; it never destroys it.
    const portA = intensityProfile(wedgeSpec(1500, 0), 200);
    const portB = intensityProfile(wedgeSpec(1500, Math.PI), 200);

    portA.forEach((value, index) => {
      expect(value + (portB[index] ?? 0)).toBeCloseTo(1, 12);
    });
  });

  it("fills a caller-supplied buffer instead of allocating", () => {
    const buffer = new Float64Array(32);
    expect(intensityProfile(wedgeSpec(900), 32, buffer)).toBe(buffer);
  });
});
