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

   // Check current orientation
   const isPortrait = () => {
      if (screen.orientation) {
         return screen.orientation.angle === 90 || screen.orientation.angle === 270;
      }
      return window.innerHeight > window.innerWidth;
   };

   // Lock orientation to landscape
   const lockToLandscape = async () => {
      // Only on mobile devices
      if (!isMobileDevice()) {
         return false;
      }

      let locked = false;

      // Method 1: Modern Screen Orientation API
      if (screen.orientation && screen.orientation.lock) {
         try {
            await screen.orientation.lock("landscape");
            console.log("Screen orientation locked to landscape (modern API)");
            locked = true;
         } catch (error) {
            console.log("Modern API lock failed:", error);
         }
      }

      // Method 2: Legacy API
      if (!locked && screen.lockOrientation) {
         try {
            screen.lockOrientation("landscape");
            console.log("Screen orientation locked to landscape (legacy method)");
            locked = true;
         } catch (error) {
            console.log("Legacy orientation lock failed:", error);
         }
      }

      // Method 3: Firefox
      if (!locked && screen.mozLockOrientation) {
         try {
            screen.mozLockOrientation("landscape");
            console.log("Screen orientation locked to landscape (Firefox)");
            locked = true;
         } catch (error) {
            console.log("Firefox orientation lock failed:", error);
         }
      }

      // Method 4: IE/Edge
      if (!locked && screen.msLockOrientation) {
         try {
            screen.msLockOrientation("landscape");
            console.log("Screen orientation locked to landscape (IE/Edge)");
            locked = true;
         } catch (error) {
            console.log("IE/Edge orientation lock failed:", error);
         }
      }

      // Method 5: Try with fullscreen (sometimes helps)
      if (!locked && document.documentElement.requestFullscreen) {
         try {
            await document.documentElement.requestFullscreen();
            // Try to lock after fullscreen
            if (screen.orientation && screen.orientation.lock) {
               await screen.orientation.lock("landscape");
               locked = true;
            }
         } catch (error) {
            console.log("Fullscreen + orientation lock failed:", error);
         }
      }

      return locked;
   };

   // Try to lock orientation on mount
   // Note: Some browsers require user gesture, so we'll try on first user interaction as well
   const setupOrientationLock = () => {
      let locked = false;
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts

      // Function to try locking
      const tryLock = async () => {
         if (locked || attempts >= maxAttempts) return;
         attempts++;
         const result = await lockToLandscape();
         if (result) {
            locked = true;
            console.log(`Orientation locked successfully after ${attempts} attempts`);
         }
      };

      // Try immediately (may work in some browsers)
      tryLock();

      // Try on various user interactions - more aggressive approach
      const lockOnInteraction = async (event) => {
         if (!locked) {
            await tryLock();
         }
      };

      // Listen for user interactions - try on EVERY interaction until locked
      const events = ['click', 'touchstart', 'touchend', 'touchmove', 'keydown', 'pointerdown', 'mousedown', 'wheel', 'scroll'];
      events.forEach(eventType => {
         document.addEventListener(eventType, lockOnInteraction, { passive: true });
      });

      // Also try periodically (some devices need time)
      const intervalId = setInterval(() => {
         if (locked) {
            clearInterval(intervalId);
            return;
         }
         tryLock();
      }, 300); // More frequent attempts

      // Also try after delays (some devices need time to initialize)
      [100, 300, 500, 1000, 2000, 3000].forEach(delay => {
         setTimeout(() => {
            if (!locked) {
               tryLock();
            }
         }, delay);
      });

      // Listen for orientation changes and try to lock again
      const handleOrientationChange = () => {
         if (!locked) {
            setTimeout(() => {
               tryLock();
            }, 100);
         }
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation) {
         screen.orientation.addEventListener('change', handleOrientationChange);
      }

      // Also try when page becomes visible (user returns to tab)
      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible' && !locked) {
            tryLock();
         }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function (can be called on unmount)
      return () => {
         clearInterval(intervalId);
         events.forEach(eventType => {
            document.removeEventListener(eventType, lockOnInteraction);
         });
         window.removeEventListener('orientationchange', handleOrientationChange);
         document.removeEventListener('visibilitychange', handleVisibilityChange);
         if (screen.orientation) {
            screen.orientation.removeEventListener('change', handleOrientationChange);
         }
      };
   };

   return {
      lockToLandscape,
      setupOrientationLock,
      isPortrait,
   };
}

