/**
 * MichelsonTableNode.ts
 *
 * The optical table, seen from above: source, beam splitter, the two arms, and
 * the detector the recombined light falls on.
 *
 * The drawing is schematic and deliberately not to scale. The movable mirror's
 * whole travel is a fifth of a millimetre against a table drawn half a metre
 * wide, so showing it truthfully would show nothing at all; instead the mirror
 * slides by a visible amount proportional to its position, which keeps the
 * cause of the fringe motion visible even though the size is a fiction.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import { BeamPathNode } from "../../common/view/BeamPathNode.js";
import { OpticalTableNode } from "../../common/view/OpticalTableNode.js";
import {
  createBeamSplitterNode,
  createDetectorPlateNode,
  createGasCellNode,
  createGlassPlateNode,
  createMirrorNode,
  createSourceNode,
  createTableLabel,
} from "../../common/view/opticNodes.js";
import { sourceColorProperty } from "../../common/view/sourceColor.js";
import { MICHELSON_COARSE_RANGE_NM } from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MichelsonModel } from "../model/MichelsonModel.js";

/** Table size, view pixels. */
const TABLE_WIDTH = 440;
const TABLE_HEIGHT = 252;

/** Component positions in table-local coordinates, view pixels. */
const SOURCE = new Vector2(48, 140);
const SPLITTER = new Vector2(158, 140);
const FIXED_MIRROR = new Vector2(360, 140);
const MOVABLE_MIRROR = new Vector2(158, 44);
const DETECTOR = new Vector2(158, 228);
const COMPENSATOR = new Vector2(252, 140);
const GAS_CELL = new Vector2(158, 94);

/** Width of the mirrors and plates, view pixels. */
const OPTIC_WIDTH = 46;

/**
 * How far the movable mirror slides on screen at the end of its travel, view
 * pixels. Purely illustrative — see the class comment.
 */
const MIRROR_TRAVEL_PIXELS = 14;

export class MichelsonTableNode extends Node {
  public constructor(model: MichelsonModel) {
    super();

    const strings = StringManager.getInstance();
    const common = strings.getCommon();
    const michelson = strings.getMichelsonStrings();

    const beamColor = sourceColorProperty(model.lightSource.groupsProperty);
    const table = new OpticalTableNode(TABLE_WIDTH, TABLE_HEIGHT);

    // ── Beams ────────────────────────────────────────────────────────────────
    // Drawn before the components so the hardware sits on top of the light.
    const beams = new Node({
      children: [
        new BeamPathNode([SOURCE, SPLITTER], beamColor),
        new BeamPathNode([SPLITTER, FIXED_MIRROR], beamColor),
        new BeamPathNode([SPLITTER, MOVABLE_MIRROR], beamColor),
        new BeamPathNode([SPLITTER, DETECTOR], beamColor),
      ],
    });

    // ── Components ───────────────────────────────────────────────────────────
    const source = createSourceNode(52, 24, beamColor);
    source.translation = SOURCE;

    const splitter = createBeamSplitterNode(OPTIC_WIDTH + 10);
    splitter.translation = SPLITTER;

    // Reflective face towards the splitter, i.e. pointing back along −x.
    const fixedMirror = createMirrorNode(OPTIC_WIDTH);
    fixedMirror.rotation = -Math.PI / 2;
    fixedMirror.translation = FIXED_MIRROR;

    const movableMirror = createMirrorNode(OPTIC_WIDTH);
    movableMirror.rotation = Math.PI;

    const compensator = createGlassPlateNode(OPTIC_WIDTH + 10);
    compensator.rotation = Math.PI / 4;
    compensator.translation = COMPENSATOR;
    compensator.visibleProperty = model.compensatorPlateProperty;

    const gasFillProperty: TReadOnlyProperty<number> = new DerivedProperty(
      [model.gasCellPressureProperty],
      (pressureKPa) => pressureKPa / model.gasCellPressureProperty.range.max,
    );
    const gasCell = createGasCellNode(34, 30, gasFillProperty);
    gasCell.rotation = Math.PI / 2;
    gasCell.translation = GAS_CELL;
    gasCell.visibleProperty = model.gasCellEnabledProperty;

    const detector = createDetectorPlateNode(OPTIC_WIDTH);
    detector.translation = DETECTOR;

    // The mirror's drawn position tracks its real one, scaled up enormously so
    // that the control visibly does something.
    model.mirrorOffsetProperty.link((offsetNm) => {
      const fraction = offsetNm / MICHELSON_COARSE_RANGE_NM.max;
      movableMirror.translation = MOVABLE_MIRROR.plusXY(0, -MIRROR_TRAVEL_PIXELS * fraction);
    });

    // ── Labels ───────────────────────────────────────────────────────────────
    const sourceLabel = createTableLabel(common.sourceStringProperty);
    sourceLabel.centerX = SOURCE.x - 12;
    sourceLabel.bottom = SOURCE.y - 18;

    const splitterLabel = createTableLabel(common.beamSplitterStringProperty);
    splitterLabel.centerX = SPLITTER.x + 4;
    splitterLabel.top = SPLITTER.y + 26;

    const movableLabel = createTableLabel("M₁");
    movableLabel.right = MOVABLE_MIRROR.x - 32;
    movableLabel.centerY = MOVABLE_MIRROR.y;

    const fixedLabel = createTableLabel("M₂");
    fixedLabel.centerX = FIXED_MIRROR.x;
    fixedLabel.bottom = FIXED_MIRROR.y - 30;

    const detectorLabel = createTableLabel(common.detectorStringProperty);
    detectorLabel.centerX = DETECTOR.x + 4;
    detectorLabel.top = DETECTOR.y + 12;

    const compensatorLabel = createTableLabel(michelson.compensatorPlateStringProperty);
    compensatorLabel.centerX = COMPENSATOR.x + 10;
    compensatorLabel.bottom = COMPENSATOR.y - 28;
    compensatorLabel.visibleProperty = model.compensatorPlateProperty;
    compensatorLabel.maxWidth = 120;

    const gasCellLabel = createTableLabel(michelson.gasCellStringProperty);
    gasCellLabel.left = GAS_CELL.x + 24;
    gasCellLabel.centerY = GAS_CELL.y;
    gasCellLabel.visibleProperty = model.gasCellEnabledProperty;

    this.children = [
      table,
      beams,
      source,
      splitter,
      compensator,
      gasCell,
      fixedMirror,
      movableMirror,
      detector,
      sourceLabel,
      splitterLabel,
      movableLabel,
      fixedLabel,
      detectorLabel,
      compensatorLabel,
      gasCellLabel,
    ];
  }
}
