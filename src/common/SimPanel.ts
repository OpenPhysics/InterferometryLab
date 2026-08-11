/**
 * SimPanel.ts
 *
 * A pre-themed Panel that automatically uses SimColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { SimPanel } from "../../common/SimPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new SimPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new SimPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new SimPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import SimColors from "../SimColors.js";
import { PANEL_CORNER_RADIUS } from "../SimConstants.js";

export type SimPanelOptions = PanelOptions;

export class SimPanel extends Panel {
  public constructor(content: Node, providedOptions?: SimPanelOptions) {
    const options = optionize<SimPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: SimColors.panelBackgroundColorProperty,
        stroke: SimColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
