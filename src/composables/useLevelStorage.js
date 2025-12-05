import { ref } from "vue";

/**
 * Composable for managing level state (without localStorage)
 * Always starts from "map" level on page load
 */
export function useLevelStorage() {
   // Always start from "map" level - no localStorage persistence
   const currentLevel = ref("map");
   const levelHistory = ref([]);

   return {
      currentLevel,
      levelHistory,
   };
}

