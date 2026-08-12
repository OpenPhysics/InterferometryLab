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

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

/**
 * The localized label Property for each source, keyed by source name. Any
 * object exposing these six StringProperties satisfies this — in practice the
 * `common` string group from {@link StringManager}. Passed in at the call site
 * so this module stays free of the i18n system.
 */
export type SourceLabelProperties = {
  readonly heliumNeonStringProperty: TReadOnlyProperty<string>;
  readonly greenLaserStringProperty: TReadOnlyProperty<string>;
  readonly blueLaserStringProperty: TReadOnlyProperty<string>;
  readonly sodiumLampStringProperty: TReadOnlyProperty<string>;
  readonly filteredLampStringProperty: TReadOnlyProperty<string>;
  readonly whiteLightStringProperty: TReadOnlyProperty<string>;
};

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

  /**
   * The localized label Property for this source — the human-readable name that
   * appears in the source picker, in the a11y summary, and anywhere else a
   * source needs naming. The mapping lives here, on the value itself, so the
   * six-way "which label does this source get?" ternary is not duplicated
   * across the views that name sources.
   *
   * @param labels - the common string group from StringManager
   */
  public labelStringProperty(labels: SourceLabelProperties): TReadOnlyProperty<string> {
    return this === SourceType.HELIUM_NEON
      ? labels.heliumNeonStringProperty
      : this === SourceType.GREEN_LASER
        ? labels.greenLaserStringProperty
        : this === SourceType.BLUE_LASER
          ? labels.blueLaserStringProperty
          : this === SourceType.SODIUM_LAMP
            ? labels.sodiumLampStringProperty
            : this === SourceType.FILTERED_LAMP
              ? labels.filteredLampStringProperty
              : labels.whiteLightStringProperty;
  }
}
