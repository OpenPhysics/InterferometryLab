/**
 * FabryPerotScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createFabryPerotIcon() in src/common/InterferometryLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createFabryPerotIcon } from "../common/InterferometryLabScreenIcons.js";
import InterferometryLabColors from "../InterferometryLabColors.js";
import { FabryPerotModel } from "./model/FabryPerotModel.js";
import { FabryPerotKeyboardHelpContent } from "./view/FabryPerotKeyboardHelpContent.js";
import { FabryPerotScreenView } from "./view/FabryPerotScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type FabryPerotScreenOptions = ScreenOptions & { tandem: Tandem };

export class FabryPerotScreen extends Screen<FabryPerotModel, FabryPerotScreenView> {
  public constructor(options: FabryPerotScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new FabryPerotModel(),
      // View factory — receives the model instance
      (model) =>
        new FabryPerotScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<FabryPerotScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: InterferometryLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new FabryPerotKeyboardHelpContent(),
          homeScreenIcon: createFabryPerotIcon(),
          navigationBarIcon: createFabryPerotIcon(),
        },
        options,
      ),
    );
  }
}
