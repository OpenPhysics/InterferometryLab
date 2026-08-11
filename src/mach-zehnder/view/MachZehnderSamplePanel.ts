/**
 * MachZehnderSamplePanel.ts
 *
 * The insertable sample slide — the interferometer used as a measuring
 * instrument rather than a demonstration.
 *
 * A slide of thickness t and index n replaces t of air with t of glass, adding
 * t(n − 1) to that arm and shifting the fringes by t(n − 1)/λ of a period.
 * Twenty micrometres of ordinary crown glass is worth about eighteen fringes at
 * 633 nm, which is why this is a practical way to measure the thickness of
 * something far too thin to put a micrometer on.
 *
 * Tilting the slide lengthens the route through it, so the shift can be swept
 * continuously instead of jumping between whatever thicknesses are to hand.
 */

import { createCheckbox } from "../../common/view/controlFactory.js";
import { lengthProperty } from "../../common/view/formatters.js";
import { InterferometryLabNumberControl } from "../../common/view/InterferometryLabNumberControl.js";
import { ReadoutBlock } from "../../common/view/ReadoutBlock.js";
import { TitledPanel } from "../../common/view/TitledPanel.js";
import {
  SAMPLE_INDEX_RANGE,
  SAMPLE_THICKNESS_RANGE_UM,
  SAMPLE_TILT_RANGE_DEG,
} from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MachZehnderModel } from "../model/MachZehnderModel.js";

export class MachZehnderSamplePanel extends TitledPanel {
  public constructor(model: MachZehnderModel, contentWidth: number) {
    const strings = StringManager.getInstance();
    const machZehnder = strings.getMachZehnderStrings();
    const units = strings.getUnits();
    const a11y = strings.getMachZehnderA11yStrings().controls;

    const insertCheckbox = createCheckbox(
      model.sampleEnabledProperty,
      machZehnder.insertSampleStringProperty,
      a11y.insertSampleStringProperty,
    );

    const thicknessControl = new InterferometryLabNumberControl(
      machZehnder.thicknessStringProperty,
      model.sampleThicknessProperty,
      SAMPLE_THICKNESS_RANGE_UM,
      {
        accessibleName: a11y.thicknessStringProperty,
        valuePattern: units.micrometersStringProperty,
        decimals: 1,
        delta: 0.1,
        keyboardStep: 1,
        shiftKeyboardStep: 0.1,
        pageKeyboardStep: 10,
        enabledProperty: model.sampleEnabledProperty,
      },
    );

    const indexControl = new InterferometryLabNumberControl(
      machZehnder.indexStringProperty,
      model.sampleIndexProperty,
      SAMPLE_INDEX_RANGE,
      {
        accessibleName: a11y.indexStringProperty,
        decimals: 3,
        delta: 0.001,
        keyboardStep: 0.01,
        shiftKeyboardStep: 0.001,
        pageKeyboardStep: 0.1,
        enabledProperty: model.sampleEnabledProperty,
      },
    );

    const tiltControl = new InterferometryLabNumberControl(
      machZehnder.slideTiltStringProperty,
      model.sampleTiltProperty,
      SAMPLE_TILT_RANGE_DEG,
      {
        accessibleName: a11y.slideTiltStringProperty,
        valuePattern: units.degreesStringProperty,
        decimals: 1,
        delta: 0.1,
        keyboardStep: 1,
        shiftKeyboardStep: 0.1,
        pageKeyboardStep: 5,
        enabledProperty: model.sampleEnabledProperty,
      },
    );

    const readouts = new ReadoutBlock([
      { label: machZehnder.addedPathStringProperty, value: lengthProperty(model.samplePathProperty, 2) },
    ]);

    super(machZehnder.sampleStringProperty, [insertCheckbox, thicknessControl, indexControl, tiltControl, readouts], {
      contentWidth,
    });
  }
}
