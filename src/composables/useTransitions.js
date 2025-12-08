import { ref, nextTick } from "vue";
import { levelTransitions, floorsConfig, levelImages } from "../config/navigation.js";

const TRANSITION_END_DELAY = 100;
const NORMAL_TRANSITION_DELAY = 100;

export function useTransitions(currentLevel, levelHistory) {
   const isTransitioning = ref(false);
   const transitionVideoSrc = ref("");
   const originalVideoPath = ref("");
   const transitionVideo = ref(null);
   const loadedVideos = ref(new Set());
   const isReverseTransition = ref(false);
   const reverseTransitionTarget = ref(null);
   const reverseSourceLevel = ref(null);
   const forwardSourceLevel = ref(null);
   const preloadImage = ref(null);
   const preloadImageLoaded = ref(false);

   let isHandlingTransitionEnd = false;

   const getLevelImage = (level) => {
      if (levelImages[level]) return levelImages[level];

      if (level?.startsWith("floor-")) {
         const floorId = level.replace("floor-", "");
         return floorsConfig[floorId]?.image || levelImages.start;
      }
      return null;
   };

   const loadVideo = (videoSrc) => {
      if (!videoSrc || loadedVideos.value.has(videoSrc)) return;

      const video = document.createElement("video");
      video.src = videoSrc;
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.load();
      loadedVideos.value.add(videoSrc);
   };

   const resetTransitionState = () => {
      isTransitioning.value = false;
      transitionVideoSrc.value = "";
      originalVideoPath.value = "";
      isReverseTransition.value = false;
      reverseTransitionTarget.value = null;
      reverseSourceLevel.value = null;
      forwardSourceLevel.value = null;
      preloadImage.value = null;
      preloadImageLoaded.value = false;
      isHandlingTransitionEnd = false;
   };

   const handleLevelTransitionEnd = (targetLevel) => {
      if (!isTransitioning.value) return;

      const delay = isReverseTransition.value ? TRANSITION_END_DELAY : NORMAL_TRANSITION_DELAY;

      setTimeout(() => {
         if (!isTransitioning.value) return;

         currentLevel.value = targetLevel;

         nextTick(() => {
            requestAnimationFrame(resetTransitionState);
         });
      }, delay);
   };

   const handleVideoLoaded = () => { };

   const handleTransitionEnd = () => {
      if (isHandlingTransitionEnd || !isTransitioning.value) return;
      isHandlingTransitionEnd = true;

      const currentVideoPath = originalVideoPath.value;

      if (isReverseTransition.value && reverseTransitionTarget.value) {
         handleLevelTransitionEnd(reverseTransitionTarget.value);
         return;
      }

      const forwardTransitions = {
         [levelTransitions["map-to-2-projects"]]: "2-projects",
         [levelTransitions["2-projects-to-start"]]: "start",
         [levelTransitions["start-to-facade-start"]]: "facade-start",
         [levelTransitions["start-to-facade-start-2"]]: "facade-start-2",
      };

      if (forwardTransitions[currentVideoPath]) {
         handleLevelTransitionEnd(forwardTransitions[currentVideoPath]);
         return;
      }

      for (const [floorId, floor] of Object.entries(floorsConfig)) {
         if (currentVideoPath === floor.transitionVideo) {
            handleLevelTransitionEnd(`floor-${floorId}`);
            return;
         }
      }

      if (isTransitioning.value) {
         resetTransitionState();
      }
   };

   const startLevelTransition = async (transitionVideoPath, targetLevel, isReverse = false) => {
      if (isTransitioning.value) return;

      isHandlingTransitionEnd = false;
      isTransitioning.value = true;
      isReverseTransition.value = isReverse;

      if (isReverse) {
         reverseTransitionTarget.value = targetLevel;
         reverseSourceLevel.value = currentLevel.value;
         forwardSourceLevel.value = null;
      } else {
         reverseTransitionTarget.value = null;
         reverseSourceLevel.value = null;
         forwardSourceLevel.value = currentLevel.value;
      }

      const targetImage = getLevelImage(targetLevel);
      if (targetImage) {
         preloadImageLoaded.value = false;
         preloadImage.value = targetImage;

         await nextTick();
         const preloadImg = document.querySelector(".home-image-preload");
         if (preloadImg?.complete) {
            preloadImageLoaded.value = true;
         }
      } else {
         preloadImage.value = null;
         preloadImageLoaded.value = true;
      }

      originalVideoPath.value = transitionVideoPath;
      loadVideo(transitionVideoPath);
      transitionVideoSrc.value = transitionVideoPath;

      await nextTick();

      if (!transitionVideo.value) return;

      const video = transitionVideo.value;
      video.load();

      try {
         if (video.readyState < 2) {
            await new Promise((resolve) => {
               const onCanPlay = () => {
                  video.removeEventListener("canplay", onCanPlay);
                  resolve();
               };
               video.addEventListener("canplay", onCanPlay, { once: true });
               setTimeout(() => {
                  video.removeEventListener("canplay", onCanPlay);
                  resolve();
               }, 1000);
            });
         }

         await new Promise((resolve) => {
            requestAnimationFrame(async () => {
               try {
                  await video.play();
               } catch (error) {
                  if (error.name !== "AbortError" && isTransitioning.value) {
                     handleLevelTransitionEnd(targetLevel);
                  }
               }
               resolve();
            });
         });
      } catch (error) {
         if (error.name !== "AbortError" && isTransitioning.value) {
            handleLevelTransitionEnd(targetLevel);
         }
      }
   };

   const getReverseVideo = (forwardVideoKey) => {
      const reverseKey = forwardVideoKey.split("-to-").reverse().join("-to-");
      return levelTransitions[reverseKey] || levelTransitions[forwardVideoKey];
   };

   const goBackToLevel = (targetLevel, disabledArrowLeftRef, disabledArrowRightRef) => {
      if (isTransitioning.value) return;

      if (currentLevel.value.startsWith("floor-") && targetLevel === "start") {
         const floorId = currentLevel.value.replace("floor-", "");
         const floor = floorsConfig[floorId];

         if (floor?.reverseVideo) {
            startLevelTransition(floor.reverseVideo, targetLevel, true);
            return;
         }
         currentLevel.value = targetLevel;
         return;
      }

      const reverseMap = {
         "start:2-projects": "2-projects-to-start",
         "2-projects:map": "map-to-2-projects",
         "facade-start:start": "start-to-facade-start",
         "facade-start-2:start": "start-to-facade-start-2",
      };

      const key = `${currentLevel.value}:${targetLevel}`;
      const forwardKey = reverseMap[key];

      if (forwardKey) {
         const reverseVideo = getReverseVideo(forwardKey);

         if (reverseVideo) {
            if (currentLevel.value === "facade-start" && disabledArrowRightRef) {
               disabledArrowRightRef.value = false;
            }
            if (currentLevel.value === "facade-start-2" && disabledArrowLeftRef) {
               disabledArrowLeftRef.value = false;
            }

            startLevelTransition(reverseVideo, targetLevel, true);
            return;
         }
      }

      currentLevel.value = targetLevel;
   };

   const cleanup = () => {
      resetTransitionState();
   };

   return {
      isTransitioning,
      transitionVideoSrc,
      transitionVideo,
      preloadImage,
      preloadImageLoaded,
      isReverseTransition,
      reverseSourceLevel,
      forwardSourceLevel,
      handleVideoLoaded,
      handleTransitionEnd,
      startLevelTransition,
      goBackToLevel,
      cleanup,
      onPreloadImageLoaded: () => {
         preloadImageLoaded.value = true;
      },
   };
}
