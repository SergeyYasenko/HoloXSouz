import { ref, computed } from "vue";
import { mapMasks, twoProjectsMasks, startMasks, floorsConfig } from "../config/navigation.js";
import { facadeCentralFloorMasks } from "../config/facadeCentralFloorMasks.js";

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
      house2: {
         points: mapMasks.house2?.points ?? [],
         path: mapMasks.house2?.path ?? "",
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value || showDisclaimerMode.value,
      },
   }));

   const twoProjectsMaskConfig = computed(() => ({
      project2: {
         points: twoProjectsMasks.project2?.points ?? [],
         path: twoProjectsMasks.project2?.path ?? "",
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: editMode.value ? false : houseOutlineAnimatedMap.value,
         alwaysVisible: editMode.value,
      },
   }));

   const startMaskConfig = computed(() => {
      const config = {};
      Object.entries(startMasks).forEach(([key, mask]) => {
         config[key] = {
            points: mask?.points ?? [],
            path: mask?.path ?? "",
            strokeWidth: houseOutlineWidth.value,
            glowColor: houseOutlineGlow.value,
            glowBlur: houseOutlineGlowBlur.value,
            animated: editMode.value ? false : houseOutlineAnimated.value,
            alwaysVisible: editMode.value,
         };
      });
      return config;
   });

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

   const facadeCentralFloorMaskConfig = computed(() => {
      const config = {};
      Object.entries(facadeCentralFloorMasks).forEach(([key, value]) => {
         // Поддержка как одиночной маски, так и массива масок по этажам
         const masksArray = Array.isArray(value) ? value : [value];
         config[key] = masksArray.map((mask) => ({
            points: mask?.points ?? [],
            path: mask?.path ?? "",
            strokeWidth: houseOutlineWidth.value,
            glowColor: houseOutlineGlow.value,
            glowBlur: houseOutlineGlowBlur.value,
            animated: editMode.value ? false : houseOutlineAnimated.value,
            alwaysVisible: editMode.value,
         }));
      });
      return config;
   });

   return {
      editMode,
      showDisclaimerMode,
      showHouseOutline1,
      showHouseOutline2,
      toggleDisclaimerMode,
      mapMaskConfig,
      twoProjectsMaskConfig,
      startMaskConfig,
      getFloorMaskConfig,
      facadeCentralFloorMaskConfig,
   };
}
