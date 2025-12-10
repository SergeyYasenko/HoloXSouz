import { ref, nextTick } from "vue";
import { levelTransitions, floorsConfig, levelImages } from "../config/navigation.js";

const TRANSITION_END_DELAY = 100;
const NORMAL_TRANSITION_DELAY = 100;
const IMAGE_SWITCH_DELAY = 150;

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

   const stopVideo = () => {
      if (transitionVideo.value) {
         try {
            const video = transitionVideo.value;
            video.pause();
            video.currentTime = 0;

            if (video.src) {
               video.src = "";
               video.load();
            }
         } catch (e) { }
      }
   };

   const resetTransitionState = () => {
      if (transitionVideo.value && timeUpdateHandler) {
         transitionVideo.value.removeEventListener("timeupdate", timeUpdateHandler);
         timeUpdateHandler = null;
      }

      stopVideo();

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
         return;
      }

      const delay = isReverseTransition.value ? TRANSITION_END_DELAY : NORMAL_TRANSITION_DELAY;

      setTimeout(() => {
         if (!isTransitioning.value) return;

         setTimeout(() => {
            if (!isTransitioning.value) return;
            currentLevel.value = targetLevel;

            nextTick(() => {
               requestAnimationFrame(resetTransitionState);
            });
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

   const handleVideoTimeUpdate = (targetLevel) => {
      if (hasSwitchedLevel || !isTransitioning.value || !transitionVideo.value) return;

      const video = transitionVideo.value;
      if (!video.duration || video.currentTime < video.duration * 0.5) return;

      hasSwitchedLevel = true;

      const performSwitch = () => {
         if (!isTransitioning.value) return;

         const targetImageElement = document.querySelector(
            `.home-image-level[data-level="${targetLevel}"]`
         );

         const switchToTarget = () => {
            requestAnimationFrame(() => {
               requestAnimationFrame(() => {
                  if (!isTransitioning.value) return;
                  if (!isReverseTransition.value) {
                     forwardSourceLevel.value = targetLevel;
                  }
                  currentLevel.value = targetLevel;

                  if (transitionVideo.value && timeUpdateHandler) {
                     transitionVideo.value.removeEventListener("timeupdate", timeUpdateHandler);
                     timeUpdateHandler = null;
                  }

                  setTimeout(() => {
                     if (isTransitioning.value) {
                        stopVideo();
                        resetTransitionState();
                     }
                  }, 300);
               });
            });
         };

         if (targetImageElement?.complete) {
            switchToTarget();
         } else if (targetImageElement) {
            targetImageElement.addEventListener("load", switchToTarget, { once: true });
         } else {
            switchToTarget();
         }
      };

      nextTick(performSwitch);
   };

   const startLevelTransition = async (transitionVideoPath, targetLevel, isReverse = false) => {
      if (isTransitioning.value) return;

      stopVideo();

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

      try {
         video.pause();
         video.currentTime = 0;
      } catch (e) { }

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

                  timeUpdateHandler = () => {
                     handleVideoTimeUpdate(targetLevel);
                  };
                  video.addEventListener("timeupdate", timeUpdateHandler);

                  const onEnded = () => {
                     if (timeUpdateHandler) {
                        video.removeEventListener("timeupdate", timeUpdateHandler);
                        timeUpdateHandler = null;
                     }
                  };
                  video.addEventListener("ended", onEnded, { once: true });

                  const onError = () => {
                     if (timeUpdateHandler) {
                        video.removeEventListener("timeupdate", timeUpdateHandler);
                        timeUpdateHandler = null;
                     }
                     if (isTransitioning.value) {
                        stopVideo();
                        handleLevelTransitionEnd(targetLevel);
                     }
                  };
                  video.addEventListener("error", onError, { once: true });
               } catch (error) {
                  if (error.name !== "AbortError" && isTransitioning.value) {
                     stopVideo();
                     handleLevelTransitionEnd(targetLevel);
                  }
               }
               resolve();
            });
         });
      } catch (error) {
         if (error.name !== "AbortError" && isTransitioning.value) {
            stopVideo();
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
         stopVideo();
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

      stopVideo();
      currentLevel.value = targetLevel;
   };

   const cleanup = () => {
      if (transitionVideo.value && timeUpdateHandler) {
         transitionVideo.value.removeEventListener("timeupdate", timeUpdateHandler);
         timeUpdateHandler = null;
      }
      stopVideo();
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
