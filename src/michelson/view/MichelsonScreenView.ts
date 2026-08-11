/**
 * MichelsonScreenView.ts
 *
 * Layout: the optical table and the detector across the top, the control panels
 * in a row underneath.
 *
 * The table and the detector sit side by side because they are two views of the
 * same instant — the table shows what the student changed, the detector shows
 * what it did to the light — and the whole point of the screen is the link
 * between them.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/InterferometryLabButtonOptions.js";
import { DetectorScreenNode } from "../../common/view/DetectorScreenNode.js";
import { lengthProperty, percentProperty } from "../../common/view/formatters.js";
import { LightSourcePanel } from "../../common/view/LightSourcePanel.js";
import { ReadoutBlock } from "../../common/view/ReadoutBlock.js";
import {
  CONTROL_PANEL_WIDTH,
  DETECTOR_VIEW_SIZE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
} from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MichelsonModel } from "../model/MichelsonModel.js";
import { MichelsonAlignmentPanel } from "./MichelsonAlignmentPanel.js";
import { MichelsonGasCellPanel } from "./MichelsonGasCellPanel.js";
import { MichelsonMirrorPanel } from "./MichelsonMirrorPanel.js";
import { MichelsonScreenSummaryContent } from "./MichelsonScreenSummaryContent.js";
import { MichelsonTableNode } from "./MichelsonTableNode.js";

export type MichelsonScreenViewOptions = ScreenViewOptions;

/** Width of each panel's content in the bottom row, view pixels. */
const PANEL_CONTENT_WIDTH = CONTROL_PANEL_WIDTH - 24;

export class MichelsonScreenView extends ScreenView {
  public constructor(model: MichelsonModel, providedOptions?: MichelsonScreenViewOptions) {
    const options = optionize<MichelsonScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new MichelsonScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance();
    const common = strings.getCommon();
    const a11y = strings.getMichelsonA11yStrings().controls;

    // Combo-box popups must be added above everything else, so they get their
    // own layer created before the content that opens them.
    const popupLayer = new Node();

    // ── Top row: the table, and the detector it feeds ────────────────────────
    const tableNode = new MichelsonTableNode(model);

    const detectorNode = new DetectorScreenNode(model.fringeSpecProperty, {
      size: DETECTOR_VIEW_SIZE,
      title: common.detectorStringProperty,
    });

    const detectorReadouts = new ReadoutBlock([
      { label: common.pathDifferenceStringProperty, value: lengthProperty(model.pathDifferenceProperty, 1) },
      { label: common.visibilityStringProperty, value: percentProperty(model.visibilityProperty, 0) },
    ]);

    // The readings sit bare under the detector rather than in a panel: they
    // describe the image directly above them, and a panel border here would
    // read as a second, separate control group.
    const detectorColumn = new VBox({
      spacing: PANEL_SPACING,
      align: "center",
      children: [detectorNode, detectorReadouts],
    });

    const topRow = new HBox({
      spacing: PANEL_SPACING + 8,
      align: "top",
      children: [tableNode, detectorColumn],
    });
    topRow.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;
    topRow.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;

    // ── Bottom row: the controls ─────────────────────────────────────────────
    const sourcePanel = new LightSourcePanel(model.lightSource, {
      listParent: popupLayer,
      accessibleNames: {
        sourcePicker: a11y.sourcePickerStringProperty,
        wavelength: a11y.wavelengthStringProperty,
        bandwidth: a11y.bandwidthStringProperty,
      },
      contentWidth: PANEL_CONTENT_WIDTH,
    });

    const mirrorPanel = new MichelsonMirrorPanel(model, PANEL_CONTENT_WIDTH);
    const alignmentPanel = new MichelsonAlignmentPanel(model, PANEL_CONTENT_WIDTH);
    const gasCellPanel = new MichelsonGasCellPanel(model, PANEL_CONTENT_WIDTH);

    const controlRow = new HBox({
      spacing: PANEL_SPACING,
      align: "top",
      children: [sourcePanel, mirrorPanel, alignmentPanel, gasCellPanel],
    });
    controlRow.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;
    controlRow.top = topRow.bottom + PANEL_SPACING;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [topRow, controlRow, resetAllButton, popupLayer];

    // ── Traversal order ──────────────────────────────────────────────────────
    // Source first (it sets what everything else acts on), then the mirror that
    // drives the fringes, then alignment and the cell, then Reset All.
    this.addChild(
      new Node({
        pdomOrder: [sourcePanel, mirrorPanel, alignmentPanel, gasCellPanel, resetAllButton],
      }),
    );
  }

  public reset(): void {
    // All state lives in the model; there is no view-side state to restore.
  }

  public override step(_dt: number): void {
    // The pattern repaints when the model changes, not on a clock.
  }
}
