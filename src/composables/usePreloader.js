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

// All videos to preload
const VIDEOS_TO_PRELOAD = [
   internetCityVideo,
   theRoyalYachtVideo,
   facadeStartVideo,
   facadeStart2Video,
   floor1Video,
   floor2Video,
   floor3Video,
   floor4Video,
   floorGVideo,
];

/**
 * Composable for preloading all assets
 */
export function usePreloader() {
   const loadedCount = ref(0);
   const totalCount = ref(IMAGES_TO_PRELOAD.length + VIDEOS_TO_PRELOAD.length);
   const isLoading = ref(true);
   const errors = ref([]);

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

   // Preload a single video (just metadata, not full video)
   const preloadVideo = (src) => {
      return new Promise((resolve) => {
         const video = document.createElement("video");
         video.preload = "auto";

         video.oncanplaythrough = () => {
            loadedCount.value++;
            resolve({ src, success: true });
         };

         video.onerror = () => {
            loadedCount.value++;
            errors.value.push({ type: "video", src });
            resolve({ src, success: false });
         };

         // Timeout fallback for slow connections
         const timeout = setTimeout(() => {
            loadedCount.value++;
            resolve({ src, success: true, timeout: true });
         }, 10000); // 10 second timeout per video

         video.oncanplaythrough = () => {
            clearTimeout(timeout);
            loadedCount.value++;
            resolve({ src, success: true });
         };

         video.src = src;
         video.load();
      });
   };

   // Start preloading all assets
   const startPreload = async () => {
      isLoading.value = true;
      loadedCount.value = 0;
      errors.value = [];

      const startTime = Date.now();

      // Preload images first (they're usually smaller)
      const imagePromises = IMAGES_TO_PRELOAD.map(preloadImage);

      // Then preload videos
      const videoPromises = VIDEOS_TO_PRELOAD.map(preloadVideo);

      // Wait for all to complete
      await Promise.all([...imagePromises, ...videoPromises]);

      // Ensure minimum loading time for smooth UX (at least 800ms)
      const elapsed = Date.now() - startTime;
      const minLoadTime = 800;
      if (elapsed < minLoadTime) {
         await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
      }

      isLoading.value = false;

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
      startPreload,
   };
}

