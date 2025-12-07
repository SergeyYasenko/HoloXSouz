import { ref, nextTick } from "vue";
import { levelTransitions, floorsConfig, levelImages } from "../config/navigation.js";

/**
 * Composable for managing video transitions between levels
 */
export function useTransitions(currentLevel, levelHistory) {
   const isTransitioning = ref(false);
   const transitionVideoSrc = ref("");
   const originalVideoPath = ref(""); // Store original path for comparison
   const transitionVideo = ref(null);
   const loadedVideos = ref(new Set());
   const isReverseTransition = ref(false);
   const isProgrammaticReverse = ref(false); // True if using programmatic reverse, false if dedicated reverse video
   const reverseTransitionTarget = ref(null);
   const reverseSourceLevel = ref(null); // Store source level for reverse to keep image visible
   const preloadImage = ref(null);
   const preloadImageLoaded = ref(false);
   let reverseRafId = null; // For requestAnimationFrame-based reverse playback (60fps smooth)
   let isHandlingTransitionEnd = false; // Flag to prevent multiple calls to handleTransitionEnd

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

   // Load video helper - optimized for mobile
   const loadVideo = (videoSrc) => {
      if (!videoSrc || loadedVideos.value.has(videoSrc)) return;
      const video = document.createElement("video");
      video.src = videoSrc;
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      // Optimize for mobile playback
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x5-playsinline", "");
      // Start loading
      video.load();
      // Pre-buffer video for smoother playback
      video.addEventListener("canplaythrough", () => {
         // Video is ready to play through without buffering
      }, { once: true });
      loadedVideos.value.add(videoSrc);
   };

   // Handle level transition end
   const handleLevelTransitionEnd = (targetLevel) => {
      // Prevent multiple calls
      if (!isTransitioning.value) {
         console.warn("handleLevelTransitionEnd called but not transitioning");
         return;
      }

      if (reverseRafId) {
         cancelAnimationFrame(reverseRafId);
         reverseRafId = null;
      }

      // For reverse transitions, ensure video has finished before changing level
      // Add 1 second delay to keep previous image visible during reverse
      if (isReverseTransition.value && transitionVideo.value) {
         const video = transitionVideo.value;
         // Wait 1 second to keep previous image visible during reverse
         setTimeout(() => {
            // Double-check we're still transitioning (prevent race conditions)
            if (!isTransitioning.value) return;

            currentLevel.value = targetLevel;

            nextTick(() => {
               requestAnimationFrame(() => {
                  isTransitioning.value = false;
                  transitionVideoSrc.value = "";
                  originalVideoPath.value = "";
                  isReverseTransition.value = false;
                  isProgrammaticReverse.value = false;
                  reverseTransitionTarget.value = null;
                  reverseSourceLevel.value = null;
                  preloadImage.value = null;
                  preloadImageLoaded.value = false;
                  isHandlingTransitionEnd = false;
               });
            });
         }, 100); // 1 second delay to keep previous image visible
      } else {
         // Normal transition - change level only after video completes
         // Add small delay to ensure video frame is fully displayed
         setTimeout(() => {
            // Double-check we're still transitioning (prevent race conditions)
            if (!isTransitioning.value) return;

            currentLevel.value = targetLevel;

            nextTick(() => {
               requestAnimationFrame(() => {
                  isTransitioning.value = false;
                  transitionVideoSrc.value = "";
                  originalVideoPath.value = "";
                  isReverseTransition.value = false;
                  isProgrammaticReverse.value = false;
                  reverseTransitionTarget.value = null;
                  reverseSourceLevel.value = null;
                  preloadImage.value = null;
                  preloadImageLoaded.value = false;
                  isHandlingTransitionEnd = false;
               });
            });
         }, 100); // Small delay to ensure video is fully finished
      }
   };

   // Handle video loaded for reverse playback (only for programmatic reverse)
   const handleVideoLoaded = () => {
      if (transitionVideo.value && isReverseTransition.value && isProgrammaticReverse.value) {
         const video = transitionVideo.value;

         if (reverseInterval) {
            clearInterval(reverseInterval);
            reverseInterval = null;
         }
         if (reverseRafId) {
            cancelAnimationFrame(reverseRafId);
            reverseRafId = null;
         }

         const startReverse = () => {
            if (!video || !isReverseTransition.value) return;

            // Ensure video has duration
            if (!video.duration || isNaN(video.duration) || video.duration <= 0) {
               console.warn("Video duration not available, skipping reverse");
               handleTransitionEnd();
               return;
            }

            // Ensure video is visible and ready
            video.style.display = 'block';
            video.style.opacity = '1';
            video.style.zIndex = '10';

            const startTime = Date.now();
            const startVideoTime = video.duration;

            // Set video to end and pause
            video.currentTime = startVideoTime;
            video.pause();

            // Small delay to ensure currentTime is set (important for mobile)
            setTimeout(() => {
               if (!video || !isReverseTransition.value) return;

               // Verify video is at the end
               if (Math.abs(video.currentTime - startVideoTime) > 0.1) {
                  video.currentTime = startVideoTime;
               }

               // Use requestAnimationFrame for smoother reverse playback on mobile
               const reverseFrame = () => {
                  if (!video || !isReverseTransition.value) {
                     if (reverseRafId) {
                        cancelAnimationFrame(reverseRafId);
                        reverseRafId = null;
                     }
                     return;
                  }

                  const elapsed = (Date.now() - startTime) / 1000;
                  const newTime = Math.max(0, startVideoTime - elapsed);

                  if (newTime <= 0 || elapsed >= startVideoTime) {
                     if (reverseRafId) {
                        cancelAnimationFrame(reverseRafId);
                        reverseRafId = null;
                     }
                     video.currentTime = 0;
                     // Wait a bit longer to ensure video frame is updated and reverse is complete
                     requestAnimationFrame(() => {
                        // Ensure video is still visible and we're still in reverse transition
                        if (video && isReverseTransition.value && isTransitioning.value) {
                           // Reverse is complete, trigger transition end
                           handleTransitionEnd();
                        }
                     });
                     return;
                  }

                  video.currentTime = newTime;
                  reverseRafId = requestAnimationFrame(reverseFrame);
               };

               // Start reverse playback using requestAnimationFrame for 60fps smoothness
               reverseRafId = requestAnimationFrame(reverseFrame);
            }, 150); // Delay for mobile devices to ensure video is ready
         };

         // Check if video is ready
         if (video.readyState >= 2 && video.duration && !isNaN(video.duration) && video.duration > 0) {
            video.pause();
            startReverse();
         } else {
            // Wait for video to be ready (important for mobile)
            const checkReady = () => {
               if (video.readyState >= 2 && video.duration && !isNaN(video.duration) && video.duration > 0) {
                  video.pause();
                  startReverse();
               } else {
                  // Try again after a short delay
                  setTimeout(checkReady, 50);
               }
            };

            video.addEventListener(
               "loadeddata",
               () => {
                  if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                     video.pause();
                     startReverse();
                  } else {
                     checkReady();
                  }
               },
               { once: true }
            );

            video.addEventListener(
               "canplay",
               () => {
                  if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                     video.pause();
                     startReverse();
                  }
               },
               { once: true }
            );

            // Fallback timeout
            setTimeout(() => {
               if (isReverseTransition.value && transitionVideo.value === video) {
                  if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                     video.pause();
                     startReverse();
                  } else {
                     console.warn("Video not ready for reverse, ending transition");
                     handleTransitionEnd();
                  }
               }
            }, 10);
         }
      }
   };

   // Handle transition end
   const handleTransitionEnd = () => {
      // Prevent multiple calls
      if (isHandlingTransitionEnd || !isTransitioning.value) {
         return;
      }

      isHandlingTransitionEnd = true;

      // Use original path for comparison (blob URLs won't match)
      const currentVideoPath = originalVideoPath.value;

      if (isReverseTransition.value && reverseTransitionTarget.value) {
         handleLevelTransitionEnd(reverseTransitionTarget.value);
         return;
      }

      // Check transitions
      if (currentVideoPath === levelTransitions["map-to-2-projects"]) {
         handleLevelTransitionEnd("2-projects");
         return;
      }
      if (currentVideoPath === levelTransitions["2-projects-to-start"]) {
         handleLevelTransitionEnd("start");
         return;
      }
      if (currentVideoPath === levelTransitions["start-to-facade-start"]) {
         handleLevelTransitionEnd("facade-start");
         return;
      }
      if (currentVideoPath === levelTransitions["start-to-facade-start-2"]) {
         handleLevelTransitionEnd("facade-start-2");
         return;
      }

      // Check floor transitions
      for (const [floorId, floor] of Object.entries(floorsConfig)) {
         if (currentVideoPath === floor.transitionVideo) {
            handleLevelTransitionEnd(`floor-${floorId}`);
            return;
         }
      }

      // Fallback - only reset if we're actually transitioning
      if (isTransitioning.value) {
         isTransitioning.value = false;
         transitionVideoSrc.value = "";
         originalVideoPath.value = "";
         isReverseTransition.value = false;
         isProgrammaticReverse.value = false;
         reverseTransitionTarget.value = null;
         reverseSourceLevel.value = null;
         isHandlingTransitionEnd = false;
      }
   };

   // Start level transition
   const startLevelTransition = async (
      transitionVideoPath,
      targetLevel,
      useProgrammaticReverse = false
   ) => {
      // Prevent starting new transition if one is already in progress
      if (isTransitioning.value) {
         console.warn("Transition already in progress, ignoring new transition request");
         return;
      }

      // Reset flags
      isHandlingTransitionEnd = false;
      isTransitioning.value = true;

      // Determine if this is a reverse transition
      // useProgrammaticReverse can be:
      // - undefined: normal forward transition
      // - true: reverse transition using programmatic reverse
      // - false: reverse transition using dedicated reverse video (plays normally)
      const isReverse = useProgrammaticReverse !== undefined; // If parameter is provided, it's a reverse

      isReverseTransition.value = isReverse; // Set based on whether this is actually a reverse
      isProgrammaticReverse.value = useProgrammaticReverse === true; // Only true for programmatic reverse

      if (isReverse) {
         reverseTransitionTarget.value = targetLevel;
         // Store current level to keep its image visible during reverse
         reverseSourceLevel.value = currentLevel.value;
      } else {
         reverseTransitionTarget.value = null;
         reverseSourceLevel.value = null;
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

      // Store original path for comparison later
      originalVideoPath.value = transitionVideoPath;

      // Load and set video source
      loadVideo(transitionVideoPath);
      transitionVideoSrc.value = transitionVideoPath;

      await nextTick();
      if (transitionVideo.value) {
         const video = transitionVideo.value;

         // Optimize video for mobile playback
         video.load();

         // Ensure video is ready before playing (critical for mobile)
         const playVideo = async () => {
            try {
               // Wait for video to be ready
               if (video.readyState < 2) {
                  await new Promise((resolve) => {
                     const onCanPlay = () => {
                        video.removeEventListener("canplay", onCanPlay);
                        resolve();
                     };
                     video.addEventListener("canplay", onCanPlay, { once: true });

                     // Fallback timeout
                     setTimeout(() => {
                        video.removeEventListener("canplay", onCanPlay);
                        resolve();
                     }, 1000);
                  });
               }

               // Use requestAnimationFrame to ensure smooth start
               await new Promise((resolve) => {
                  requestAnimationFrame(async () => {
                     try {
                        await video.play();
                        resolve();
                     } catch (error) {
                        // AbortError is not critical - it just means the play was interrupted
                        // Only log and handle if it's not an AbortError
                        if (error.name !== "AbortError") {
                           console.error("Error playing transition video:", error);
                           // Only handle error if we're still transitioning
                           if (isTransitioning.value) {
                              handleLevelTransitionEnd(targetLevel);
                           }
                        }
                        resolve();
                     }
                  });
               });
            } catch (error) {
               // AbortError is not critical - it just means the play was interrupted
               if (error.name !== "AbortError") {
                  console.error("Error in playVideo:", error);
                  // Only handle error if we're still transitioning
                  if (isTransitioning.value) {
                     handleLevelTransitionEnd(targetLevel);
                  }
               }
            }
         };

         if (!isReverseTransition.value) {
            // Normal forward transition
            await playVideo();
         } else {
            // Reverse transition
            // If we have a dedicated reverse video, play it normally (forward)
            // If not, use programmatic reverse
            if (!isProgrammaticReverse.value) {
               // Dedicated reverse video - play normally
               await playVideo();
            } else {
               // Use programmatic reverse - wait for video to load, then start reverse playback
               const startReverseWhenReady = () => {
                  if (!video || !isReverseTransition.value) return;

                  // Check if video is ready
                  if (video.readyState >= 2 && video.duration && !isNaN(video.duration) && video.duration > 0) {
                     // Video is ready, start reverse
                     handleVideoLoaded();
                  } else {
                     // Wait for video to be ready
                     const onReady = () => {
                        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                           handleVideoLoaded();
                        }
                     };

                     video.addEventListener("loadeddata", onReady, { once: true });
                     video.addEventListener("canplay", onReady, { once: true });
                     video.addEventListener("loadedmetadata", onReady, { once: true });

                     // Fallback timeout
                     setTimeout(() => {
                        if (isReverseTransition.value && transitionVideo.value === video) {
                           if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                              handleVideoLoaded();
                           } else {
                              console.warn("Video not ready for reverse after timeout");
                              // Still try to start reverse
                              handleVideoLoaded();
                           }
                        }
                     }, 100);
                  }
               };

               // Start checking when video is ready
               startReverseWhenReady();
            }
         }
      }
   };

   // Helper to get reverse video (checks for dedicated reverse video first, then uses forward video)
   const getReverseVideo = (forwardVideoKey) => {
      // First, try to find a dedicated reverse video
      // Format: "start-to-2-projects" -> "2-projects-to-start-reverse" or "2-projects-to-start"
      const reverseKey = forwardVideoKey.split("-to-").reverse().join("-to-");
      const dedicatedReverse = levelTransitions[`${reverseKey}-reverse`] || levelTransitions[reverseKey];

      if (dedicatedReverse) {
         return { video: dedicatedReverse, isDedicated: true };
      }

      // Fallback: use forward video and play it in reverse programmatically
      const forwardVideo = levelTransitions[forwardVideoKey];
      return { video: forwardVideo, isDedicated: false };
   };

   // Go back to level
   const goBackToLevel = (targetLevel, disabledArrowLeftRef, disabledArrowRightRef) => {
      // Prevent level change if transition is in progress
      if (isTransitioning.value) {
         console.warn("Cannot change level during transition");
         return;
      }

      let reverseVideo = null;
      let useProgrammaticReverse = false;

      // Floor to start
      if (currentLevel.value.startsWith("floor-") && targetLevel === "start") {
         const floorId = currentLevel.value.replace("floor-", "");
         const floor = floorsConfig[floorId];
         if (floor?.reverseVideo) {
            // Use dedicated reverse video (play normally)
            startLevelTransition(floor.reverseVideo, targetLevel, false);
            return;
         } else if (floor?.transitionVideo) {
            // Fallback: use programmatic reverse
            startLevelTransition(floor.transitionVideo, targetLevel, true);
            return;
         }
         // No transition video, change level directly (only if not transitioning)
         if (!isTransitioning.value) {
            currentLevel.value = targetLevel;
         }
         return;
      }

      // Start to 2-projects
      if (currentLevel.value === "start" && targetLevel === "2-projects") {
         const reverse = getReverseVideo("2-projects-to-start");
         if (reverse.video) {
            startLevelTransition(reverse.video, targetLevel, !reverse.isDedicated);
            return;
         }
         // No transition video, change level directly (only if not transitioning)
         if (!isTransitioning.value) {
            currentLevel.value = targetLevel;
         }
         return;
      }

      // 2-projects to map
      if (currentLevel.value === "2-projects" && targetLevel === "map") {
         const reverse = getReverseVideo("map-to-2-projects");
         if (reverse.video) {
            startLevelTransition(reverse.video, targetLevel, !reverse.isDedicated);
            return;
         }
         // No transition video, change level directly (only if not transitioning)
         if (!isTransitioning.value) {
            currentLevel.value = targetLevel;
         }
         return;
      }

      // Facade-start to start
      if (currentLevel.value === "facade-start" && targetLevel === "start") {
         const reverse = getReverseVideo("start-to-facade-start");
         if (reverse.video) {
            if (disabledArrowRightRef) disabledArrowRightRef.value = false;
            startLevelTransition(reverse.video, targetLevel, !reverse.isDedicated);
            return;
         }
         if (disabledArrowRightRef) disabledArrowRightRef.value = false;
         // No transition video, change level directly (only if not transitioning)
         if (!isTransitioning.value) {
            currentLevel.value = targetLevel;
         }
         return;
      }

      // Facade-start-2 to start
      if (currentLevel.value === "facade-start-2" && targetLevel === "start") {
         const reverse = getReverseVideo("start-to-facade-start-2");
         if (reverse.video) {
            if (disabledArrowLeftRef) disabledArrowLeftRef.value = false;
            startLevelTransition(reverse.video, targetLevel, !reverse.isDedicated);
            return;
         }
         if (disabledArrowLeftRef) disabledArrowLeftRef.value = false;
         // No transition video, change level directly (only if not transitioning)
         if (!isTransitioning.value) {
            currentLevel.value = targetLevel;
         }
         return;
      }

      // Default: change level directly (only if not transitioning)
      if (!isTransitioning.value) {
         currentLevel.value = targetLevel;
      }
   };

   // Cleanup
   const cleanup = () => {
      if (reverseRafId) {
         cancelAnimationFrame(reverseRafId);
         reverseRafId = null;
      }
   };

   return {
      isTransitioning,
      transitionVideoSrc,
      transitionVideo,
      preloadImage,
      preloadImageLoaded,
      isReverseTransition,
      reverseSourceLevel,
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

