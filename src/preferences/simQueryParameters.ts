/**
 * simQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in SimPreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?exampleToggle=true` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import SimNamespace from "../SimNamespace.js";

const simQueryParameters = QueryStringMachine.getAll({
  /**
   * Example public boolean parameter. Replace with real sim-specific parameters,
   * or remove if the sim has none.
   */
  exampleToggle: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },
});

SimNamespace.register("simQueryParameters", simQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default simQueryParameters;
