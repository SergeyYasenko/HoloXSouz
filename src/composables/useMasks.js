import { ref, computed } from "vue";
import { mapMasks, twoProjectsMasks, floorsConfig } from "../config/navigation.js";

export function useMasks() {
   let defaultEditMode = false;

   if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlEditParam = urlParams.get('edit');
      if (urlEditParam !== null) {
         defaultEditMode = urlEditParam === 'true';
      }
   }

   const editMode = ref(defaultEditMode);
   const showDisclaimerMode = ref(false);
   const showHouseOutline1 = ref(true);
   const showHouseOutline2 = ref(true);
   const houseOutlineAnimatedMap = ref(false);
   const houseOutlineWidth = ref(3);
   const houseOutlineGlow = ref("rgba(0, 255, 255, 0.7)");
   const houseOutlineGlowBlur = ref(25);
   const houseOutlineAnimated = ref(false);

   const toggleDisclaimerMode = () => {
      showDisclaimerMode.value = !showDisclaimerMode.value;
   };

   const mapMaskConfig = computed(() => ({
      house1: {
         points: mapMasks.house1.points,
         path: mapMasks.house1.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value || showDisclaimerMode.value,
      },
      house2: {
         points: mapMasks.house2.points,
         path: mapMasks.house2.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value || showDisclaimerMode.value,
      },
      territory: {
         points: mapMasks.territory.points,
         path: mapMasks.territory.path,
         strokeWidth: 0,
         glowColor: "rgba(255, 0, 0, 0.3)",
         glowBlur: 0,
         animated: false,
         alwaysVisible: true,
      },
   }));

   const twoProjectsMaskConfig = computed(() => ({
      project1: {
         points: twoProjectsMasks.project1.points,
         path: twoProjectsMasks.project1.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value,
      },
      project2: {
         points: twoProjectsMasks.project2.points,
         path: twoProjectsMasks.project2.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value,
      },
   }));

   const getFloorMaskConfig = (floorId) => {
      const floor = floorsConfig[floorId];
      if (!floor || !floor.points || floor.points.length === 0) {
         return null;
      }
      return {
         points: floor.points,
         path: floor.path || "",
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimated.value,
         alwaysVisible: editMode.value,
      };
   };

   return {
      editMode,
      showDisclaimerMode,
      showHouseOutline1,
      showHouseOutline2,
      toggleDisclaimerMode,
      mapMaskConfig,
      twoProjectsMaskConfig,
      getFloorMaskConfig,
   };
}
