/**
 * controlFactory.ts
 *
 * Themed checkboxes and push buttons.
 *
 * These wrap the sun components with this sim's colours and fonts and make the
 * accessible name a required argument rather than an option — a control without
 * one is a bug, and the type system is a better place to catch that than a
 * review checklist.
 */

import type { PhetioProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox, RectangularPushButton } from "scenerystack/sun";
import InterferometryLabColors from "../../InterferometryLabColors.js";
import { LABEL_FONT_SIZE } from "../../InterferometryLabConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../InterferometryLabButtonOptions.js";

/**
 * A checkbox with a text label, themed for the sim's panels.
 *
 * @param property - the boolean it toggles
 * @param label - visible label text
 * @param accessibleName - name announced by a screen reader
 */
export function createCheckbox(
  property: PhetioProperty<boolean>,
  label: TReadOnlyProperty<string>,
  accessibleName: TReadOnlyProperty<string>,
): Checkbox {
  return new Checkbox(
    property,
    new Text(label, {
      font: new PhetFont(LABEL_FONT_SIZE),
      fill: InterferometryLabColors.textColorProperty,
      maxWidth: 165,
    }),
    {
      accessibleName,
      // The box is a light control surface, so its tick and border take the dark
      // on-surface colour — not the panel's text colour, which is near-white in
      // the default profile and would leave the tick invisible.
      checkboxColor: InterferometryLabColors.controlSurfaceTextColorProperty,
      checkboxColorBackground: InterferometryLabColors.controlSurfaceColorProperty,
      spacing: 7,
      boxWidth: 15,
    },
  );
}

/**
 * A flat push button with a text label, themed for the sim's panels.
 *
 * @param label - visible label text
 * @param listener - called when the button fires
 * @param accessibleName - name announced by a screen reader
 */
export function createPushButton(
  label: TReadOnlyProperty<string>,
  listener: () => void,
  accessibleName: TReadOnlyProperty<string>,
): RectangularPushButton {
  return new RectangularPushButton({
    ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    content: new Text(label, {
      font: new PhetFont(LABEL_FONT_SIZE),
      fill: LIGHT_SURFACE_TEXT_FILL,
      maxWidth: 150,
    }),
    baseColor: InterferometryLabColors.controlSurfaceColorProperty,
    listener,
    accessibleName,
    xMargin: 10,
    yMargin: 5,
  });
}
