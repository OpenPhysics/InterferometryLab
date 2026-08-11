/**
 * FabryPerotScreenView.ts
 *
 * The top-level view for the simulation screen.
 *
 * All visual nodes are added here. Follow these conventions:
 *   - Use this.layoutBounds for positioning (never magic pixel values)
 *   - Keep a ResetAllButton that calls model.reset() and this.reset()
 *   - Override step(dt) for frame-by-frame animation
 *
 * ── Adding content ────────────────────────────────────────────────────────────
 * 1. Create Node subclasses in separate files (e.g. InterferometryLabControlPanel.ts)
 * 2. Instantiate them here and call this.addChild(...)
 * 3. Link them to model properties:
 *      model.isRunningProperty.link( isRunning => { ... } );
 *
 * ── Layout bounds ─────────────────────────────────────────────────────────────
 * SceneryStack uses a virtual 1024×618 coordinate space by default.
 * this.layoutBounds gives you the full rectangle; use it for alignment:
 *   center, minX, maxX, minY, maxY, width, height
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/InterferometryLabButtonOptions.js";
import InterferometryLabColors from "../../InterferometryLabColors.js";
import { SCREEN_VIEW_MARGIN } from "../../InterferometryLabConstants.js";
import type { FabryPerotModel } from "../model/FabryPerotModel.js";
import { FabryPerotScreenSummaryContent } from "./FabryPerotScreenSummaryContent.js";

export type FabryPerotScreenViewOptions = ScreenViewOptions;

export class FabryPerotScreenView extends ScreenView {
  public constructor(model: FabryPerotModel, providedOptions?: FabryPerotScreenViewOptions) {
    // ── Accessibility: screen summary ───────────────────────────────────────────
    // The screen summary is the first thing a screen-reader user encounters. It
    // is registered here, in the ScreenView's super() options, so every sim wires
    // it the same way. See FabryPerotScreenSummaryContent for the four content regions.
    const options = optionize<FabryPerotScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new FabryPerotScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    // ── Background ────────────────────────────────────────────────────────────
    // A full-screen rectangle that follows the active color profile.
    // Replace or remove once you add real content.
    const backgroundRect = new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: InterferometryLabColors.backgroundColorProperty,
    });
    this.addChild(backgroundRect);

    // ── Placeholder label ─────────────────────────────────────────────────────
    // Replace this with your actual simulation content.
    const placeholderText = new Text("Fabry-Perot", {
      font: "bold 36px sans-serif",
      fill: InterferometryLabColors.textColorProperty,
      center: this.layoutBounds.center,
    });
    this.addChild(placeholderText);

    // ── Accessibility: per-control names ────────────────────────────────────────
    // EVERY interactive node must carry an `accessibleName` (and an
    // `accessibleHelpText` where useful), sourced from the StringManager `a11y`
    // string group — never a hard-coded English literal. Sun/scenery-phet controls
    // (NumberControl, Checkbox, ComboBox, AquaRadioButtonGroup, …) accept it as an
    // option; a draggable plain Node needs `tagName: "div", focusable: true` too.
    // Example (uncomment and adapt when you add a real control):
    //
    //   const a11y = StringManager.getInstance().getFabryPerotA11yStrings();
    //   const exampleButton = new RectangularPushButton({
    //     ...FLAT_RECTANGULAR_BUTTON_OPTIONS, // flat appearance, not SceneryStack's default 3-D look
    //     content: someIcon,
    //     listener: () => model.doSomething(),
    //     accessibleName: a11y.controls.exampleControlStringProperty,
    //   });
    //   this.addChild(exampleButton);

    // ── Reset All button ──────────────────────────────────────────────────────
    // Always position at bottom-right (PhET convention).
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // ── Accessibility: keyboard / reading traversal order ───────────────────────
    // Make the parallel DOM (Tab order and screen-reader reading order)
    // deterministic and independent of child z-order. ScreenView throws if you
    // set pdomOrder on itself, so add a lightweight wrapper Node that "borrows"
    // the interactive nodes in the order a user should reach them — Reset All
    // last. Non-interactive decoration (background, placeholder) is omitted.
    this.addChild(
      new Node({
        pdomOrder: [
          // TODO: add the sim's interactive nodes here, in traversal order
          resetAllButton,
        ],
      }),
    );
  }

  /**
   * Resets view-side state (animations, panel visibility, etc.).
   * Called by the Reset All button listener.
   */
  public reset(): void {
    // TODO: reset any view-side state here
  }

  /**
   * Steps the view forward by dt seconds for animation.
   * @param _dt - elapsed time in seconds
   */
  public override step(_dt: number): void {
    // TODO: implement animation updates here
  }
}
