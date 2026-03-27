export const BACK_NAV_ACTIONS = {
   TO_MAP: "to-map",
   TO_PLANE_VIA_BUILD3: "to-plane-via-build3",
   SNAP_TO_BUILDS: "snap-to-builds",
   DEFAULT_BACK: "default-back",
   NOOP: "noop",
};

const FACADE_PERIPHERAL_LEVELS = new Set([
   "view-4",
   "view-5",
   "view-6",
   "build8",
]);

export function decideBackNavigationAction({ level, activeLevel, isTransitioning }) {
   if (level === "start") return BACK_NAV_ACTIONS.TO_MAP;

   // Target frames (Build3 and Build8) must always go back to Build2 on first click.
   if (
      activeLevel === "builds" ||
      level === "builds" ||
      activeLevel === "build8" ||
      level === "build8"
   ) {
      return BACK_NAV_ACTIONS.TO_PLANE_VIA_BUILD3;
   }

   // builds-2 is Appartments-right1, not the target Build3 frame.
   // First click should return to Build3, and only then Build3 -> Build2.
   if (level === "builds-2") {
      return BACK_NAV_ACTIONS.SNAP_TO_BUILDS;
   }

   if (isTransitioning) return BACK_NAV_ACTIONS.NOOP;

   if (FACADE_PERIPHERAL_LEVELS.has(level)) {
      return BACK_NAV_ACTIONS.SNAP_TO_BUILDS;
   }

   return BACK_NAV_ACTIONS.DEFAULT_BACK;
}
