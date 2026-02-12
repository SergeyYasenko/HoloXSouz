import { ref, watch } from "vue";

const STORAGE_KEY = "holo-current-level";

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
   const currentLevel = ref(savedLevel || "facade-start");
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

