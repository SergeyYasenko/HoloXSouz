import { ref, watch, onMounted } from "vue";

const SWIPE_THRESHOLD = 30; // Минимальное расстояние для свайпа (в пикселях)
const SWIPE_HINT_STORAGE_KEY = "swipe-hint-shown"; // Ключ для localStorage

/**
 * Composable for handling swipe gestures
 */
export function useSwipe(currentLevel, isTransitioning, handlers) {
   // Проверяем, была ли подсказка уже показана
   const wasHintShown = () => {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(SWIPE_HINT_STORAGE_KEY) === "true";
   };

   // Сохраняем, что подсказка была показана
   const markHintAsShown = () => {
      if (typeof window !== "undefined") {
         localStorage.setItem(SWIPE_HINT_STORAGE_KEY, "true");
      }
   };

   const showSwipeHint = ref(false);
   const swipeStartX = ref(0);
   const swipeStartY = ref(0);
   const swipeStartTime = ref(0);
   const isSwiping = ref(false);

   const swipeableLevels = ["start", "facade-start", "facade-start-2"];

   const isSwipeable = (level) => swipeableLevels.includes(level);

   const hideSwipeHint = () => {
      showSwipeHint.value = false;
      markHintAsShown(); // Сохраняем, что подсказка была показана
   };

   // Touch handlers
   const handleTouchStart = (event) => {
      if (!isSwipeable(currentLevel.value) || isTransitioning.value) return;

      const target = event.target;
      if (
         target &&
         (target.closest(".home-content-wrapper") ||
            target.closest("button") ||
            target.closest("a"))
      ) {
         return;
      }

      const touch = event.touches[0];
      if (!touch) return;
      swipeStartX.value = touch.clientX;
      swipeStartY.value = touch.clientY;
      swipeStartTime.value = Date.now();
      isSwiping.value = true;
      if (currentLevel.value === "start") {
         hideSwipeHint();
      }
   };

   const handleTouchMove = (event) => {
      if (!isSwiping.value || !isSwipeable(currentLevel.value)) return;
      const touch = event.touches[0];
      if (touch) {
         const deltaX = Math.abs(touch.clientX - swipeStartX.value);
         const deltaY = Math.abs(touch.clientY - swipeStartY.value);
         if (deltaX > deltaY) {
            event.preventDefault();
         }
      }
   };

   const handleTouchEnd = (event) => {
      if (!isSwiping.value || !isSwipeable(currentLevel.value)) {
         isSwiping.value = false;
         return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
         isSwiping.value = false;
         return;
      }

      const deltaX = touch.clientX - swipeStartX.value;
      const deltaY = touch.clientY - swipeStartY.value;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
         handlers.onSwipe(deltaX > 0);
      }

      isSwiping.value = false;
   };

   // Mouse handlers
   const handleMouseDown = (event) => {
      if (!isSwipeable(currentLevel.value) || isTransitioning.value) return;
      if (event.button !== 0) return;

      const target = event.target;
      if (
         target &&
         (target.closest(".home-content-wrapper") ||
            target.closest("button") ||
            target.closest("a"))
      ) {
         return;
      }

      swipeStartX.value = event.clientX;
      swipeStartY.value = event.clientY;
      swipeStartTime.value = Date.now();
      isSwiping.value = true;
      if (currentLevel.value === "start") {
         hideSwipeHint();
      }
   };

   const handleMouseMove = (event) => {
      if (!isSwiping.value || !isSwipeable(currentLevel.value)) return;
   };

   const handleMouseUp = (event) => {
      if (!isSwiping.value || !isSwipeable(currentLevel.value)) {
         isSwiping.value = false;
         return;
      }

      // Check if event exists and has clientX property
      if (!event || typeof event.clientX === 'undefined') {
         isSwiping.value = false;
         return;
      }

      const deltaX = event.clientX - swipeStartX.value;
      const deltaY = event.clientY - swipeStartY.value;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
         handlers.onSwipe(deltaX > 0);
      }

      isSwiping.value = false;
   };

   // Watch currentLevel to show/hide hint
   watch(currentLevel, (newLevel, oldLevel) => {
      if (newLevel === "start") {
         // Показываем подсказку только если:
         // 1. Она еще не была показана ранее
         // 2. Это переход на уровень start с другого уровня (не возврат со свайпа)
         // Свайп влево/вправо переводит на "facade-start" или "facade-start-2"
         // Возврат с этих уровней обратно на "start" не должен показывать подсказку
         const isTransitionToStart = oldLevel &&
            oldLevel !== "start" &&
            oldLevel !== "facade-start" &&
            oldLevel !== "facade-start-2";

         if (!wasHintShown() && isTransitionToStart) {
            showSwipeHint.value = true;
            // Автоматически скрываем через 5 секунд
            setTimeout(() => {
               if (showSwipeHint.value) {
                  hideSwipeHint();
               }
            }, 5000);
         } else {
            showSwipeHint.value = false;
         }
      } else {
         showSwipeHint.value = false;
      }
   });

   return {
      showSwipeHint,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      hideSwipeHint,
   };
}

