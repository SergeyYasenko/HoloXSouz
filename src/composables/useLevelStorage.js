import { ref, watch } from "vue";

const STORAGE_KEY_LEVEL = "holo-home-current-level";
const STORAGE_KEY_HISTORY = "holo-home-level-history";

/**
 * Composable for managing level state in localStorage
 */
export function useLevelStorage() {
   const loadLevelFromStorage = () => {
      try {
         const savedLevel = localStorage.getItem(STORAGE_KEY_LEVEL);
         return savedLevel || "map";
      } catch (e) {
         return "map";
      }
   };

   const loadHistoryFromStorage = () => {
      try {
         const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
         return savedHistory ? JSON.parse(savedHistory) : [];
      } catch (e) {
         return [];
      }
   };

   const saveLevelToStorage = (level) => {
      try {
         localStorage.setItem(STORAGE_KEY_LEVEL, level);
      } catch (e) {
         console.warn("Failed to save level to localStorage:", e);
      }
   };

   const saveHistoryToStorage = (history) => {
      try {
         localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
      } catch (e) {
         console.warn("Failed to save history to localStorage:", e);
      }
   };

   const currentLevel = ref(loadLevelFromStorage());
   const levelHistory = ref(loadHistoryFromStorage());

   // Watch and save to localStorage
   watch(currentLevel, (newLevel) => {
      saveLevelToStorage(newLevel);
   });

   watch(
      levelHistory,
      (newHistory) => {
         saveHistoryToStorage(newHistory);
      },
      { deep: true }
   );

   return {
      currentLevel,
      levelHistory,
   };
}

