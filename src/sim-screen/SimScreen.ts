/**
 * SimScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * For multi-screen simulations, run `npm run scaffold-screens` (preferred) or
 * duplicate this file (e.g. IntroScreen.ts, LabScreen.ts), add each screen to the
 * screens array in src/main.ts, and put shared create*Icon() factories in
 * src/common/{SimName}ScreenIcons.ts (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import SimColors from "../SimColors.js";
import { SimModel } from "./model/SimModel.js";
import { SimKeyboardHelpContent } from "./view/SimKeyboardHelpContent.js";
import { SimScreenView } from "./view/SimScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SimScreenOptions = ScreenOptions & { tandem: Tandem };

export class SimScreen extends Screen<SimModel, SimScreenView> {
  public constructor(options: SimScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SimModel(),
      // View factory — receives the model instance
      (model) =>
        new SimScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SimScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SimColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SimKeyboardHelpContent(),
        },
        options,
      ),
    );
  }
}
