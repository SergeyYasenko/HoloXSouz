import { ref, nextTick } from "vue";
import { levelTransitions, floorsConfig, levelImages } from "../config/navigation.js";

const TRANSITION_END_DELAY = 100;
const NORMAL_TRANSITION_DELAY = 100;
const IMAGE_SWITCH_DELAY = 150;
const APARTMENT_CHAIN_LEVELS = new Set([
   "builds",
   "build8",
   "builds-2",
   "view-4",
   "view-5",
   "view-6",
]);

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
   let hasSwitchedLevel = false;
   let timeUpdateHandler = null;

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
      if (transitionVideo.value) {
         if (timeUpdateHandler) {
            transitionVideo.value.removeEventListener("timeupdate", timeUpdateHandler);
            timeUpdateHandler = null;
         }
         try {
            transitionVideo.value.pause();
            transitionVideo.value.currentTime = 0;
            transitionVideo.value.src = "";
            transitionVideo.value.load();
         } catch (e) { }
      }
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
      hasSwitchedLevel = false;
   };

   const handleLevelTransitionEnd = (targetLevel, immediate = false) => {
      if (!isTransitioning.value) return;

      if (immediate) {
         currentLevel.value = targetLevel;
         resetTransitionState();
         return;
      }

      const delay = isReverseTransition.value ? TRANSITION_END_DELAY : NORMAL_TRANSITION_DELAY;

      setTimeout(() => {
         if (!isTransitioning.value) return;
         currentLevel.value = targetLevel;
         setTimeout(() => {
            if (isTransitioning.value) {
               resetTransitionState();
            }
         }, IMAGE_SWITCH_DELAY);
      }, delay);
   };

   const handleVideoLoaded = () => { };

   const handleTransitionEnd = () => {
      if (isHandlingTransitionEnd || !isTransitioning.value) return;

      if (hasSwitchedLevel) {
         resetTransitionState();
         return;
      }

      isHandlingTransitionEnd = true;

      const currentVideoPath = originalVideoPath.value;

      if (isReverseTransition.value && reverseTransitionTarget.value) {
         handleLevelTransitionEnd(reverseTransitionTarget.value);
         return;
      }

      const forwardTransitions = {
         [levelTransitions["map-to-2-projects"]]: "start",
         [levelTransitions["2-projects-to-start"]]: "plane",
         [levelTransitions["start-to-facade-start"]]: "builds",
         [levelTransitions["start-to-facade-start-2"]]: "builds-2",
         [levelTransitions["view-6-to-facade-start"]]: "build8",
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

   const handleVideoTimeUpdate = (targetLevel) => {
      if (hasSwitchedLevel || !isTransitioning.value || !transitionVideo.value) return;

      const video = transitionVideo.value;
      if (!video.duration || video.currentTime < video.duration * 0.5) return;

      if (!isTransitioning.value) return;

      const targetImageElement = document.querySelector(
         `.home-image-level[data-level="${targetLevel}"]`
      );

      const switchToTarget = () => {
         if (!isTransitioning.value) return;

         // Mark only after the static level actually switched.
         // Otherwise on `ended` we may reset transition before the image swap,
         // causing a visible "jump" at the end of the forward chain.
         hasSwitchedLevel = true;

         if (!isReverseTransition.value) {
            forwardSourceLevel.value = targetLevel;
         }
         currentLevel.value = targetLevel;
      };

      if (targetImageElement?.complete) {
         switchToTarget();
      } else if (targetImageElement) {
         targetImageElement.addEventListener("load", switchToTarget, { once: true });
      } else {
         switchToTarget();
      }
   };

   const startLevelTransition = async (transitionVideoPath, targetLevel, isReverse = false) => {
      if (isTransitioning.value) return;

      resetTransitionState();

      isHandlingTransitionEnd = false;
      hasSwitchedLevel = false;
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
      const shouldAwaitPreloadImage =
         APARTMENT_CHAIN_LEVELS.has(targetLevel) && !!targetImage;

      if (targetImage) {
         preloadImageLoaded.value = false;
         preloadImage.value = targetImage;
         nextTick(() => {
            if (!isTransitioning.value) return;
            const preloadImg = document.querySelector(".home-image-preload");
            if (preloadImg?.complete) {
               preloadImageLoaded.value = true;
            }
         });
      } else {
         preloadImage.value = null;
         preloadImageLoaded.value = true;
      }

      originalVideoPath.value = transitionVideoPath;
      loadVideo(transitionVideoPath);
      transitionVideoSrc.value = transitionVideoPath;

      await nextTick();

      if (!isTransitioning.value || !transitionVideo.value) {
         resetTransitionState();
         return;
      }

      const video = transitionVideo.value;
      video.load();

      // Ensure target static image is fully decoded before starting the transition.
      // This prevents visible "jump" caused by late image swap on some steps.
      if (shouldAwaitPreloadImage && isTransitioning.value) {
         const preloadImg = document.querySelector(".home-image-preload");
         if (preloadImg && !preloadImg.complete) {
            await new Promise((resolve) => {
               preloadImg.addEventListener("load", () => resolve(), { once: true });
               preloadImg.addEventListener("error", () => resolve(), { once: true });
               setTimeout(() => resolve(), 1500); // Safety timeout
            });
         }
      }

      try {
         if (video.readyState < 2) {
            await new Promise((resolve) => {
               if (!isTransitioning.value) {
                  resolve();
                  return;
               }
               const onCanPlay = () => {
                  video.removeEventListener("canplay", onCanPlay);
                  resolve();
               };
               video.addEventListener("canplay", onCanPlay, { once: true });
               setTimeout(() => {
                  video.removeEventListener("canplay", onCanPlay);
                  resolve();
               }, 100);
            });
         }

         if (!isTransitioning.value) {
            resetTransitionState();
            return;
         }

         try {
            await video.play();

            if (!isTransitioning.value) {
               try {
                  video.pause();
                  video.currentTime = 0;
               } catch (e) { }
               resetTransitionState();
               return;
            }

            timeUpdateHandler = () => {
               handleVideoTimeUpdate(targetLevel);
            };
            video.addEventListener("timeupdate", timeUpdateHandler);

            video.addEventListener("ended", () => {
               if (timeUpdateHandler) {
                  video.removeEventListener("timeupdate", timeUpdateHandler);
                  timeUpdateHandler = null;
               }
            }, { once: true });
         } catch (error) {
            if (error.name !== "AbortError" && isTransitioning.value) {
               handleLevelTransitionEnd(targetLevel);
            } else {
               resetTransitionState();
            }
         }
      } catch (error) {
         if (error.name !== "AbortError" && isTransitioning.value) {
            handleLevelTransitionEnd(targetLevel);
         } else {
            resetTransitionState();
         }
      }
   };

   const getReverseVideo = (forwardVideoKey) => {
      const reverseKey = forwardVideoKey.split("-to-").reverse().join("-to-");
      return levelTransitions[reverseKey] || levelTransitions[forwardVideoKey];
   };

   const goBackToLevel = (targetLevel, disabledArrowLeftRef, disabledArrowRightRef) => {
      if (isTransitioning.value) {
         resetTransitionState();
      }

      if (currentLevel.value.startsWith("floor-") && targetLevel === "plane") {
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
         "plane:start": "2-projects-to-start",
         "start:map": "map-to-2-projects",
         // Влево с builds: обход круга к view-6 — реверс от сегмента view-6 → build8
         "builds:view-6": "view-6-to-facade-start",
         "builds:plane": "start-to-facade-start",
         "builds-2:plane": "start-to-facade-start-2",
         "builds-2:builds": "facade-start-to-facade-start-2",
         "view-4:builds-2": "facade-start-to-view-4",
         "view-5:view-4": "view-4-to-view-5",
         "view-6:view-5": "view-5-to-view-6",
         "build8:view-6": "view-6-to-facade-start",
         "builds-2:build8": "start-to-facade-start-2",
         "leftFootballField:plane": "start-to-leftFootballField",
         "sportsCourts:plane": "start-to-sportsCourts",
         "sportsCenter:plane": "start-to-sportsCenter",
         "sportsCenterTop:plane": "start-to-sportsCenterTop",
         "rightStadium:plane": "start-to-rightStadium",
         "innerCourtyard:plane": "start-to-innerCourtyard",
      };

      const key = `${currentLevel.value}:${targetLevel}`;
      const forwardKey = reverseMap[key];

      if (forwardKey) {
         const reverseVideo = getReverseVideo(forwardKey);

         if (reverseVideo) {
            if (currentLevel.value === "builds" && disabledArrowRightRef) {
               disabledArrowRightRef.value = false;
            }
            if (currentLevel.value === "builds-2" && disabledArrowLeftRef) {
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
