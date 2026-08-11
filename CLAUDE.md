# CLAUDE.md — Interferometry Lab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Reusable SceneryStack template (one or N screens) and **canonical accessibility reference** for
OpenPhysics sims. Prefer `Baton/scripts/create-sim.sh` (or GitHub **Use this template** +
`npm run rename` + `npm run scaffold-screens`) to fork it. For multi-screen sims, see
[`doc/multi-screen.md`](doc/multi-screen.md).

## Key files

| File | Purpose |
|---|---|
| `src/InterferometryLabColors.ts` | All `ProfileColorProperty` instances |
| `src/InterferometryLabConstants.ts` | Named numeric constants (layout px, physics SI units) |
| `src/InterferometryLabNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/michelson/MichelsonScreen.ts` | Screen wrapper |
| `src/michelson/model/MichelsonModel.ts` | Simulation state and logic |
| `src/michelson/view/MichelsonScreenView.ts` | Visual nodes, layout, `screenSummaryContent` + `pdomOrder` |
| `src/michelson/view/MichelsonScreenSummaryContent.ts` | Accessible screen summary (reference a11y pattern) |
| `src/michelson/view/MichelsonKeyboardHelpContent.ts` | Keyboard-help dialog content |
| `src/common/InterferometryLabPanel.ts` | Pre-themed `Panel` wrapper (uses `InterferometryLabColors` automatically) |
| `src/common/InterferometryLabButtonOptions.ts` | Flat button-appearance option bundles + light-control-surface combo-box options |
| `src/common/TimeModel.ts` | Composable play/pause + elapsed-time model for animated sims |
| `scripts/generate-icons.ts` | PNG icons from `public/icons/icon.svg` |
| `scripts/rename-sim.ts` | Sim-level fork/rename (package id + metadata, Colors, Constants, Panel, ButtonOptions, Preferences) |
| `scripts/scaffold-screens.ts` | Emit N screen packages + wire main/strings/icons |

## Common components

### InterferometryLabPanel

Every control panel and info box in the sim should use `InterferometryLabPanel` so that
default/projector color switching is automatic:

```typescript
import { InterferometryLabPanel } from "../../common/InterferometryLabPanel.js";
const panel = new InterferometryLabPanel(content);              // uses InterferometryLabColors defaults
const panel = new InterferometryLabPanel(content, { xMargin: 20 }); // override any PanelOption
```

### TimeModel

For simulations with animation, compose `TimeModel` into your screen model:

```typescript
import { TimeModel } from "../../common/TimeModel.js";

export class MyModel implements TModel {
  public readonly timer = new TimeModel();   // starts paused; pass true to auto-play

  public step(dt: number): void {
    this.timer.step(dt);
    // use this.timer.timeProperty.value for physics
  }
  public reset(): void { this.timer.reset(); /* … */ }
}
```

Wire the view to `TimeControlNode` from `scenerystack/scenery-phet` binding on
`model.timer.isPlayingProperty`.

### InterferometryLabButtonOptions

SceneryStack's push/round buttons default to a 3-D/beveled look; every button in the sim
should be flat instead. Spread these into the relevant options object:

```typescript
import { FLAT_RESET_ALL_BUTTON_OPTIONS, FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../../common/InterferometryLabButtonOptions.js";

const resetAllButton = new ResetAllButton({ ...FLAT_RESET_ALL_BUTTON_OPTIONS, listener: () => {...} });
const exampleButton = new RectangularPushButton({ ...FLAT_RECTANGULAR_BUTTON_OPTIONS, content, listener });
```

`FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS` spreads into `TimeControlNode`'s `playPauseStepButtonOptions`;
`TIME_CONTROL_SPEED_RADIO_OPTIONS` fixes `TimeControlNode`'s speed-radio label color, which
otherwise defaults to black text on the sim's dark default-mode panels. `INTERFEROMETRY_LAB_COMBO_BOX_OPTIONS`
themes a `ComboBox`'s button/list chrome to the light control surface below; pair item labels
with `LIGHT_SURFACE_TEXT_FILL` (not `InterferometryLabColors.textColorProperty`, which is for panel-fill text).

`InterferometryLabColors.ts` backs this with a "light control surfaces" section —
`controlSurfaceColorProperty`, `controlSurfaceDisabledColorProperty`,
`controlSurfaceTextColorProperty` — identical white/dark-text values in both default and
projector profiles, so any component that must stay light regardless of theme (combo boxes,
flat buttons, editable fields) keeps readable contrast automatically.

## Accessibility

This template is the **canonical accessibility reference** for OpenPhysics sims. It ships with
the three required layers wired up: PDOM names, a `MichelsonScreenSummaryContent`, and an explicit
`pdomOrder` + `MichelsonKeyboardHelpContent`. A11y strings live under the `a11y` key in each locale
JSON, exposed via `StringManager.getMichelsonA11yStrings()`. When building a real sim, make
`currentDetailsContent` a live `DerivedProperty` over model state and add `accessibleName`s to
every interactive node. Full convention and checklist: [Baton/ACCESSIBILITY.md](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).

