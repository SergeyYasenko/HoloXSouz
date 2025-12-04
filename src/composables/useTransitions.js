import { ref, nextTick } from "vue";
import { levelTransitions, floorsConfig, levelImages } from "../config/navigation.js";

/**
 * Composable for managing video transitions between levels
 */
export function useTransitions(currentLevel, levelHistory) {
   const isTransitioning = ref(false);
   const transitionVideoSrc = ref("");
   const transitionVideo = ref(null);
   const loadedVideos = ref(new Set());
   const isReverseTransition = ref(false);
   const reverseTransitionTarget = ref(null);
   const preloadImage = ref(null);
   const preloadImageLoaded = ref(false);
   let reverseInterval = null;

   // Helper to get level image
   const getLevelImage = (level) => {
      if (level === "map") return levelImages.map;
      if (level === "2-projects") return levelImages["2-projects"];
      if (level === "start") return levelImages.start;
      if (level === "facade-start") return levelImages["facade-start"];
      if (level === "facade-start-2") return levelImages["facade-start-2"];
      if (level && level.startsWith("floor-")) {
         const floorId = level.replace("floor-", "");
         const floor = floorsConfig[floorId];
         return floor?.image || levelImages.start;
      }
      return null;
   };

   // Load video helper
   const loadVideo = (videoSrc) => {
      if (!videoSrc || loadedVideos.value.has(videoSrc)) return;
      const video = document.createElement("video");
      video.src = videoSrc;
      video.preload = "auto";
      video.muted = true;
      video.load();
      loadedVideos.value.add(videoSrc);
   };

   // Handle level transition end
   const handleLevelTransitionEnd = (targetLevel) => {
      if (reverseInterval) {
         clearInterval(reverseInterval);
         reverseInterval = null;
      }

      currentLevel.value = targetLevel;

      nextTick(() => {
         requestAnimationFrame(() => {
            isTransitioning.value = false;
            transitionVideoSrc.value = "";
            isReverseTransition.value = false;
            reverseTransitionTarget.value = null;
            preloadImage.value = null;
            preloadImageLoaded.value = false;
         });
      });
   };

   // Handle video loaded for reverse playback
   const handleVideoLoaded = () => {
      if (transitionVideo.value && isReverseTransition.value) {
         const video = transitionVideo.value;

         if (reverseInterval) {
            clearInterval(reverseInterval);
            reverseInterval = null;
         }

         const startReverse = () => {
            if (!video || !isReverseTransition.value) return;

            const startTime = Date.now();
            const startVideoTime = video.duration;
            video.currentTime = startVideoTime;

            reverseInterval = setInterval(() => {
               if (!video || !isReverseTransition.value) {
                  if (reverseInterval) {
                     clearInterval(reverseInterval);
                     reverseInterval = null;
                  }
                  return;
               }

               const elapsed = (Date.now() - startTime) / 1000;
               const newTime = Math.max(0, startVideoTime - elapsed);

               if (newTime <= 0 || elapsed >= startVideoTime) {
                  if (reverseInterval) {
                     clearInterval(reverseInterval);
                     reverseInterval = null;
                  }
                  video.currentTime = 0;
                  setTimeout(() => {
                     handleTransitionEnd();
                  }, 50);
                  return;
               }

               video.currentTime = newTime;
            }, 33);
         };

         if (video.readyState >= 2 && video.duration) {
            video.pause();
            startReverse();
         } else {
            video.addEventListener(
               "canplay",
               () => {
                  if (video.duration) {
                     video.pause();
                     startReverse();
                  }
               },
               { once: true }
            );
         }
      }
   };

   // Handle transition end
   const handleTransitionEnd = () => {
      const currentVideoSrc = transitionVideoSrc.value;

      if (isReverseTransition.value && reverseTransitionTarget.value) {
         handleLevelTransitionEnd(reverseTransitionTarget.value);
         return;
      }

      // Check transitions
      if (currentVideoSrc === levelTransitions["map-to-2-projects"]) {
         handleLevelTransitionEnd("2-projects");
         return;
      }
      if (currentVideoSrc === levelTransitions["2-projects-to-start"]) {
         handleLevelTransitionEnd("start");
         return;
      }
      if (currentVideoSrc === levelTransitions["start-to-facade-start"]) {
         handleLevelTransitionEnd("facade-start");
         return;
      }
      if (currentVideoSrc === levelTransitions["start-to-facade-start-2"]) {
         handleLevelTransitionEnd("facade-start-2");
         return;
      }

      // Check floor transitions
      for (const [floorId, floor] of Object.entries(floorsConfig)) {
         if (currentVideoSrc === floor.transitionVideo) {
            handleLevelTransitionEnd(`floor-${floorId}`);
            return;
         }
      }

      // Fallback
      isTransitioning.value = false;
      transitionVideoSrc.value = "";
      isReverseTransition.value = false;
      reverseTransitionTarget.value = null;
   };

   // Start level transition
   const startLevelTransition = async (
      transitionVideoPath,
      targetLevel,
      reverse = false
   ) => {
      isTransitioning.value = true;
      isReverseTransition.value = reverse;

      if (reverse) {
         reverseTransitionTarget.value = targetLevel;
      } else {
         reverseTransitionTarget.value = null;
      }

      // Preload image
      const targetImage = getLevelImage(targetLevel);
      if (targetImage) {
         preloadImageLoaded.value = false;
         preloadImage.value = targetImage;

         await nextTick();
         const preloadImg = document.querySelector(".home-image-preload");
         if (preloadImg && preloadImg.complete) {
            preloadImageLoaded.value = true;
         }
      } else {
         preloadImage.value = null;
         preloadImageLoaded.value = true;
      }

      loadVideo(transitionVideoPath);
      transitionVideoSrc.value = transitionVideoPath;

      await nextTick();
      if (transitionVideo.value) {
         transitionVideo.value.load();
         if (!reverse) {
            try {
               await transitionVideo.value.play();
            } catch (error) {
               console.error("Error playing transition video:", error);
               handleLevelTransitionEnd(targetLevel);
            }
         }
      }
   };

   // Go back to level
   const goBackToLevel = (targetLevel, disabledArrowLeftRef, disabledArrowRightRef) => {
      let reverseVideo = null;

      // Floor to start
      if (currentLevel.value.startsWith("floor-") && targetLevel === "start") {
         const floorId = currentLevel.value.replace("floor-", "");
         const floor = floorsConfig[floorId];
         if (floor?.transitionVideo) {
            startLevelTransition(floor.transitionVideo, targetLevel, true);
            return;
         }
         currentLevel.value = targetLevel;
         return;
      }

      // Start to 2-projects
      if (currentLevel.value === "start" && targetLevel === "2-projects") {
         reverseVideo = levelTransitions["2-projects-to-start"];
         if (reverseVideo) {
            startLevelTransition(reverseVideo, targetLevel, true);
            return;
         }
         currentLevel.value = targetLevel;
         return;
      }

      // 2-projects to map
      if (currentLevel.value === "2-projects" && targetLevel === "map") {
         reverseVideo = levelTransitions["map-to-2-projects"];
         if (reverseVideo) {
            startLevelTransition(reverseVideo, targetLevel, true);
            return;
         }
         currentLevel.value = targetLevel;
         return;
      }

      // Facade-start to start
      if (currentLevel.value === "facade-start" && targetLevel === "start") {
         reverseVideo = levelTransitions["start-to-facade-start"];
         if (reverseVideo) {
            if (disabledArrowRightRef) disabledArrowRightRef.value = false;
            startLevelTransition(reverseVideo, targetLevel, true);
            return;
         }
         if (disabledArrowRightRef) disabledArrowRightRef.value = false;
         currentLevel.value = targetLevel;
         return;
      }

      // Facade-start-2 to start
      if (currentLevel.value === "facade-start-2" && targetLevel === "start") {
         reverseVideo = levelTransitions["start-to-facade-start-2"];
         if (reverseVideo) {
            if (disabledArrowLeftRef) disabledArrowLeftRef.value = false;
            startLevelTransition(reverseVideo, targetLevel, true);
            return;
         }
         if (disabledArrowLeftRef) disabledArrowLeftRef.value = false;
         currentLevel.value = targetLevel;
         return;
      }

      currentLevel.value = targetLevel;
   };

   // Cleanup
   const cleanup = () => {
      if (reverseInterval) {
         clearInterval(reverseInterval);
         reverseInterval = null;
      }
   };

   return {
      isTransitioning,
      transitionVideoSrc,
      transitionVideo,
      preloadImage,
      preloadImageLoaded,
      handleVideoLoaded,
      handleTransitionEnd,
      handleLevelTransitionEnd,
      startLevelTransition,
      goBackToLevel,
      cleanup,
      onPreloadImageLoaded: () => {
         preloadImageLoaded.value = true;
         console.log("Preload image loaded:", preloadImage.value);
      },
   };
}

