import { ref, computed } from "vue";

// Порядок: Build1 фото → карта → Build2 фото, затем видео Build1–4
import build1Image from "../assets/holo/Build1.jpeg";
import mapImage from "../assets/holo/map.jpeg";
import build2Image from "../assets/holo/Build2.jpeg";

import build3Image from "../assets/holo/Build3.jpeg";
import apartmentsImage from "../assets/holo/Appartments-right1.jpeg";

import build1Video from "../assets/holo/Build1.mp4";
import build2Video from "../assets/holo/Build2.mp4";
import build3Video from "../assets/holo/Build3.mp4";
import build4Video from "../assets/holo/Build4.mp4";

const CRITICAL_IMAGES = [build1Image, mapImage, build2Image];

const SECONDARY_IMAGES = [build3Image, apartmentsImage];

const VIDEOS_TO_PRELOAD = [
   { key: "build1", src: build1Video },
   { key: "build2", src: build2Video },
   { key: "build3", src: build3Video },
   { key: "build4", src: build4Video },
];

export function usePreloader() {
   const loadedCount = ref(0);
   const totalCount = ref(CRITICAL_IMAGES.length);
   const isLoading = ref(true);
   const errors = ref([]);
   const currentAsset = ref("");

   const progress = computed(() => {
      if (totalCount.value === 0) return 100;
      return Math.round((loadedCount.value / totalCount.value) * 100);
   });

   const preloadImage = (src) => {
      return new Promise((resolve) => {
         const img = new Image();

         img.onload = () => {
            if (img.decode) {
               img.decode()
                  .then(() => {
                     loadedCount.value++;
                     resolve({ src, success: true });
                  })
                  .catch(() => {
                     loadedCount.value++;
                     resolve({ src, success: true });
                  });
            } else {
               loadedCount.value++;
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

   const preloadVideo = (videoEntry) => {
      return new Promise((resolve) => {
         try {
            const { key, src } = videoEntry;
            if (!src) {
               resolve({ key, src, success: false });
               return;
            }

            const video = document.createElement("video");
            if (!video) {
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
               resolve({ key, src, success });
            };

            video.onloadeddata = () => done(true);
            video.onloadedmetadata = () => done(true);
            video.onerror = () => {
               errors.value.push({ type: "video", key, src });
               done(false);
            };

            timeout = setTimeout(() => done(true), 1500);

            video.src = src;
            video.load();
         } catch (error) {
            console.error(`Error preloading video ${videoEntry?.key}:`, error);
            resolve({ key: videoEntry?.key, src: videoEntry?.src, success: false });
         }
      });
   };

   const preloadSecondaryImages = () => {
      SECONDARY_IMAGES.forEach((src) => {
         const img = new Image();
         img.src = src;
      });
   };

   const startPreload = async () => {
      try {
         isLoading.value = true;
         loadedCount.value = 0;
         errors.value = [];

         currentAsset.value = "Loading images...";
         try {
            await Promise.all(CRITICAL_IMAGES.map(preloadImage));
         } catch (error) {
            console.error("Error loading critical images:", error);
         }

         try {
            preloadSecondaryImages();
         } catch (error) {
            console.error("Error loading secondary images:", error);
         }

         try {
            Promise.all(VIDEOS_TO_PRELOAD.map(preloadVideo)).catch((error) => {
               console.error("Error loading videos in background:", error);
            });
         } catch (error) {
            console.error("Error starting video preload:", error);
         }

         currentAsset.value = "";
         isLoading.value = false;

         return {
            success: errors.value.length === 0,
            errors: errors.value,
         };
      } catch (error) {
         console.error("Fatal preloader error:", error);
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
      currentAsset,
      startPreload,
   };
}
