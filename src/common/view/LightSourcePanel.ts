/**
 * LightSourcePanel.ts
 *
 * Picks the source and, for the filtered lamp, sets its wavelength and
 * bandwidth. Shared by the Michelson and Mach-Zehnder screens.
 *
 * The coherence-length readout sits in this panel rather than with the detector
 * readings on purpose: coherence length is a property of the *source*, not of
 * the instrument, and putting the number next to the picker is what makes that
 * point without a word of explanation.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { type Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { ComboBox, type ComboBoxItem } from "scenerystack/sun";
import { BANDWIDTH_RANGE_NM, LABEL_FONT_SIZE, WAVELENGTH_RANGE_NM } from "../../InterferometryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { INTERFEROMETRY_LAB_COMBO_BOX_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../InterferometryLabButtonOptions.js";
import type { LightSourceModel } from "../model/LightSourceModel.js";
import type { SourceType } from "../model/SourceType.js";
import { lengthProperty } from "./formatters.js";
import { InterferometryLabNumberControl } from "./InterferometryLabNumberControl.js";
import { ReadoutBlock } from "./ReadoutBlock.js";
import { TitledPanel } from "./TitledPanel.js";

export type LightSourcePanelOptions = {
  /** Node the combo box's popup list is added to — normally the ScreenView. */
  readonly listParent: Node;

  /** Accessible names for this screen's copy of the controls. */
  readonly accessibleNames: {
    readonly sourcePicker: TReadOnlyProperty<string>;
    readonly wavelength: TReadOnlyProperty<string>;
    readonly bandwidth: TReadOnlyProperty<string>;
  };

  /** Fixed content width so panels in a row match, view pixels. */
  readonly contentWidth?: number;
};

export class LightSourcePanel extends TitledPanel {
  public constructor(model: LightSourceModel, options: LightSourcePanelOptions) {
    const strings = StringManager.getInstance();
    const common = strings.getCommon();
    const units = strings.getUnits();

    const items: ComboBoxItem<SourceType>[] = model.availableTypes.map((type) => {
      const label = type.labelStringProperty(common);
      return {
        value: type,
        createNode: () =>
          new Text(label, {
            font: new PhetFont(LABEL_FONT_SIZE),
            fill: LIGHT_SURFACE_TEXT_FILL,
            maxWidth: 150,
          }),
        accessibleName: label,
      };
    });

    const sourceComboBox = new ComboBox(model.sourceTypeProperty, items, options.listParent, {
      ...INTERFEROMETRY_LAB_COMBO_BOX_OPTIONS,
      accessibleName: options.accessibleNames.sourcePicker,
      listPosition: "below",
      xMargin: 8,
      yMargin: 4,
    });

    const wavelengthControl = new InterferometryLabNumberControl(
      common.wavelengthStringProperty,
      model.filterWavelengthProperty,
      WAVELENGTH_RANGE_NM,
      {
        accessibleName: options.accessibleNames.wavelength,
        valuePattern: units.nanometersStringProperty,
        decimals: 0,
        delta: 1,
        keyboardStep: 5,
        shiftKeyboardStep: 1,
        pageKeyboardStep: 25,
        visibleProperty: model.isFilteredProperty,
      },
    );

    const bandwidthControl = new InterferometryLabNumberControl(
      common.bandwidthStringProperty,
      model.filterBandwidthProperty,
      BANDWIDTH_RANGE_NM,
      {
        accessibleName: options.accessibleNames.bandwidth,
        valuePattern: units.nanometersStringProperty,
        decimals: 1,
        delta: 0.5,
        keyboardStep: 1,
        shiftKeyboardStep: 0.5,
        pageKeyboardStep: 10,
        visibleProperty: model.isFilteredProperty,
      },
    );

    const readouts = new ReadoutBlock([
      {
        label: common.coherenceLengthStringProperty,
        value: lengthProperty(model.coherenceLengthProperty, 1),
      },
      {
        label: common.wavelengthStringProperty,
        value: lengthProperty(model.meanWavelengthProperty, 1),
      },
    ]);

    super(common.lightSourceStringProperty, [sourceComboBox, wavelengthControl, bandwidthControl, readouts], {
      ...(options.contentWidth !== undefined && { contentWidth: options.contentWidth }),
    });
  }
}
