/**
 * SimKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * The template's only interactions are buttons and Reset All, so a single
 * basic-actions section covers the available keyboard controls. Add a slider or
 * combo-box section here as the simulation grows.
 */

import { BasicActionsKeyboardHelpSection, TwoColumnKeyboardHelpContent } from "scenerystack/scenery-phet";

export class SimKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], []);
  }
}
