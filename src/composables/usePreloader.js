import { ref, computed } from "vue";

// Import all assets from navigation config
import mapImage from "../assets/video/Map.png";
import startImage from "../assets/video/Start.png";
import twoProjectsImage from "../assets/video/2Projects.png";
import leftImage from "../assets/video/Left.png";
import rightImage from "../assets/video/Right.png";
import floorImage1 from "../assets/video/1.png";
import floorImage2 from "../assets/video/2.png";
import floorImage3 from "../assets/video/3.png";
import floorImage4 from "../assets/video/4.png";
import floorImageG from "../assets/video/G.png";

// Import videos
import internetCityVideo from "../assets/video/InternetCity.mp4";
import theRoyalYachtVideo from "../assets/video/TheRoyalYacht.mp4";
import facadeStartVideo from "../assets/video/FacadeStart.mp4";
import facadeStart2Video from "../assets/video/FacadeStart2.mp4";
import floor1Video from "../assets/video/Floor1.mp4";
import floor2Video from "../assets/video/Floor2.mp4";
import floor3Video from "../assets/video/Floor3.mp4";
import floor4Video from "../assets/video/Floor4.mp4";
import floorGVideo from "../assets/video/FloorG.mp4";

// Import map page images
import mapNewDesktop from "../assets/img/map-new-desktop.jpg";
import downtown from "../assets/img/downtown.png";
import downtownTable from "../assets/img/downtown-table.png";
import dubaiMarina from "../assets/img/dubai-marina.png";
import dubaiMarinaTable from "../assets/img/dubai-marina-table.png";
import marasiDrive from "../assets/img/marasi-drive.png";
import marasiDriveTable from "../assets/img/marasi-drive-table.png";

// All images to preload (priority - these are shown immediately)
const CRITICAL_IMAGES = [
   mapImage,
   startImage,
   twoProjectsImage,
];

// Secondary images (can load in background)
const SECONDARY_IMAGES = [
   leftImage,
   rightImage,
   floorImage1,
   floorImage2,
   floorImage3,
   floorImage4,
   floorImageG,
   mapNewDesktop,
   downtown,
   downtownTable,
   dubaiMarina,
   dubaiMarinaTable,
   marasiDrive,
   marasiDriveTable,
];

// Videos to preload (lightweight - just buffer first frames)
const VIDEOS_TO_PRELOAD = [
   { key: "internetCity", src: internetCityVideo },
   { key: "theRoyalYacht", src: theRoyalYachtVideo },
   { key: "facadeStart", src: facadeStartVideo },
   { key: "facadeStart2", src: facadeStart2Video },
   { key: "floor1", src: floor1Video },
   { key: "floor2", src: floor2Video },
   { key: "floor3", src: floor3Video },
   { key: "floor4", src: floor4Video },
   { key: "floorG", src: floorGVideo },
];

/**
 * Composable for preloading assets (lightweight version for mobile)
 */
export function usePreloader() {
   const loadedCount = ref(0);
   // Only count critical images + videos for initial loading
   const totalCount = ref(CRITICAL_IMAGES.length + VIDEOS_TO_PRELOAD.length);
   const isLoading = ref(true);
   const errors = ref([]);
   const currentAsset = ref("");

   const progress = computed(() => {
      if (totalCount.value === 0) return 100;
      return Math.round((loadedCount.value / totalCount.value) * 100);
   });

   // Preload a single image
   const preloadImage = (src) => {
      return new Promise((resolve) => {
         const img = new Image();
         img.onload = () => {
            loadedCount.value++;
            resolve({ src, success: true });
         };
         img.onerror = () => {
            loadedCount.value++;
            errors.value.push({ type: "image", src });
            resolve({ src, success: false });
         };
         img.src = src;
      });
   };

   // Lightweight video preload - just buffer initial frames
   const preloadVideo = (videoEntry) => {
      return new Promise((resolve) => {
         try {
            const { key, src } = videoEntry;
            if (!src) {
               loadedCount.value++;
               resolve({ key, src, success: false });
               return;
            }

            currentAsset.value = `Video: ${key}`;

            const video = document.createElement("video");
            if (!video) {
               loadedCount.value++;
               resolve({ key, src, success: false });
               return;
            }

            video.preload = "auto";
            video.muted = true;
            video.playsInline = true;

            let resolved = false;
            let timeout = null;

            const done = (success = true) => {
               if (resolved) return;
               resolved = true;
               if (timeout) {
                  clearTimeout(timeout);
                  timeout = null;
               }
               loadedCount.value++;
               resolve({ key, src, success });
            };

            // Success when we can play through
            video.oncanplaythrough = () => done(true);
            video.onloadeddata = () => done(true);

            // Handle errors gracefully
            video.onerror = () => {
               errors.value.push({ type: "video", key, src });
               done(false);
            };

            // Timeout fallback (3 seconds max per video)
            timeout = setTimeout(() => done(true), 3000);

            video.src = src;
            video.load();
         } catch (error) {
            console.error(`Error preloading video ${videoEntry?.key}:`, error);
            loadedCount.value++;
            resolve({ key: videoEntry?.key, src: videoEntry?.src, success: false });
         }
      });
   };

   // Preload secondary images in background (non-blocking)
   const preloadSecondaryImages = () => {
      SECONDARY_IMAGES.forEach((src) => {
         const img = new Image();
         img.src = src;
      });
   };

   // Start preloading
   const startPreload = async () => {
      try {
         isLoading.value = true;
         loadedCount.value = 0;
         errors.value = [];

         const startTime = Date.now();

         // 1. Load critical images first (shown immediately)
         currentAsset.value = "Loading images...";
         try {
            await Promise.all(CRITICAL_IMAGES.map(preloadImage));
         } catch (error) {
            console.error("Error loading critical images:", error);
         }

         // 2. Start loading secondary images in background (non-blocking)
         try {
            preloadSecondaryImages();
         } catch (error) {
            console.error("Error loading secondary images:", error);
         }

         // 3. Preload videos (lightweight - just buffer)
         currentAsset.value = "Preparing videos...";

         try {
            // Load videos in parallel but with limit
            const videoChunks = [];
            for (let i = 0; i < VIDEOS_TO_PRELOAD.length; i += 3) {
               videoChunks.push(VIDEOS_TO_PRELOAD.slice(i, i + 3));
            }

            for (const chunk of videoChunks) {
               await Promise.all(chunk.map(preloadVideo));
            }
         } catch (error) {
            console.error("Error loading videos:", error);
         }

         // Ensure minimum loading time for smooth UX
         const elapsed = Date.now() - startTime;
         const minLoadTime = 300;
         if (elapsed < minLoadTime) {
            await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
         }

         currentAsset.value = "";
         isLoading.value = false;

         return {
            success: errors.value.length === 0,
            errors: errors.value,
         };
      } catch (error) {
         console.error("Fatal preloader error:", error);
         // Always hide preloader even on error
         isLoading.value = false;
         currentAsset.value = "";
         return {
            success: false,
            errors: [{ type: "fatal", error: error.message }],
         };
      }
   };

   return {
      progress,
      isLoading,
      loadedCount,
      totalCount,
      errors,
      currentAsset,
      startPreload,
   };
}

// Dummy function for backwards compatibility
export function getCachedVideo(originalSrc) {
   return originalSrc;
}
