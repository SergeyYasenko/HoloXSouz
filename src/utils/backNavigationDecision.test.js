import { describe, expect, it } from "vitest";
import {
   BACK_NAV_ACTIONS,
   decideBackNavigationAction,
} from "./backNavigationDecision.js";

describe("decideBackNavigationAction", () => {
   it("goes to map from start", () => {
      const action = decideBackNavigationAction({
         level: "start",
         activeLevel: "start",
         isTransitioning: false,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.TO_MAP);
   });

   it("always goes to Build2 when target Build3 is active", () => {
      const action = decideBackNavigationAction({
         level: "builds-2",
         activeLevel: "builds",
         isTransitioning: true,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.TO_PLANE_VIA_BUILD3);
   });

   it("always goes to Build2 when target Build8 is active", () => {
      const action = decideBackNavigationAction({
         level: "builds-2",
         activeLevel: "build8",
         isTransitioning: true,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.TO_PLANE_VIA_BUILD3);
   });

   it("snaps builds-2 to Build3 first", () => {
      const action = decideBackNavigationAction({
         level: "builds-2",
         activeLevel: "builds-2",
         isTransitioning: true,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.SNAP_TO_BUILDS);
   });

   it("snaps peripheral facade levels to builds", () => {
      const action = decideBackNavigationAction({
         level: "view-5",
         activeLevel: "view-5",
         isTransitioning: false,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.SNAP_TO_BUILDS);
   });

   it("returns noop while transitioning outside target scenarios", () => {
      const action = decideBackNavigationAction({
         level: "plane",
         activeLevel: "plane",
         isTransitioning: true,
      });

      expect(action).toBe(BACK_NAV_ACTIONS.NOOP);
   });
});
