/**
 * MachZehnderKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 *
 * The slider section carries the weight here. Every quantity on this screen that
 * matters is set with a slider, and several of them — the micrometer, the mirror
 * tilt — only do anything interesting in their smallest steps, which are reached
 * with shift-arrow. A user who drags with the mouse alone will never find them.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class MachZehnderKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new SliderControlsKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection()]);
  }
}
