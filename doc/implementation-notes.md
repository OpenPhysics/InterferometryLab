# Implementation Notes - Interferometry Lab

Developer-facing notes on the **SceneryStackTemplate** scaffold. **Replace and expand this file when
forking** to describe your sim's real architecture (see Stern Gerlach or Light Propagation for
target quality). Until then, this documents what the template provides out of the box.

## Architecture Overview

SceneryStackTemplate is the fleet-canonical starting point for new SceneryStack sims (one or N screens).
It demonstrates Model–View separation, color profiles, localization, reset behavior, accessibility
reference wiring, and reusable common components — **without** domain physics.

```
main.ts
  └─ MichelsonScreen             (Screen<MichelsonModel, MichelsonScreenView>)
       ├─ MichelsonModel          state + logic  (src/michelson/model/)  ← stub: add physics here
       └─ MichelsonScreenView     visuals        (src/michelson/view/)
            ├─ MichelsonScreenSummaryContent     (PDOM overview — reference a11y pattern)
            └─ MichelsonKeyboardHelpContent      (keyboard help dialog)

src/common/
  ├─ InterferometryLabPanel.ts           pre-themed panel (uses InterferometryLabColors)
  ├─ InterferometryLabButtonOptions.ts   flat button / combo-box option bundles
  └─ TimeModel.ts          composable play/pause + elapsed time

src/preferences/
  ├─ InterferometryLabPreferencesModel   sim-specific pref state
  ├─ InterferometryLabPreferencesNode    pref UI in Preferences → Simulation
  └─ interferometryLabQueryParameters    QueryStringMachine declarations
```

Data flows Model → View through AXON `Property` objects (`.link()` / `.lazyLink()`). The view never
integrates physics; the model never imports scenery.

## Forking checklist

### Automated rename + scaffold (recommended)

```sh
npm run rename -- --id my-sim --name "My Simulation"
npm run scaffold-screens -- --screens Intro,Lab   # or omit --screens for one screen
npm run check
```

Or from the workspace: `Baton/scripts/create-sim.sh --repo MySim --name "My Simulation"`.

`scripts/rename-sim.ts` updates sim-level identifiers (package id, Colors, Preferences).
`scripts/scaffold-screens.ts` emits fleet-named screen folders and wires main/strings/icons.

### Manual steps (after rename/scaffold or if skipping the scripts)

1. **`doc/model.md`** — educator physics (equations, ranges, simplifications).
2. **`doc/implementation-notes.md`** — this file, rewritten for your architecture.
3. **Screen model(s)** — real Properties, `step(dt)`, `reset()`; compose `TimeModel` if animated.
4. **Screen view(s)** — play area + controls; wire `ResetAllButton` to `model.reset()`.
5. **`*Colors.ts`** — sim palette (default + projector profiles).
6. **Locale JSON** — title, strings, `a11y` keys; register locales in `init.ts`.
7. **`public/icons/icon.svg`** → `npm run icons`; align theme color in `index.html` / vite config.
8. **`tests/setup.ts`** — `init({ name: … })` must match `package.json` name after rename.
9. **`CLAUDE.md`** — sim-specific file map and pitfalls for AI assistants.

## Common components (keep when forking)

### InterferometryLabPanel

Every control panel should use `InterferometryLabPanel` so projector-mode switching is automatic:

```typescript
import { InterferometryLabPanel } from "../../common/InterferometryLabPanel.js";
const panel = new InterferometryLabPanel(content);
const panelWide = new InterferometryLabPanel(content, { xMargin: 20 });
```

### TimeModel

Compose into your screen model for animation (do not subclass `TimeModel`):

```typescript
export class MyModel implements TModel {
  public readonly timer = new TimeModel();  // pass true to auto-play on startup

  public step(dt: number): void {
    this.timer.step(dt);
    // physics uses this.timer.timeProperty.value
  }
  public reset(): void { this.timer.reset(); /* restore initial state */ }
}
```

Wire `TimeControlNode` to `model.timer.isPlayingProperty` in the view.

### InterferometryLabButtonOptions

Spread flat button options into every push/round button and `TimeControlNode` (see `CLAUDE.md`).
Use `INTERFEROMETRY_LAB_COMBO_BOX_OPTIONS` + `LIGHT_SURFACE_TEXT_FILL` for light control surfaces on dark panels.

## Accessibility (reference implementation)

The template is the **canonical OpenPhysics a11y reference**:

- PDOM `accessibleName` on interactive nodes (prefer live `StringProperty`s).
- `MichelsonScreenSummaryContent` with a live `currentDetailsContent` `DerivedProperty` over model state.
- Explicit `pdomOrder` + `MichelsonKeyboardHelpContent`.
- Strings under `a11y` in locale JSON → `StringManager.getMichelsonA11yStrings()`.

Full checklist: [Baton/ACCESSIBILITY.md](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).

## Testing (fleet layout — keep when forking)

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom`; `setupFiles: ["./tests/setup.ts"]`; `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas/AudioContext mocks + `init()` before SceneryStack imports |
| `tests/TimeModel.test.ts` | **Replace** with real model/physics tests mirroring `src/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression |
| `tests/fuzz/fuzz.spec.ts` | Optional Playwright smoke via `?fuzz` |

Run `npm test`. Expand `memory-leak.test.ts` when adding runtime-created nodes or Property links.

## Multi-screen simulations

Default is single-screen. To add screens, see **`doc/multi-screen.md`**: per-screen folders mirroring
`src/michelson/`, `StringManager` screen-name getters, optional shared root model, a shared
`src/common/InterferometryLabScreenIcons.ts` module (`create{Screen}Icon()` factories wired as
`homeScreenIcon` / `navigationBarIcon`), and register all screens in `main.ts`.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).

## Known template stubs (remove when forking)

- `MichelsonModel.step()` / `reset()` — empty placeholders until you add physics.
- Placeholder play-area content in `MichelsonScreenView` — replace with real UI.
- `tests/TimeModel.test.ts` — sample only; add tests for your model under `tests/`.
