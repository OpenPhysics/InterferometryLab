/**
 * MichelsonAlignmentPanel.ts
 *
 * Tilt of the fixed mirror, and the compensator plate.
 *
 * Tilt is what decides which *kind* of fringes appear. With the mirrors exactly
 * parallel the only thing varying across the field is the ray angle, so the
 * fringes are circles. Tilt one mirror and the path difference starts varying
 * linearly across the beam as well; once that wedge dominates, the circles
 * straighten into parallel bars. Both live in the same equation — this panel is
 * where a student can drive between them.
 */

import { createCheckbox } from "../../common/view/controlFactory.js";
import { InterferometryLabNumberControl } from "../../common/view/InterferometryLabNumberControl.js";
import { TitledPanel } from "../../common/view/TitledPanel.js";
import { MIRROR_TILT_RANGE_URAD } from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MichelsonModel } from "../model/MichelsonModel.js";

export class MichelsonAlignmentPanel extends TitledPanel {
  public constructor(model: MichelsonModel, contentWidth: number) {
    const strings = StringManager.getInstance();
    const michelson = strings.getMichelsonStrings();
    const units = strings.getUnits();
    const a11y = strings.getMichelsonA11yStrings().controls;

    const tiltHorizontalControl = new InterferometryLabNumberControl(
      michelson.tiltHorizontalStringProperty,
      model.tiltHorizontalProperty,
      MIRROR_TILT_RANGE_URAD,
      {
        accessibleName: a11y.tiltHorizontalStringProperty,
        valuePattern: units.microradiansStringProperty,
        decimals: 0,
        delta: 1,
        keyboardStep: 5,
        shiftKeyboardStep: 1,
        pageKeyboardStep: 50,
        majorTicks: [{ value: 0, label: "0" }],
      },
    );

    const tiltVerticalControl = new InterferometryLabNumberControl(
      michelson.tiltVerticalStringProperty,
      model.tiltVerticalProperty,
      MIRROR_TILT_RANGE_URAD,
      {
        accessibleName: a11y.tiltVerticalStringProperty,
        valuePattern: units.microradiansStringProperty,
        decimals: 0,
        delta: 1,
        keyboardStep: 5,
        shiftKeyboardStep: 1,
        pageKeyboardStep: 50,
        majorTicks: [{ value: 0, label: "0" }],
      },
    );

    const compensatorCheckbox = createCheckbox(
      model.compensatorPlateProperty,
      michelson.compensatorPlateStringProperty,
      a11y.compensatorPlateStringProperty,
    );

    super(michelson.alignmentStringProperty, [tiltHorizontalControl, tiltVerticalControl, compensatorCheckbox], {
      contentWidth,
    });
  }
}
