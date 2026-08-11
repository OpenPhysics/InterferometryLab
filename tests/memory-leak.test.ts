/**
 * Fleet-standard memory-leak regression suite (SceneryStackTemplate / QubitSketch pattern).
 *
 * Creates a disposable object inside a function boundary, disposes it, forces
 * garbage collection via global.gc (--expose-gc in vitest.config.ts), then asserts via
 * WeakRef that the object was collected. V8 requires a function boundary (not merely
 * a block scope) so local strong references die when the helper returns.
 *
 * Beyond the template's TimeModel checks, this covers the two nodes in this sim
 * that hold listeners on model Properties: the fringe renderer and the photon
 * mark overlay. Both are created per screen rather than per frame, but both
 * subscribe to Properties they do not own, which is the shape of leak this suite
 * exists to catch.
 */

import { NumberProperty, Property } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import type { FringeSpec } from "../src/common/model/FringeSpec.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { FringePatternNode } from "../src/common/view/FringePatternNode.js";
import type { PhotonMark } from "../src/mach-zehnder/model/MachZehnderModel.js";
import { PhotonMarksNode } from "../src/mach-zehnder/view/PhotonMarksNode.js";

/**
 * Force garbage collection with multiple passes, stopping as soon as `collected`
 * reports success. The setTimeout(0) yield after a live check avoids the WeakRef
 * macrotask-liveness pin.
 *
 * Bailing out early matters: a full gc() pass costs seconds here, so a loop that
 * always runs to completion takes long enough to trip the suite's timeout even
 * when nothing has leaked.
 */
async function forceGC(collected?: () => boolean): Promise<void> {
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (collected === undefined) {
      return;
    }
    if (collected()) {
      return;
    }
    await new Promise<void>((r) => setTimeout(r, 0));
  }
}

function createAndDisposeTimeModel(): WeakRef<object> {
  const model = new TimeModel();
  const ref = new WeakRef<object>(model);
  model.dispose();
  return ref;
}

/** A minimal, valid pattern description for constructing a renderer. */
function makeSpec(): FringeSpec {
  return {
    geometry: { ringOpdNm: 1000, constantOpdNm: 0, tiltXNm: 0, tiltYNm: 0, apertureTanTheta: 0.2 },
    groups: [{ wavelengthNm: 632.8, bandwidthNm: 0.002, weight: 1, opdOffsetNm: 0 }],
    terms: { kind: "two-beam", intensityA: 0.5, intensityB: 0.5, extraPhaseRad: 0 },
    contrast: 1,
    exposure: 0.5,
  };
}

function createAndDisposeFringePatternNode(specProperty: Property<FringeSpec>): WeakRef<object> {
  const node = new FringePatternNode(specProperty, { size: 32 });
  const ref = new WeakRef<object>(node);
  node.dispose();
  return ref;
}

function createAndDisposePhotonMarksNode(revisionProperty: NumberProperty): WeakRef<object> {
  const marks: PhotonMark[] = [];
  const node = new PhotonMarksNode(marks, revisionProperty, 32);
  const ref = new WeakRef<object>(node);
  node.dispose();
  return ref;
}

describe("Memory leak regression", () => {
  it("global.gc is available (--expose-gc)", () => {
    expect(globalThis.gc).toBeDefined();
  });

  it("sanity: plain object is collected", async () => {
    const ref = (() => new WeakRef({ hello: "world" }))();
    await forceGC(() => ref.deref() === undefined);
    expect(ref.deref()).toBeUndefined();
  });

  it("TimeModel is collected after dispose", async () => {
    const ref = createAndDisposeTimeModel();
    await forceGC(() => ref.deref() === undefined);
    expect(ref.deref()).toBeUndefined();
  });

  it("double dispose() does not throw", () => {
    const model = new TimeModel();
    model.dispose();
    expect(() => model.dispose()).not.toThrow();
  });

  it("repeated create/dispose cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDisposeTimeModel());
    }
    await forceGC(() => refs.every((r) => r.deref() === undefined));
    const survivors = refs.filter((r) => r.deref() !== undefined).length;
    expect(survivors).toBe(0);
  });

  it("FringePatternNode unlinks from the spec it does not own", () => {
    const specProperty = new Property<FringeSpec>(makeSpec());
    expect(specProperty.hasListeners()).toBe(false);
    const node = new FringePatternNode(specProperty, { size: 32 });
    expect(specProperty.hasListeners()).toBe(true);
    node.dispose();
    expect(specProperty.hasListeners()).toBe(false);
  });

  it("FringePatternNode is collected after dispose", async () => {
    const specProperty = new Property<FringeSpec>(makeSpec());
    const ref = createAndDisposeFringePatternNode(specProperty);
    await forceGC(() => ref.deref() === undefined);
    expect(ref.deref()).toBeUndefined();
  });

  it("PhotonMarksNode unlinks from the revision Property it does not own", () => {
    const revisionProperty = new NumberProperty(0);
    expect(revisionProperty.hasListeners()).toBe(false);
    const node = new PhotonMarksNode([], revisionProperty, 32);
    expect(revisionProperty.hasListeners()).toBe(true);
    node.dispose();
    expect(revisionProperty.hasListeners()).toBe(false);
  });

  it("PhotonMarksNode is collected after dispose", async () => {
    const revisionProperty = new NumberProperty(0);
    const ref = createAndDisposePhotonMarksNode(revisionProperty);
    await forceGC(() => ref.deref() === undefined);
    expect(ref.deref()).toBeUndefined();
  });
});
