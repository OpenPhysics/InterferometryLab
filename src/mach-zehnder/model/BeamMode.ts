/**
 * BeamMode.ts
 *
 * Whether the source runs as a continuous beam or emits one photon at a time.
 *
 * The physics behind the two is identical — the same interference, the same
 * pattern. What changes is only how the pattern is revealed: all at once as an
 * intensity, or one detection at a time as a histogram that slowly fills in.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class BeamMode extends EnumerationValue {
  /** A steady beam; the detectors show the intensity pattern directly. */
  public static readonly CONTINUOUS = new BeamMode();

  /**
   * Photons emitted singly. Each is detected at one port, at one place, and the
   * fringes only emerge once enough of them have arrived.
   */
  public static readonly SINGLE_PHOTON = new BeamMode();

  public static readonly enumeration = new Enumeration(BeamMode);
}
