/**
 * SourceType.ts
 *
 * The light sources a student can put on the table. They differ in exactly one
 * respect that matters optically — how wide their spectrum is — and that width
 * sets the coherence length, which decides how far the arms may differ before
 * the fringes disappear.
 *
 * The list runs from the most coherent (a single-mode laser, metres of coherence
 * length) to the least (a white-light lamp, about a micrometre), which is also
 * the order of increasing experimental difficulty.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class SourceType extends EnumerationValue {
  /** Helium-neon laser, 632.8 nm. The classic red lab laser. */
  public static readonly HELIUM_NEON = new SourceType();

  /** Frequency-doubled Nd:YAG laser, 532 nm. */
  public static readonly GREEN_LASER = new SourceType();

  /** Argon-ion laser, 488 nm. */
  public static readonly BLUE_LASER = new SourceType();

  /**
   * Sodium lamp: two closely spaced lines at 589.0 and 589.6 nm. Their patterns
   * drift in and out of step as the arm difference grows, so the fringes fade
   * and revive periodically — the measurement that gives the doublet spacing.
   */
  public static readonly SODIUM_LAMP = new SourceType();

  /**
   * A lamp behind an adjustable filter: tunable centre wavelength and tunable
   * bandwidth, so coherence length becomes something the student sets directly.
   */
  public static readonly FILTERED_LAMP = new SourceType();

  /**
   * Broadband white light. Coherence length of about a micrometre, so fringes
   * exist only within a wavelength or two of zero path difference — and they
   * come out coloured, because each wavelength has its own fringe spacing.
   */
  public static readonly WHITE_LIGHT = new SourceType();

  public static readonly enumeration = new Enumeration(SourceType);
}
