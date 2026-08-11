/**
 * interferometryLabQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in InterferometryLabPreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?showOpticalPath=true` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import InterferometryLabNamespace from "../InterferometryLabNamespace.js";

const interferometryLabQueryParameters = QueryStringMachine.getAll({
  /**
   * Label each beam segment on the optical table with the optical path length it
   * accumulates. Off by default: the numbers are the point of the sim, but they
   * crowd the table, so they are opt-in for students who are tracking the
   * bookkeeping rather than watching the fringes.
   */
  showOpticalPath: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },
});

InterferometryLabNamespace.register("interferometryLabQueryParameters", interferometryLabQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default interferometryLabQueryParameters;
