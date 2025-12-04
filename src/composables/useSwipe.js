import { ref, watch } from "vue";

const SWIPE_THRESHOLD = 30; // Минимальное расстояние для свайпа (в пикселях)

/**
 * Composable for handling swipe gestures
 */
export function useSwipe(currentLevel, isTransitioning, handlers) {
   const showSwipeHint = ref(true);
   const swipeStartX = ref(0);
   const swipeStartY = ref(0);
   const swipeStartTime = ref(0);
   const isSwiping = ref(false);

   const swipeableLevels = ["start", "facade-start", "facade-start-2"];

   const isSwipeable = (level) => swipeableLevels.includes(level);

   const hideSwipeHint = () => {
      showSwipeHint.value = false;
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
   watch(currentLevel, (newLevel) => {
      if (newLevel === "start") {
         showSwipeHint.value = true;
         setTimeout(() => {
            if (showSwipeHint.value) {
               hideSwipeHint();
            }
         }, 5000);
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

