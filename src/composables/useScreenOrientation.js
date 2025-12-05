import { onMounted } from "vue";

/**
 * Composable for locking screen orientation to landscape on mobile devices
 */
export function useScreenOrientation() {
   // Check if device is mobile
   const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
         navigator.userAgent
      ) || (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
   };

   // Lock orientation to landscape
   const lockToLandscape = async () => {
      // Only on mobile devices
      if (!isMobileDevice()) {
         return;
      }

      // Check if Screen Orientation API is available
      if (screen.orientation && screen.orientation.lock) {
         try {
            // Try to lock to landscape
            await screen.orientation.lock("landscape");
            console.log("Screen orientation locked to landscape");
         } catch (error) {
            // Some browsers require user gesture, or API is not fully supported
            console.log("Could not lock orientation (may require user gesture):", error);

            // Try alternative method for older browsers
            if (screen.lockOrientation) {
               try {
                  screen.lockOrientation("landscape");
                  console.log("Screen orientation locked to landscape (legacy method)");
               } catch (legacyError) {
                  console.log("Legacy orientation lock failed:", legacyError);
               }
            }
         }
      } else if (screen.lockOrientation) {
         // Legacy API
         try {
            screen.lockOrientation("landscape");
            console.log("Screen orientation locked to landscape (legacy method)");
         } catch (error) {
            console.log("Legacy orientation lock failed:", error);
         }
      } else if (screen.mozLockOrientation) {
         // Firefox
         try {
            screen.mozLockOrientation("landscape");
            console.log("Screen orientation locked to landscape (Firefox)");
         } catch (error) {
            console.log("Firefox orientation lock failed:", error);
         }
      } else if (screen.msLockOrientation) {
         // IE/Edge
         try {
            screen.msLockOrientation("landscape");
            console.log("Screen orientation locked to landscape (IE/Edge)");
         } catch (error) {
            console.log("IE/Edge orientation lock failed:", error);
         }
      }
   };

   // Try to lock orientation on mount
   // Note: Some browsers require user gesture, so we'll try on first user interaction as well
   const setupOrientationLock = () => {
      // Try immediately (may work in some browsers)
      lockToLandscape();

      // Also try on first user interaction (required by some browsers)
      const lockOnInteraction = () => {
         lockToLandscape();
         // Remove listeners after first attempt
         document.removeEventListener("click", lockOnInteraction);
         document.removeEventListener("touchstart", lockOnInteraction);
         document.removeEventListener("keydown", lockOnInteraction);
      };

      // Listen for first user interaction
      document.addEventListener("click", lockOnInteraction, { once: true });
      document.addEventListener("touchstart", lockOnInteraction, { once: true });
      document.addEventListener("keydown", lockOnInteraction, { once: true });
   };

   return {
      lockToLandscape,
      setupOrientationLock,
   };
}

