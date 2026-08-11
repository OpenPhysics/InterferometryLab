/**
 * sourceColor.ts
 *
 * The colour to draw a beam in, given the spectrum it carries.
 *
 * The groups are added in linear light and converted once at the end, for the
 * reasons in {@link spectralColor}. A single line therefore comes out its own
 * saturated colour and a broadband source comes out white, rather than the
 * yellow-green that averaging gamma-encoded values produces.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Color } from "scenerystack/scenery";
import type { SpectralGroup } from "../model/spectrum.js";
import { encodeSrgb, wavelengthToLinearRgb } from "./spectralColor.js";

/**
 * Derives a beam colour from a set of spectral groups.
 */
export function sourceColorProperty(
  groupsProperty: TReadOnlyProperty<readonly SpectralGroup[]>,
): TReadOnlyProperty<Color> {
  return new DerivedProperty([groupsProperty], (groups) => {
    let red = 0;
    let green = 0;
    let blue = 0;

    for (const group of groups) {
      const [r, g, b] = wavelengthToLinearRgb(group.wavelengthNm);
      red += r * group.weight;
      green += g * group.weight;
      blue += b * group.weight;
    }

    // Brighten to full saturation, then encode — the beam is drawn at whatever
    // brightness reads best, so only its hue is carrying information here.
    const peak = Math.max(red, green, blue);
    const scale = peak > 0 ? 1 / peak : 0;

    return new Color(encodeSrgb(red * scale), encodeSrgb(green * scale), encodeSrgb(blue * scale));
  });
}
