/**
 * MachZehnderArmsPanel.ts
 *
 * Path imbalance and mirror tilt — the two ways to change what the recombined
 * beams do.
 *
 * The imbalance range is only a few wavelengths wide. That is not a limitation
 * of the model but of the instrument: a Mach-Zehnder's arms are fixed by where
 * its optics are bolted down, so in use it is a device for detecting a change of
 * a fraction of a wavelength, not for hunting across millimetres the way a
 * Michelson's movable mirror does.
 */

import { InterferometryLabNumberControl } from "../../common/view/InterferometryLabNumberControl.js";
import { TitledPanel } from "../../common/view/TitledPanel.js";
import { MIRROR_TILT_RANGE_URAD, PATH_IMBALANCE_RANGE_NM } from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MachZehnderModel } from "../model/MachZehnderModel.js";

export class MachZehnderArmsPanel extends TitledPanel {
  public constructor(model: MachZehnderModel, contentWidth: number) {
    const strings = StringManager.getInstance();
    const machZehnder = strings.getMachZehnderStrings();
    const units = strings.getUnits();
    const a11y = strings.getMachZehnderA11yStrings().controls;

    const imbalanceControl = new InterferometryLabNumberControl(
      machZehnder.pathImbalanceStringProperty,
      model.pathImbalanceProperty,
      PATH_IMBALANCE_RANGE_NM,
      {
        accessibleName: a11y.pathImbalanceStringProperty,
        valuePattern: units.nanometersStringProperty,
        decimals: 0,
        delta: 1,
        keyboardStep: 25,
        shiftKeyboardStep: 5,
        pageKeyboardStep: 250,
        majorTicks: [{ value: 0, label: "0" }],
      },
    );

    // Both axes, as on the Michelson. The model has always carried a vertical
    // tilt and fed it into the wedge term; without a control for it the fringes
    // could only ever be made vertical, which quietly implies that is the only
    // orientation a wedge can have.
    const tiltHorizontalControl = new InterferometryLabNumberControl(
      machZehnder.tiltHorizontalStringProperty,
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
      machZehnder.tiltVerticalStringProperty,
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

    super(machZehnder.armsStringProperty, [imbalanceControl, tiltHorizontalControl, tiltVerticalControl], {
      contentWidth,
    });
  }
}
