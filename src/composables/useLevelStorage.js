import { ref, watch } from "vue";

const STORAGE_KEY = "holo-current-level";
const ENTRY_LEVEL = "plane";
const NON_ENTRY_FACADE_LEVELS = new Set([
   "builds",
   "builds-2",
   "view-4",
   "view-5",
   "view-6",
   "build8",
]);

/**
 * Composable for managing level state.
 * Временно: сохраняем уровень в sessionStorage, чтобы при hot-reload (сохранение файла)
 * оставаться на том же этаже при редактировании масок.
 */
export function useLevelStorage() {
   const savedLevel =
      typeof sessionStorage !== "undefined"
         ? sessionStorage.getItem(STORAGE_KEY)
         : null;
   const levelAliases = {
      "2-projects": "start",
      start: "plane",
      "facade-start": "builds",
      "facade-start-2": "builds-2",
   };
   const normalizedSavedLevel = savedLevel ? levelAliases[savedLevel] || savedLevel : null;
   const safeInitialLevel =
      normalizedSavedLevel && !NON_ENTRY_FACADE_LEVELS.has(normalizedSavedLevel)
         ? normalizedSavedLevel
         : ENTRY_LEVEL;

   const currentLevel = ref(safeInitialLevel);
   const levelHistory = ref([]);

   // Временно: сохранять уровень при изменении (для удобства редактирования масок)
   watch(
      currentLevel,
      (val) => {
         if (typeof sessionStorage !== "undefined" && val) {
            sessionStorage.setItem(STORAGE_KEY, val);
         }
      },
      { immediate: true }
   );

   return {
      currentLevel,
      levelHistory,
   };
}

