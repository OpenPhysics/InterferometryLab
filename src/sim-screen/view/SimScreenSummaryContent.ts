/**
 * SimScreenSummaryContent.ts
 *
 * The accessible screen summary read by screen readers (SceneryStack's
 * Interactive Description). It appears at the top of the parallel DOM and gives
 * a non-visual user a way to orient themselves and to re-read the simulation's
 * current state at any time.
 *
 * A summary has four regions (all optional, but provide at least the first
 * three in every sim for consistency across OpenPhysics):
 *   - playAreaContent       — what the play area contains
 *   - controlAreaContent    — what the controls do
 *   - currentDetailsContent — a LIVE paragraph describing current state
 *   - interactionHintContent — a short hint on how to get started
 *
 * ── Making "current details" live ─────────────────────────────────────────────
 * The template has no model state, so currentDetails is a static string. In a
 * real sim, build a DerivedProperty over the relevant model Properties and pass
 * it as `currentDetailsContent` so the paragraph updates as the sim runs.
 * See LunarLander/src/.../LunarLanderScreenSummaryContent.ts for the pattern.
 */
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { SimModel } from "../model/SimModel.js";

export class SimScreenSummaryContent extends ScreenSummaryContent {
  // `model` is unused in the template but kept in the signature so real sims can
  // derive a live currentDetailsContent from it without changing call sites.
  public constructor(_model: SimModel) {
    const a11y = StringManager.getInstance().getA11yStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: a11y.currentDetailsStringProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
