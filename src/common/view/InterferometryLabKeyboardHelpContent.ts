/**
 * InterferometryLabKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar),
 * shared by all three screens.
 *
 * The slider section carries the weight here. Every quantity that matters on
 * every screen is set with a slider, and several controls — mirror tilt, the
 * Michelson micrometer, the Fabry-Pérot spacing — only do anything interesting
 * in their smallest steps, which are reached with shift-arrow. A user who
 * drags with the mouse alone will never find them.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class InterferometryLabKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new SliderControlsKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection()]);
  }
}
