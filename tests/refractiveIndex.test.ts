/**
 * refractiveIndex.test.ts
 *
 * The media a beam passes through, and the optical path each one is worth.
 */

import { describe, expect, it } from "vitest";
import {
  bk7Index,
  gasIndex,
  mediumOpticalPathDelta,
  plateOpticalPathDelta,
  uncompensatedDispersionOpd,
} from "../src/common/model/refractiveIndex.js";
import {
  AIR_INDEX_STP,
  GAS_CELL_LENGTH_NM,
  HENE_WAVELENGTH_NM,
  ROOM_TEMPERATURE_K,
  STANDARD_PRESSURE_KPA,
  STANDARD_TEMPERATURE_K,
} from "../src/InterferometryLabConstants.js";

describe("bk7Index", () => {
  it("matches the published index at the helium-neon line", () => {
    // N-BK7 is n = 1.51509 at 632.8 nm.
    expect(bk7Index(632.8)).toBeCloseTo(1.51509, 4);
  });

  it("matches the published index at the sodium d line", () => {
    // n_d = 1.51680 at 587.6 nm — the number the glass is specified by.
    expect(bk7Index(587.6)).toBeCloseTo(1.5168, 4);
  });

  it("is normally dispersive: blue is slowed more than red", () => {
    expect(bk7Index(450)).toBeGreaterThan(bk7Index(650));
  });

  it("has an Abbe number in the high fifties", () => {
    // V_d = (n_d − 1)/(n_F − n_C); N-BK7 is quoted at 64.2.
    const abbe = (bk7Index(587.6) - 1) / (bk7Index(486.1) - bk7Index(656.3));
    expect(abbe).toBeGreaterThan(60);
    expect(abbe).toBeLessThan(68);
  });
});

describe("gasIndex", () => {
  it("returns the reference index at standard temperature and pressure", () => {
    expect(gasIndex(STANDARD_PRESSURE_KPA, STANDARD_TEMPERATURE_K)).toBeCloseTo(AIR_INDEX_STP, 12);
  });

  it("returns vacuum at zero pressure", () => {
    expect(gasIndex(0, ROOM_TEMPERATURE_K)).toBe(1);
  });

  it("makes refractivity proportional to pressure", () => {
    const half = gasIndex(STANDARD_PRESSURE_KPA / 2, ROOM_TEMPERATURE_K) - 1;
    const full = gasIndex(STANDARD_PRESSURE_KPA, ROOM_TEMPERATURE_K) - 1;
    expect(full / half).toBeCloseTo(2, 10);
  });

  it("makes refractivity inversely proportional to temperature", () => {
    const cold = gasIndex(STANDARD_PRESSURE_KPA, 200) - 1;
    const hot = gasIndex(STANDARD_PRESSURE_KPA, 400) - 1;
    expect(cold / hot).toBeCloseTo(2, 10);
  });

  it("gives air a refractivity near 2.7e-4 at room temperature", () => {
    const refractivity = gasIndex(STANDARD_PRESSURE_KPA, ROOM_TEMPERATURE_K) - 1;
    expect(refractivity).toBeGreaterThan(2.5e-4);
    expect(refractivity).toBeLessThan(3e-4);
  });
});

describe("plateOpticalPathDelta", () => {
  it("is t(n − 1) at normal incidence", () => {
    expect(plateOpticalPathDelta(1000, 1.5, 0)).toBeCloseTo(500, 10);
  });

  it("is zero for a plate of vacuum", () => {
    expect(plateOpticalPathDelta(1000, 1, 0)).toBeCloseTo(0, 10);
  });

  it("grows as the plate is tilted", () => {
    const flat = plateOpticalPathDelta(1000, 1.5, 0);
    const tilted = plateOpticalPathDelta(1000, 1.5, (20 * Math.PI) / 180);
    expect(tilted).toBeGreaterThan(flat);
  });

  it("scales with thickness", () => {
    const tilt = (10 * Math.PI) / 180;
    expect(plateOpticalPathDelta(2000, 1.5, tilt)).toBeCloseTo(2 * plateOpticalPathDelta(1000, 1.5, tilt), 10);
  });
});

describe("the gas-cell measurement", () => {
  it("shifts the number of fringes a student would count evacuating the cell", () => {
    // The beam crosses the cell twice, so N = 2L(n − 1)/λ.
    const index = gasIndex(STANDARD_PRESSURE_KPA, ROOM_TEMPERATURE_K);
    const opd = 2 * mediumOpticalPathDelta(GAS_CELL_LENGTH_NM, index);
    const fringes = opd / HENE_WAVELENGTH_NM;
    // A 50 mm cell of air in red light is worth a few dozen fringes.
    expect(fringes).toBeGreaterThan(35);
    expect(fringes).toBeLessThan(50);
  });

  it("recovers the refractivity from the fringe count", () => {
    // The inverse of the measurement: n − 1 = Nλ/2L.
    const index = gasIndex(STANDARD_PRESSURE_KPA, ROOM_TEMPERATURE_K);
    const fringes = (2 * mediumOpticalPathDelta(GAS_CELL_LENGTH_NM, index)) / HENE_WAVELENGTH_NM;
    const recovered = (fringes * HENE_WAVELENGTH_NM) / (2 * GAS_CELL_LENGTH_NM);
    expect(recovered).toBeCloseTo(index - 1, 12);
  });
});

describe("uncompensatedDispersionOpd", () => {
  it("vanishes at the reference wavelength", () => {
    expect(uncompensatedDispersionOpd(550, 550, 5e6)).toBeCloseTo(0, 10);
  });

  it("has opposite signs either side of the reference", () => {
    const blue = uncompensatedDispersionOpd(450, 550, 5e6);
    const red = uncompensatedDispersionOpd(650, 550, 5e6);
    expect(Math.sign(blue)).toBe(-Math.sign(red));
  });

  it("is large enough across the visible band to destroy white-light fringes", () => {
    // White light stays coherent over about a micrometre. The residual glass
    // dispersion is orders of magnitude beyond that, which is exactly why the
    // compensator plate is not optional.
    const spread = uncompensatedDispersionOpd(450, 550, 5e6) - uncompensatedDispersionOpd(650, 550, 5e6);
    expect(Math.abs(spread)).toBeGreaterThan(50_000);
  });

  it("scales with the substrate thickness", () => {
    const thin = uncompensatedDispersionOpd(450, 550, 1e6);
    const thick = uncompensatedDispersionOpd(450, 550, 2e6);
    expect(thick).toBeCloseTo(2 * thin, 8);
  });
});
