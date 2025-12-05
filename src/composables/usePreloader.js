import { ref, computed, reactive } from "vue";

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

// All images to preload
const IMAGES_TO_PRELOAD = [
   // Main navigation images
   mapImage,
   startImage,
   twoProjectsImage,
   leftImage,
   rightImage,
   // Floor images
   floorImage1,
   floorImage2,
   floorImage3,
   floorImage4,
   floorImageG,
   // Map page images
   mapNewDesktop,
   downtown,
   downtownTable,
   dubaiMarina,
   dubaiMarinaTable,
   marasiDrive,
   marasiDriveTable,
];

// All videos to preload (will be fully loaded into memory)
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

// Global cache for loaded assets (blob URLs for videos)
const assetCache = reactive({
   videos: {},
   images: {},
   isReady: false,
});

/**
 * Get cached video blob URL or original URL
 */
export function getCachedVideo(originalSrc) {
   // Find the video in cache by original src
   for (const [key, blobUrl] of Object.entries(assetCache.videos)) {
      // Match by key or by original src
      const videoEntry = VIDEOS_TO_PRELOAD.find(v => v.key === key);
      if (videoEntry && videoEntry.src === originalSrc) {
         return blobUrl;
      }
   }
   return originalSrc;
}

/**
 * Check if assets are ready
 */
export function areAssetsReady() {
   return assetCache.isReady;
}

/**
 * Composable for preloading all assets
 */
export function usePreloader() {
   const loadedCount = ref(0);
   const totalCount = ref(IMAGES_TO_PRELOAD.length + VIDEOS_TO_PRELOAD.length);
   const isLoading = ref(true);
   const errors = ref([]);
   const currentAsset = ref("");

   const progress = computed(() => {
      if (totalCount.value === 0) return 100;
      return Math.round((loadedCount.value / totalCount.value) * 100);
   });

   // Preload a single image (decode it into memory)
   const preloadImage = (src) => {
      return new Promise((resolve) => {
         const img = new Image();
         img.onload = () => {
            // Decode image to ensure it's in memory
            if (img.decode) {
               img.decode().then(() => {
                  loadedCount.value++;
                  assetCache.images[src] = true;
                  resolve({ src, success: true });
               }).catch(() => {
                  loadedCount.value++;
                  assetCache.images[src] = true;
                  resolve({ src, success: true });
               });
            } else {
               loadedCount.value++;
               assetCache.images[src] = true;
               resolve({ src, success: true });
            }
         };
         img.onerror = () => {
            loadedCount.value++;
            errors.value.push({ type: "image", src });
            resolve({ src, success: false });
         };
         img.src = src;
      });
   };

   // Preload a single video FULLY into memory as blob
   const preloadVideo = async (videoEntry) => {
      const { key, src } = videoEntry;
      currentAsset.value = `Video: ${key}`;

      try {
         // Fetch the entire video file
         const response = await fetch(src);
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         // Get the video as a blob
         const blob = await response.blob();

         // Create a blob URL that can be used directly
         const blobUrl = URL.createObjectURL(blob);

         // Store in cache
         assetCache.videos[key] = blobUrl;

         // Also preload into a video element to decode frames
         await new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "auto";
            video.muted = true;
            video.playsInline = true;

            const onReady = () => {
               video.removeEventListener("canplaythrough", onReady);
               video.removeEventListener("loadeddata", onReady);
               clearTimeout(timeout);
               resolve();
            };

            const timeout = setTimeout(() => {
               video.removeEventListener("canplaythrough", onReady);
               video.removeEventListener("loadeddata", onReady);
               resolve();
            }, 5000);

            video.addEventListener("canplaythrough", onReady);
            video.addEventListener("loadeddata", onReady);
            video.src = blobUrl;
            video.load();
         });

         loadedCount.value++;
         return { key, src, success: true };
      } catch (error) {
         console.warn(`Failed to preload video ${key}:`, error);
         loadedCount.value++;
         errors.value.push({ type: "video", key, src });
         // Store original src as fallback
         assetCache.videos[key] = src;
         return { key, src, success: false };
      }
   };

   // Start preloading all assets
   const startPreload = async () => {
      isLoading.value = true;
      loadedCount.value = 0;
      errors.value = [];
      assetCache.isReady = false;

      const startTime = Date.now();

      currentAsset.value = "Loading images...";

      // Preload all images in parallel
      await Promise.all(IMAGES_TO_PRELOAD.map(preloadImage));

      currentAsset.value = "Loading videos...";

      // Preload videos sequentially to avoid overwhelming the network
      // This is better for mobile devices with limited bandwidth
      for (const videoEntry of VIDEOS_TO_PRELOAD) {
         await preloadVideo(videoEntry);
      }

      // Mark cache as ready
      assetCache.isReady = true;

      // Ensure minimum loading time for smooth UX (at least 500ms)
      const elapsed = Date.now() - startTime;
      const minLoadTime = 500;
      if (elapsed < minLoadTime) {
         await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
      }

      currentAsset.value = "";
      isLoading.value = false;

      console.log("Assets preloaded:", {
         images: Object.keys(assetCache.images).length,
         videos: Object.keys(assetCache.videos).length,
      });

      return {
         success: errors.value.length === 0,
         errors: errors.value,
      };
   };

   return {
      progress,
      isLoading,
      loadedCount,
      totalCount,
      errors,
      currentAsset,
      startPreload,
      assetCache,
   };
}

// Export the cache for use in other components
export { assetCache, VIDEOS_TO_PRELOAD };
