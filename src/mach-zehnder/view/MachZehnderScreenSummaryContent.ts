/**
 * MachZehnderScreenSummaryContent.ts
 *
 * The accessible screen summary for the Mach-Zehnder screen.
 *
 * The live paragraph always reports *both* ports. A non-visual user cannot see
 * the two detectors side by side, and the complementarity between them is the
 * one thing this screen exists to show, so it has to be in the sentence rather
 * than left to be inferred from a picture.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { countProperty, lengthProperty, percentProperty } from "../../common/view/formatters.js";
import { StringManager } from "../../i18n/StringManager.js";
import { BeamMode } from "../model/BeamMode.js";
import type { MachZehnderModel } from "../model/MachZehnderModel.js";

export class MachZehnderScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: MachZehnderModel) {
    const strings = StringManager.getInstance();
    const a11y = strings.getMachZehnderA11yStrings();

    const photonDetailProperty = new DerivedProperty(
      [
        a11y.photonDetailStringProperty,
        countProperty(model.photonsEmittedProperty),
        countProperty(model.countsAProperty),
        countProperty(model.countsBProperty),
      ],
      (pattern, emitted, countsA, countsB) => StringUtils.fillIn(pattern, { emitted, countsA, countsB }),
    );

    const modeDetailProperty = new DerivedProperty(
      [
        model.beamModeProperty,
        model.whichPathProperty,
        a11y.classicalDetailStringProperty,
        photonDetailProperty,
        a11y.whichPathDetailStringProperty,
      ],
      (mode, whichPath, classical, photon, whichPathDetail) => {
        const base = mode === BeamMode.SINGLE_PHOTON ? photon : classical;
        return whichPath ? `${base} ${whichPathDetail}` : base;
      },
    );

    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsStringProperty,
        lengthProperty(model.pathDifferenceProperty, 0),
        percentProperty(model.portAFractionProperty, 0),
        percentProperty(model.portBFractionProperty, 0),
        modeDetailProperty,
      ],
      (pattern, pathDifference, portA, portB, modeDetail) =>
        StringUtils.fillIn(pattern, { pathDifference, portA, portB, modeDetail }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
