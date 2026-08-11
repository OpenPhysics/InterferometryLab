/**
 * InterferometryLabColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import InterferometryLabColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import InterferometryLabColors from "../../InterferometryLabColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: InterferometryLabColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the InterferometryLabColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import InterferometryLabNamespace from "./InterferometryLabNamespace.js";

const InterferometryLabColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Optical table ────────────────────────────────────────────────────────────
  // The table is drawn top-down. It stays darker than the surrounding screen in
  // both profiles so that beams — which are drawn in their own wavelength's
  // colour and must read as *emitted* light — always sit on a darker ground.

  /** Surface of the optical breadboard the components sit on. */
  tableColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "table", {
    default: "#10101c",
    projector: "#e8e8ee",
  }),

  /** Mounting-hole grid ruled across the breadboard. */
  tableGridColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "tableGrid", {
    default: "#26263c",
    projector: "#cfcfdb",
  }),

  /** Outline around the breadboard and around the detector bezel. */
  tableBorderColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "tableBorder", {
    default: "#3a3a5c",
    projector: "#9a9aae",
  }),

  // ── Optical components ───────────────────────────────────────────────────────

  /** Reflective face of a mirror. */
  mirrorColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "mirror", {
    default: "#c8d4e0",
    projector: "#7e8a99",
  }),

  /** Substrate behind a mirror's coating, and the body of a mount. */
  mountColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "mount", {
    default: "#4a4a63",
    projector: "#8a8a9c",
  }),

  /** Glass of a beam splitter, compensator, sample slide, or cell window. */
  glassColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "glass", {
    default: "rgba(150,200,225,0.34)",
    projector: "rgba(70,120,170,0.30)",
  }),

  /** Outline of a glass component. */
  glassStrokeColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "glassStroke", {
    default: "#8fc4de",
    projector: "#4a7fa5",
  }),

  /** Body of the laser or lamp housing. */
  sourceBodyColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "sourceBody", {
    default: "#5a5a72",
    projector: "#6f6f86",
  }),

  /** Face of a detector, before any light falls on it. */
  detectorFaceColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "detectorFace", {
    default: "#050508",
    projector: "#141420",
  }),

  /** Gas filling the evacuable cell, shown at full pressure. */
  gasFillColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "gasFill", {
    default: "#7fd4ff",
    projector: "#2f8fbf",
  }),

  // ── Labels and readouts ──────────────────────────────────────────────────────

  /** Component labels drawn directly on the optical table. */
  tableLabelColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "tableLabel", {
    default: "#a8b2c8",
    projector: "#48506a",
  }),

  /** Numeric values in readout rows — brighter than their labels. */
  valueColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "value", {
    default: "#ffd479",
    projector: "#8a5a00",
  }),

  /** Plot traces, axes and gridlines on the transmission-spectrum chart. */
  plotTraceColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "plotTrace", {
    default: "#4fc3f7",
    projector: "#1565a8",
  }),

  /**
   * A second plot trace, for charts that draw two curves at once — the
   * Mach-Zehnder's two output ports. Chosen warm against `plotTrace`'s cool blue
   * so the pair stays distinguishable without relying on hue alone.
   */
  plotTraceAltColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "plotTraceAlt", {
    default: "#ff9e6d",
    projector: "#b34a12",
  }),

  /** The dashed total of several traces, drawn quieter than the traces themselves. */
  plotSumColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "plotSum", {
    default: "#9aa8bd",
    projector: "#6b7285",
  }),

  plotAxisColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "plotAxis", {
    default: "#7a86a0",
    projector: "#5a6070",
  }),

  /** Marks left by individual detected photons as the pattern builds up. */
  photonMarkColorProperty: new ProfileColorProperty(InterferometryLabNamespace, "photonMark", {
    default: "#fff4c2",
    projector: "#fff4c2",
  }),
};

export default InterferometryLabColors;