## Compliance carve-outs

A clean fork of this template rarely needs compliance carve-outs — root `InterferometryLabConstants.ts`,
`*Colors.ts`, `*Namespace.ts`, standard screen layout, and full a11y wiring pass Baton's
compliance check out of the box. Document carve-outs in the forked sim's `CLAUDE.md` only when
you introduce a deliberate deviation (nested constants, hardcoded interaction fills, etc.).

## Testing

Fleet-standard Vitest layout (keep when forking):

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment; `setupFiles: ["./tests/setup.ts"]`; `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/TimeModel.test.ts` | Sample model unit tests — replace with real physics tests |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |
| `tests/fuzz/fuzz.spec.ts` | Optional Playwright fuzz smoke via joist `?fuzz` |
| `playwright.config.ts` | Chromium project + Vite webServer for fuzz |

- Put unit tests only under root `tests/`, mirroring `src/` (never co-locate or use `__tests__/`).
- Change the `name` passed to `init()` in `tests/setup.ts` to match `package.json` after `npm run rename`.
- Run `npm test`. CI runs the suite when a `test` script is present.
- Expand `memory-leak.test.ts` for any component that adds/removes nodes or links Properties at
  runtime (see OpticsLab for a deep suite).
- Optional: `npm run test:fuzz` / `test:fuzz:quick` (not part of default CI).

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` + scripts project) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run icons` | Regenerate PWA icons |
| `npm run rename` | Sim-level fork/rename (`--id`, `--name`) |
| `npm run scaffold-screens` | Emit N screens (`--screens Intro,Lab`) |

## Customizing a new sim from this template

### Recommended: Baton create-sim

```sh
Baton/scripts/create-sim.sh --repo Friction --name "Friction" --screens Intro,Lab --shared-model --onboard
```

### Manual: GitHub template + rename + scaffold

```sh
npm install
npm run rename -- --id friction --name "Friction"
npm run scaffold-screens -- --screens Intro,Lab --shared-model
# omit --screens for one screen named after the sim; omit --shared-model for independent models
npm run fix     # required: both scripts reorder imports, which Biome then sorts
npm run check
```

`rename` updates package id and metadata, display name, and every sim-level `Sim*`
(Colors, Constants, Namespace, Panel, ButtonOptions, Preferences, query parameters).
`scaffold-screens` owns screen folders (fleet naming: `src/intro/`, not `intro-screen/`).
After both steps no `Sim*` identifier should remain — `grep -rn '\bSim[A-Z_]' src` to confirm.

### Manual checklist (if not using the scripts)

1. **Rename** — replace `interferometry-lab` / `Interferometry Lab` / `Sim` prefix in `init.ts`, `brand.ts`, `package.json` (name, description, keywords, repository.url), Colors/Constants/Namespace/Panel/ButtonOptions/Preferences
2. **Screens** — run `scaffold-screens` or mirror `michelson/` into kebab folders
3. **Locale** — add `strings_XX.json`, register in `StringManager`, add locale to `init.ts` `availableLocales`
4. **Icon** — edit `public/icons/icon.svg`, run `npm run icons`; match theme color in `index.html` / `vite.config.ts`
5. **Colors** — edit `*Colors.ts` (`default` + `projector` profiles per property)

## Multi-screen sims

Full guide: [`doc/multi-screen.md`](doc/multi-screen.md)

Summary:
- Prefer `npm run scaffold-screens -- --screens Intro,Lab` (add `--shared-model` for a root model)
- Or create a screen folder mirroring `src/michelson/` for each screen (kebab names, no `-screen` suffix)
- Add screen-name keys to all locale JSON files; nest `a11y` per screen
- Expose new getters in `StringManager.getScreenNames()` / `get{Screen}A11yStrings()`
- Shared state: `--shared-model` → `common/model/SharedModel.ts` composed per screen (rename to a domain type)
- Add `src/common/InterferometryLabScreenIcons.ts` with `create{Screen}Icon()` factories; wire `homeScreenIcon` + `navigationBarIcon` on each Screen
- Register all screens in the `screens` array in `main.ts`

## Using this template beyond a direct copy

| Approach | When to use |
|---|---|
| **`Baton/scripts/create-sim.sh`** | Agents / fleet — create repo, rename, scaffold N screens |
| **GitHub template** ("Use this template") | Humans starting a sim in the browser |
| `npm run rename` + `scaffold-screens` | Same, after cloning the template |
| **npm workspace / monorepo** | Managing a suite of sims with shared tooling |
| **git subtree** for pulling updates | Keeping forks in sync with template improvements |

See `doc/multi-screen.md` → "Using this template beyond a direct copy" for details.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
