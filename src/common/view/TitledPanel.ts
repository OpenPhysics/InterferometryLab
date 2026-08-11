/**
 * TitledPanel.ts
 *
 * A control panel with a heading: the shape every panel in this sim takes.
 *
 * The heading is a plain Text rather than an accessible heading element — the
 * controls inside carry their own accessible names, and the panel is grouping,
 * not structure a screen-reader user needs to navigate by.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import InterferometryLabColors from "../../InterferometryLabColors.js";
import { PANEL_CONTENT_SPACING, TITLE_FONT_SIZE } from "../../InterferometryLabConstants.js";
import { InterferometryLabPanel, type InterferometryLabPanelOptions } from "../InterferometryLabPanel.js";

export type TitledPanelOptions = InterferometryLabPanelOptions & {
  /** Fixed content width, view pixels. Panels in a row look best equally wide. */
  readonly contentWidth?: number;
};

export class TitledPanel extends InterferometryLabPanel {
  public constructor(
    title: TReadOnlyProperty<string> | string,
    content: readonly Node[],
    providedOptions?: TitledPanelOptions,
  ) {
    const heading = new Text(title, {
      font: new PhetFont({ size: TITLE_FONT_SIZE, weight: "bold" }),
      fill: InterferometryLabColors.textColorProperty,
    });

    const box = new VBox({
      align: "left",
      spacing: PANEL_CONTENT_SPACING,
      stretch: true,
      children: [heading, ...content],
      ...(providedOptions?.contentWidth !== undefined && {
        preferredWidth: providedOptions.contentWidth,
      }),
    });

    super(box, providedOptions);
  }
}
