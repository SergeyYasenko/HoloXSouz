import { ref, computed } from "vue";
import { mapMasks, twoProjectsMasks, floorsConfig } from "../config/navigation.js";

/**
 * Composable for managing house outline masks and disclaimer mode
 */
export function useMasks() {
   // Disclaimer mode - shows red overlay and always-visible masks
   const showDisclaimerMode = ref(true);

   // House outline configuration for Map level
   const showHouseOutline1 = ref(true); // Первая маска на Map
   const showHouseOutline2 = ref(true); // Вторая маска на Map
   const houseOutlineColor = ref("#00ffff"); // Цвет обводки
   const houseOutlineAnimatedMap = ref(false); // Анимация для масок на Map

   // House outline configuration for other levels
   const showHouseOutline = ref(true); // Включить/выключить подсветку
   const houseOutlineWidth = ref(3); // Толщина обводки
   const houseOutlineGlow = ref("rgba(0, 255, 255, 0.7)"); // Цвет подсветки
   const houseOutlineGlowBlur = ref(25); // Интенсивность свечения
   const houseOutlineAnimated = ref(false); // Анимация пульсации

   // Toggle disclaimer mode
   const toggleDisclaimerMode = () => {
      showDisclaimerMode.value = !showDisclaimerMode.value;
      console.log("Disclaimer mode:", showDisclaimerMode.value ? "ON" : "OFF");
   };

   // Computed properties for mask configurations
   const mapMaskConfig = computed(() => ({
      house1: {
         points: mapMasks.house1.points,
         path: mapMasks.house1.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: houseOutlineAnimatedMap.value,
         alwaysVisible: showDisclaimerMode.value,
      },
      house2: {
         points: mapMasks.house2.points,
         path: mapMasks.house2.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: houseOutlineAnimatedMap.value,
         alwaysVisible: showDisclaimerMode.value,
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
         animated: houseOutlineAnimatedMap.value,
         alwaysVisible: false,
      },
      project2: {
         points: twoProjectsMasks.project2.points,
         path: twoProjectsMasks.project2.path,
         strokeWidth: houseOutlineWidth.value,
         glowColor: houseOutlineGlow.value,
         glowBlur: houseOutlineGlowBlur.value,
         animated: houseOutlineAnimatedMap.value,
         alwaysVisible: false,
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
         animated: houseOutlineAnimated.value,
         alwaysVisible: false,
      };
   };

   return {
      // State
      showDisclaimerMode,
      showHouseOutline1,
      showHouseOutline2,
      houseOutlineColor,
      houseOutlineAnimatedMap,
      showHouseOutline,
      houseOutlineWidth,
      houseOutlineGlow,
      houseOutlineGlowBlur,
      houseOutlineAnimated,

      // Methods
      toggleDisclaimerMode,

      // Computed
      mapMaskConfig,
      twoProjectsMaskConfig,
      getFloorMaskConfig,
   };
}

