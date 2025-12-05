import { onMounted, onUnmounted } from "vue";

/**
 * Composable for managing fullscreen mode
 */
export function useFullscreen() {
   const enterFullscreen = () => {
      if (document.fullscreenElement) {
         return; // Already in fullscreen
      }

      // Use #app as target to include header in fullscreen
      const targetElement =
         document.querySelector("#app") ||
         document.documentElement;

      if (targetElement) {
         if (targetElement.requestFullscreen) {
            targetElement.requestFullscreen().catch((err) => {
               console.log("Fullscreen request failed:", err);
            });
         } else if (targetElement.webkitRequestFullscreen) {
            // Safari
            targetElement.webkitRequestFullscreen();
         } else if (targetElement.msRequestFullscreen) {
            // IE/Edge
            targetElement.msRequestFullscreen();
         }
      }
   };

   const exitFullscreen = () => {
      if (!document.fullscreenElement) {
         return; // Not in fullscreen
      }

      if (document.exitFullscreen) {
         document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
         // Safari
         document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
         // IE/Edge
         document.msExitFullscreen();
      }
   };

   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         enterFullscreen();
      } else {
         exitFullscreen();
      }
   };

   // Auto-enter fullscreen on mount (if user interaction is not required)
   const autoEnterFullscreen = () => {
      // Try to enter fullscreen automatically
      // Note: Some browsers may require user interaction
      enterFullscreen();
   };

   // Try to enter fullscreen on first user interaction
   const setupFullscreenOnInteraction = () => {
      const enterOnInteraction = () => {
         enterFullscreen();
         // Remove listeners after first interaction
         document.removeEventListener("click", enterOnInteraction);
         document.removeEventListener("touchstart", enterOnInteraction);
         document.removeEventListener("keydown", enterOnInteraction);
      };

      // Listen for first user interaction
      document.addEventListener("click", enterOnInteraction, { once: true });
      document.addEventListener("touchstart", enterOnInteraction, { once: true });
      document.addEventListener("keydown", enterOnInteraction, { once: true });
   };

   return {
      enterFullscreen,
      exitFullscreen,
      toggleFullscreen,
      autoEnterFullscreen,
      setupFullscreenOnInteraction,
   };
}

