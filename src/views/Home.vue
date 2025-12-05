<template>
   <div class="home">
      <div
         ref="imageWrapperRef"
         class="home-image-wrapper"
         @touchstart="handleImageTouchStart"
         @touchmove="handleImageTouchMove"
         @touchend="handleImageTouchEnd"
         @touchcancel="handleImageTouchEnd"
         @mousedown="handleImageMouseDown"
         @mousemove="handleImageMouseMove"
         @mouseup="handleImageMouseUp"
         @mouseleave="handleImageMouseUp"
         @wheel.prevent="handleImageWheel"
      >
         <!-- Preload image for seamless transition -->
         <img
            v-if="preloadImage"
            :src="preloadImage"
            class="home-image-preload"
            alt=""
            @load="onPreloadImageLoaded"
         />
         <!-- Drag container (similar to map-content in Map.vue) -->
         <div
            ref="homeImageContentRef"
            class="home-image-content"
            :style="homeImageStyle"
         >
            <!-- Static image (Map, Start, etc.) -->
            <img
               ref="homeImageRef"
               v-if="currentStaticImage"
               :key="`${currentLevel}-${currentStaticImage}`"
               :src="currentStaticImage"
               class="home-image"
               :style="homeImageSizeStyle"
               alt=""
               @load="onImageLoad"
            />
            <!-- Masks inside drag container - they move with the image -->
            <!-- Edit Mode: Show all masks for all levels simultaneously -->
            <template v-if="editMode">
               <!-- Map level masks -->
               <template v-if="currentLevel === 'map'">
                  <!-- Red territory mask -->
                  <HouseOutline
                     :points="mapMaskConfig.territory.points"
                     :path="mapMaskConfig.territory.path"
                     :stroke-width="mapMaskConfig.territory.strokeWidth"
                     :glow-color="mapMaskConfig.territory.glowColor"
                     :glow-blur="mapMaskConfig.territory.glowBlur"
                     :animated="mapMaskConfig.territory.animated"
                     :always-visible="mapMaskConfig.territory.alwaysVisible"
                     :on-click="() => {}"
                     class="home-disclaimer-mask"
                  />
                  <!-- House 1 -->
                  <HouseOutline
                     :points="mapMaskConfig.house1.points"
                     :path="mapMaskConfig.house1.path"
                     :stroke-width="mapMaskConfig.house1.strokeWidth"
                     :glow-color="mapMaskConfig.house1.glowColor"
                     :glow-blur="mapMaskConfig.house1.glowBlur"
                     :animated="mapMaskConfig.house1.animated"
                     :always-visible="mapMaskConfig.house1.alwaysVisible"
                     :on-click="handleHouse1Click"
                  />
                  <!-- House 2 -->
                  <HouseOutline
                     :points="mapMaskConfig.house2.points"
                     :path="mapMaskConfig.house2.path"
                     :stroke-width="mapMaskConfig.house2.strokeWidth"
                     :glow-color="mapMaskConfig.house2.glowColor"
                     :glow-blur="mapMaskConfig.house2.glowBlur"
                     :animated="mapMaskConfig.house2.animated"
                     :always-visible="mapMaskConfig.house2.alwaysVisible"
                     :on-click="handleHouse2Click"
                  />
               </template>
               <!-- 2-projects level masks -->
               <template v-if="currentLevel === '2-projects'">
                  <HouseOutline
                     :points="twoProjectsMaskConfig.project1.points"
                     :path="twoProjectsMaskConfig.project1.path"
                     :stroke-width="twoProjectsMaskConfig.project1.strokeWidth"
                     :glow-color="twoProjectsMaskConfig.project1.glowColor"
                     :glow-blur="twoProjectsMaskConfig.project1.glowBlur"
                     :animated="twoProjectsMaskConfig.project1.animated"
                     :always-visible="
                        twoProjectsMaskConfig.project1.alwaysVisible
                     "
                     :on-click="handleProject1Click"
                  />
                  <HouseOutline
                     :points="twoProjectsMaskConfig.project2.points"
                     :path="twoProjectsMaskConfig.project2.path"
                     :stroke-width="twoProjectsMaskConfig.project2.strokeWidth"
                     :glow-color="twoProjectsMaskConfig.project2.glowColor"
                     :glow-blur="twoProjectsMaskConfig.project2.glowBlur"
                     :animated="twoProjectsMaskConfig.project2.animated"
                     :always-visible="
                        twoProjectsMaskConfig.project2.alwaysVisible
                     "
                     :on-click="handleProject2Click"
                  />
               </template>
               <!-- Start level masks (all floors) -->
               <template v-if="currentLevel === 'start'">
                  <template
                     v-for="floorId in ['g', '1', '2', '3', '4', '5']"
                     :key="floorId"
                  >
                     <HouseOutline
                        v-if="getFloorMaskConfig(floorId)"
                        :points="getFloorMaskConfig(floorId).points"
                        :path="getFloorMaskConfig(floorId).path"
                        :stroke-width="getFloorMaskConfig(floorId).strokeWidth"
                        :glow-color="getFloorMaskConfig(floorId).glowColor"
                        :glow-blur="getFloorMaskConfig(floorId).glowBlur"
                        :animated="getFloorMaskConfig(floorId).animated"
                        :always-visible="
                           getFloorMaskConfig(floorId).alwaysVisible
                        "
                        :on-click="() => handleFloorClick(floorId)"
                     />
                  </template>
               </template>
            </template>
            <!-- Normal Mode: Show masks only for current level -->
            <template v-else>
               <!-- Red territory mask for disclaimer mode (non-clickable) -->
               <HouseOutline
                  v-if="currentLevel === 'map' && showDisclaimerMode"
                  :points="mapMaskConfig.territory.points"
                  :path="mapMaskConfig.territory.path"
                  :stroke-width="mapMaskConfig.territory.strokeWidth"
                  :glow-color="mapMaskConfig.territory.glowColor"
                  :glow-blur="mapMaskConfig.territory.glowBlur"
                  :animated="mapMaskConfig.territory.animated"
                  :always-visible="mapMaskConfig.territory.alwaysVisible"
                  :on-click="() => {}"
                  class="home-disclaimer-mask"
               />
               <!-- House outline overlays for Map level -->
               <HouseOutline
                  v-if="currentLevel === 'map' && showHouseOutline1"
                  :points="mapMaskConfig.house1.points"
                  :path="mapMaskConfig.house1.path"
                  :stroke-width="mapMaskConfig.house1.strokeWidth"
                  :glow-color="mapMaskConfig.house1.glowColor"
                  :glow-blur="mapMaskConfig.house1.glowBlur"
                  :animated="mapMaskConfig.house1.animated"
                  :always-visible="mapMaskConfig.house1.alwaysVisible"
                  :on-click="handleHouse1Click"
               />
               <HouseOutline
                  v-if="currentLevel === 'map' && showHouseOutline2"
                  :points="mapMaskConfig.house2.points"
                  :path="mapMaskConfig.house2.path"
                  :stroke-width="mapMaskConfig.house2.strokeWidth"
                  :glow-color="mapMaskConfig.house2.glowColor"
                  :glow-blur="mapMaskConfig.house2.glowBlur"
                  :animated="mapMaskConfig.house2.animated"
                  :always-visible="mapMaskConfig.house2.alwaysVisible"
                  :on-click="handleHouse2Click"
               />
               <!-- House outline overlays for 2-projects level -->
               <HouseOutline
                  v-if="currentLevel === '2-projects' && showHouseOutline1"
                  :points="twoProjectsMaskConfig.project1.points"
                  :path="twoProjectsMaskConfig.project1.path"
                  :stroke-width="twoProjectsMaskConfig.project1.strokeWidth"
                  :glow-color="twoProjectsMaskConfig.project1.glowColor"
                  :glow-blur="twoProjectsMaskConfig.project1.glowBlur"
                  :animated="twoProjectsMaskConfig.project1.animated"
                  :always-visible="twoProjectsMaskConfig.project1.alwaysVisible"
                  :on-click="handleProject1Click"
               />
               <HouseOutline
                  v-if="currentLevel === '2-projects' && showHouseOutline2"
                  :points="twoProjectsMaskConfig.project2.points"
                  :path="twoProjectsMaskConfig.project2.path"
                  :stroke-width="twoProjectsMaskConfig.project2.strokeWidth"
                  :glow-color="twoProjectsMaskConfig.project2.glowColor"
                  :glow-blur="twoProjectsMaskConfig.project2.glowBlur"
                  :animated="twoProjectsMaskConfig.project2.animated"
                  :always-visible="twoProjectsMaskConfig.project2.alwaysVisible"
                  :on-click="handleProject2Click"
               />
               <!-- House outline overlays for Start level (6 floors) -->
               <template
                  v-for="floorId in ['g', '1', '2', '3', '4', '5']"
                  :key="floorId"
               >
                  <HouseOutline
                     v-if="
                        currentLevel === 'start' && getFloorMaskConfig(floorId)
                     "
                     :points="getFloorMaskConfig(floorId).points"
                     :path="getFloorMaskConfig(floorId).path"
                     :stroke-width="getFloorMaskConfig(floorId).strokeWidth"
                     :glow-color="getFloorMaskConfig(floorId).glowColor"
                     :glow-blur="getFloorMaskConfig(floorId).glowBlur"
                     :animated="getFloorMaskConfig(floorId).animated"
                     :always-visible="getFloorMaskConfig(floorId).alwaysVisible"
                     :on-click="() => handleFloorClick(floorId)"
                  />
               </template>
            </template>
         </div>
         <!-- Transition video -->
         <video
            v-if="isTransitioning && transitionVideoSrc"
            ref="transitionVideo"
            :src="transitionVideoSrc"
            class="home-video home-video-transition"
            muted
            playsinline
            preload="auto"
            webkit-playsinline
            x5-playsinline
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portraint"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            @ended="handleTransitionEnd"
            @loadedmetadata="handleVideoLoaded"
            @canplay="handleVideoCanPlay"
            @canplaythrough="handleVideoCanPlayThrough"
            @waiting="handleVideoWaiting"
            @playing="handleVideoPlaying"
         ></video>
         <!-- House outline overlay for other levels (if needed in future) -->
         <div class="home-content-wrapper">
            <div class="home-content-top home-content">
               <div v-if="currentLevel === 'map'" class="home-content-top-back">
                  <router-link
                     to="/map"
                     style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        text-decoration: none;
                        color: inherit;
                     "
                  >
                     <Icon name="arrow" :size="24" color="currentColor" />
                     <div class="home-content-top-back-text">
                        <p>Map</p>
                     </div>
                  </router-link>
               </div>
               <div
                  v-else
                  class="home-content-top-back"
                  @click="handleBackClick"
                  :class="{ 'home-content-top-back-disabled': isTransitioning }"
               >
                  <Icon name="arrow" :size="24" color="currentColor" />
                  <div class="home-content-top-back-text">
                     <p>Back</p>
                  </div>
               </div>
               <!-- <div class="home-content-top-title">
                  <p>ROVE Home Marasi Drive</p>
               </div> -->
               <div class="home-content-top-actions">
                  <div
                     v-if="currentLevel === 'map'"
                     class="home-content-top-about"
                     @click="toggleDisclaimerMode"
                  >
                     <Icon name="attention" :size="24" color="currentColor" />
                     <p>About</p>
                  </div>
                  <!-- Edit mode indicator -->
                  <div v-if="editMode" class="home-content-top-edit-mode">
                     <Icon name="help" :size="24" color="currentColor" />
                     <p>Edit Mode</p>
                  </div>
               </div>
            </div>
            <!-- Navigation arrows for levels with left/right navigation -->
            <div v-if="hasNavigationArrows" class="home-navigation-arrows">
               <button
                  class="home-nav-arrow home-nav-arrow-left"
                  :class="{
                     'home-nav-arrow-disabled':
                        disabledArrowLeft || isTransitioning,
                  }"
                  :disabled="disabledArrowLeft || isTransitioning"
                  @click="handleArrowNavigation('left')"
               >
                  <Icon name="arrow" :size="32" color="currentColor" />
               </button>
               <button
                  class="home-nav-arrow home-nav-arrow-right"
                  :class="{
                     'home-nav-arrow-disabled':
                        disabledArrowRight || isTransitioning,
                  }"
                  :disabled="disabledArrowRight || isTransitioning"
                  @click="handleArrowNavigation('right')"
               >
                  <Icon
                     name="arrow"
                     :size="32"
                     color="currentColor"
                     style="transform: rotate(180deg)"
                  />
               </button>
            </div>
            <div class="home-content-bottom home-content">
               <BottomActions :show-labels="true" :disabled="isTransitioning" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import {
   ref,
   computed,
   onMounted,
   onUnmounted,
   watch,
   nextTick,
   inject,
} from "vue";
import Icon from "../components/Icon.vue";
import BottomActions from "../components/BottomActions.vue";
import HouseOutline from "../components/HouseOutline.vue";

// Import configuration
import {
   floorsConfig,
   levelImages,
   levelTransitions,
} from "../config/navigation.js";

// Import composables
import { useMasks } from "../composables/useMasks.js";
import { useLevelStorage } from "../composables/useLevelStorage.js";
import { useNavigation } from "../composables/useNavigation.js";
import { useTransitions } from "../composables/useTransitions.js";
import { useImageDrag } from "../composables/useImageDrag.js";

// Level system for navigation hierarchy
// Levels: 'map' -> '2-projects' -> 'start' -> 'video-sides' (1, 2, 3, 4)

// Inject header visibility state
const showHeader = inject("showHeader", ref(false));

// Use level storage composable
const { currentLevel, levelHistory } = useLevelStorage();

// Refs for image drag
const imageWrapperRef = ref(null);
const homeImageRef = ref(null);

// Use image drag composable (scale = 1 for Home, no zoom)
const imageDrag = useImageDrag(imageWrapperRef, homeImageRef, ref(1));

// Create local reference to imageStyle (like Map.vue does with mapStyle)
// Combines drag transform with content size based on image dimensions
const homeImageStyle = computed(() => {
   const dragStyle = imageDrag.imageStyle.value;

   // Add dimensions to the style if available
   if (imageDimensions.value.width > 0 && imageDimensions.value.height > 0) {
      return {
         ...dragStyle,
         width: `${imageDimensions.value.width}px`,
         height: `${imageDimensions.value.height}px`,
      };
   }

   return dragStyle;
});

// Center image position when level changes and update masks
watch(currentLevel, () => {
   // Set flag to center image when it loads (if not already loaded)
   shouldCenterOnLoad.value = true;

   // Wait for next tick to ensure image is loaded
   nextTick(() => {
      if (homeImageRef.value?.complete) {
         // Image already loaded, center immediately
         setTimeout(() => {
            imageDrag.centerPosition();
            shouldCenterOnLoad.value = false; // Reset flag
         }, 50); // Small delay to ensure dimensions are calculated
      } else {
         // Image not loaded yet, will center in onImageLoad
         imageDrag.resetPosition();
      }

      // Update masks after level change (they need to recalculate positions)
      // Use a small delay to ensure image is fully rendered
      setTimeout(() => {
         // Trigger mask update by dispatching a custom event
         window.dispatchEvent(new CustomEvent("mask-update"));
      }, 100);
   });
});

// Image dimensions for proper sizing (to allow drag without black background)
const imageDimensions = ref({ width: 0, height: 0 });

// Track if we should center on image load (only on level change)
const shouldCenterOnLoad = ref(true); // Start with true to center on initial load

// Handle image load to ensure refs are ready and calculate dimensions
const onImageLoad = () => {
   // Image is loaded, ensure cursor is set
   if (imageWrapperRef.value) {
      imageWrapperRef.value.style.cursor = "grab";
   }

   // Update masks after image loads (they need to recalculate positions)
   nextTick(() => {
      setTimeout(() => {
         window.dispatchEvent(new CustomEvent("mask-update"));
      }, 50);
   });

   // Calculate image dimensions to fill container while maintaining aspect ratio
   if (homeImageRef.value && imageWrapperRef.value) {
      const containerWidth = imageWrapperRef.value.offsetWidth;
      const containerHeight = imageWrapperRef.value.offsetHeight;
      const naturalWidth = homeImageRef.value.naturalWidth;
      const naturalHeight = homeImageRef.value.naturalHeight;

      if (naturalWidth && naturalHeight) {
         const aspectRatio = naturalWidth / naturalHeight;
         const containerAspectRatio = containerWidth / containerHeight;

         // Cover: image should fill container, maintaining aspect ratio
         // If image is wider (relative to container), fit by height
         // If image is taller (relative to container), fit by width
         if (aspectRatio > containerAspectRatio) {
            // Image is wider - fit by height, width will overflow
            imageDimensions.value = {
               width: containerHeight * aspectRatio,
               height: containerHeight,
            };
         } else {
            // Image is taller - fit by width, height will overflow
            imageDimensions.value = {
               width: containerWidth,
               height: containerWidth / aspectRatio,
            };
         }

         // Center image after dimensions are calculated
         // This ensures proper centering on initial load and level changes
         // Use a small delay to ensure dimensions are applied to DOM
         nextTick(() => {
            setTimeout(() => {
               imageDrag.centerPosition();
               if (shouldCenterOnLoad.value) {
                  shouldCenterOnLoad.value = false; // Reset flag
               }
            }, 50); // Small delay to ensure dimensions are applied
         });
      }
   }
};

// Computed style for the image (to set its actual size)
const homeImageSizeStyle = computed(() => {
   if (imageDimensions.value.width > 0 && imageDimensions.value.height > 0) {
      return {
         width: `${imageDimensions.value.width}px`,
         height: `${imageDimensions.value.height}px`,
      };
   }
   return {
      width: "100%",
      height: "100%",
      objectFit: "cover",
   };
});

// Recalculate dimensions on window resize (but don't reset position)
const handleResize = (event) => {
   // Only handle real window resize events, not our custom mask update events
   if (event && event.type === "resize" && event.target === window) {
      if (homeImageRef.value?.complete) {
         // Recalculate dimensions without resetting position
         const containerWidth = imageWrapperRef.value?.offsetWidth;
         const containerHeight = imageWrapperRef.value?.offsetHeight;
         const naturalWidth = homeImageRef.value.naturalWidth;
         const naturalHeight = homeImageRef.value.naturalHeight;

         if (
            naturalWidth &&
            naturalHeight &&
            containerWidth &&
            containerHeight
         ) {
            const aspectRatio = naturalWidth / naturalHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            if (aspectRatio > containerAspectRatio) {
               imageDimensions.value = {
                  width: containerHeight * aspectRatio,
                  height: containerHeight,
               };
            } else {
               imageDimensions.value = {
                  width: containerWidth,
                  height: containerWidth / aspectRatio,
               };
            }
         }
      }
   }
};

// Use masks composable
const {
   editMode,
   showDisclaimerMode,
   showHouseOutline1,
   showHouseOutline2,
   houseOutlineWidth,
   houseOutlineGlow,
   houseOutlineGlowBlur,
   houseOutlineAnimatedMap,
   houseOutlineAnimated,
   toggleDisclaimerMode,
   mapMaskConfig,
   twoProjectsMaskConfig,
   getFloorMaskConfig,
} = useMasks();

const disabledArrowLeft = ref(false);
const disabledArrowRight = ref(false);

// Use transitions composable
const transitions = useTransitions(currentLevel, levelHistory);
const {
   isTransitioning,
   transitionVideoSrc,
   transitionVideo,
   preloadImage,
   preloadImageLoaded,
   isReverseTransition,
   reverseSourceLevel,
   handleVideoLoaded,
   handleTransitionEnd: originalHandleTransitionEnd,
   startLevelTransition,
   goBackToLevel: goBackToLevelTransition,
   onPreloadImageLoaded,
} = transitions;

// Wrap handleTransitionEnd to update masks after transition
const handleTransitionEnd = () => {
   originalHandleTransitionEnd();
   // Update masks after transition completes
   nextTick(() => {
      setTimeout(() => {
         window.dispatchEvent(new CustomEvent("mask-update"));
      }, 100);
   });
};

// Video event handlers for optimization
const handleVideoCanPlay = () => {
   // Video can start playing - ensure it's ready
   if (transitionVideo.value && isTransitioning.value) {
      // Video is ready, ensure it's on GPU layer
      requestAnimationFrame(() => {
         if (transitionVideo.value) {
            transitionVideo.value.style.willChange =
               "transform, opacity, contents";
         }
      });
   }
};

const handleVideoCanPlayThrough = () => {
   // Video can play through without buffering - fully loaded
   if (transitionVideo.value && isTransitioning.value) {
      // Ensure smooth playback
      requestAnimationFrame(() => {
         if (transitionVideo.value) {
            transitionVideo.value.style.willChange =
               "transform, opacity, contents";
         }
      });
   }
};

const handleVideoWaiting = () => {
   // Video is buffering - try to preload more
   if (transitionVideo.value && isTransitioning.value) {
      // Increase buffer if possible
      try {
         if (transitionVideo.value.buffered.length > 0) {
            const bufferedEnd = transitionVideo.value.buffered.end(0);
            const currentTime = transitionVideo.value.currentTime;
            // If buffer is close to current time, try to load more
            if (bufferedEnd - currentTime < 1) {
               transitionVideo.value.load();
            }
         }
      } catch (e) {
         // Ignore errors
      }
   }
};

const handleVideoPlaying = () => {
   // Video started playing - ensure optimal performance
   if (transitionVideo.value && isTransitioning.value) {
      // Promote to GPU layer for smooth playback
      requestAnimationFrame(() => {
         if (transitionVideo.value) {
            // Force GPU acceleration
            transitionVideo.value.style.transform = "translate3d(0, 0, 0)";
            transitionVideo.value.style.willChange =
               "transform, opacity, contents";
         }
      });
   }
};

// Wrapper for goBackToLevel with disabled arrows
const goBackToLevel = (targetLevel) => {
   goBackToLevelTransition(targetLevel, disabledArrowLeft, disabledArrowRight);
};

// Use navigation composable (must be after goBackToLevel and startLevelTransition are defined)
const navigation = useNavigation(
   currentLevel,
   levelHistory,
   isTransitioning,
   disabledArrowLeft,
   disabledArrowRight,
   startLevelTransition,
   goBackToLevel,
   isReverseTransition,
   reverseSourceLevel
);

const {
   currentStaticImage,
   handleHouse1Click,
   handleHouse2Click,
   handleProject1Click,
   handleProject2Click,
   handleFacadeStartClick,
   handleFacadeStart2Click,
   handleBackToStartFromFacade,
   handleBackToStartFromFacade2,
   handleFloorClick,
   handleBackClick,
   handleSwipe,
} = navigation;

// Watch for image changes to update masks (must be after currentStaticImage is defined)
// Use debounce to prevent excessive updates
let maskUpdateTimeout = null;
watch(currentStaticImage, () => {
   // Clear previous timeout
   if (maskUpdateTimeout) {
      clearTimeout(maskUpdateTimeout);
   }

   // When image changes, update masks after it loads
   nextTick(() => {
      if (homeImageRef.value) {
         if (homeImageRef.value.complete) {
            // Image already loaded, update masks with debounce
            maskUpdateTimeout = setTimeout(() => {
               window.dispatchEvent(new CustomEvent("mask-update"));
               maskUpdateTimeout = null;
            }, 100);
         } else {
            // Wait for image to load
            homeImageRef.value.addEventListener(
               "load",
               () => {
                  if (maskUpdateTimeout) {
                     clearTimeout(maskUpdateTimeout);
                  }
                  maskUpdateTimeout = setTimeout(() => {
                     window.dispatchEvent(new CustomEvent("mask-update"));
                     maskUpdateTimeout = null;
                  }, 100);
               },
               { once: true }
            );
         }
      }
   });
});

// Levels that have left/right navigation arrows
const arrowLevels = ["start", "facade-start", "facade-start-2"];

// Check if current level has navigation arrows
const hasNavigationArrows = computed(() =>
   arrowLevels.includes(currentLevel.value)
);

// Handle arrow navigation (replaces swipe)
const handleArrowNavigation = (direction) => {
   if (isTransitioning.value) return;
   // direction: 'left' means swipe right (go back), 'right' means swipe left (go forward)
   handleSwipe(direction === "left");
};

// Check if target is a mask hit area (works with both mouse and touch events)
const isMaskElement = (target) => {
   if (!target) return false;

   // Check if target or any parent is a mask element
   const hitArea = target.closest(".house-outline-hit-area");
   const wrapper = target.closest(".house-outline-wrapper");

   if (hitArea || wrapper) {
      return true;
   }

   // Also check by elementFromPoint for touch events
   return false;
};

// Check if touch point is over a mask
const isTouchOverMask = (clientX, clientY) => {
   try {
      const element = document.elementFromPoint(clientX, clientY);
      return isMaskElement(element);
   } catch (error) {
      return false;
   }
};

// Image drag handlers - skip if touching a mask
const handleImageTouchStart = (event) => {
   try {
      if (!event || !event.touches || event.touches.length === 0) return;

      // Check if touch target is a mask element (simpler check - only check event.target)
      // This is more reliable than elementFromPoint which can return parent elements
      if (isMaskElement(event.target)) {
         // Don't start drag if touching a mask - let mask handle the touch
         return;
      }

      // Not on mask - allow drag to start (but it won't actually start until movement detected)
      imageDrag.handleTouchStart(event);
   } catch (error) {
      console.error("Error in handleImageTouchStart:", error);
   }
};

const handleImageTouchMove = (event) => {
   try {
      if (!event || !event.touches || event.touches.length === 0) return;

      // Always pass touch move to drag handler
      // The drag handler will check movement threshold to determine if drag should start
      // We already checked for mask in handleImageTouchStart, so if we get here,
      // the user is not on a mask (or drag has already started)
      imageDrag.handleTouchMove(event);
   } catch (error) {
      console.error("Error in handleImageTouchMove:", error);
   }
};

const handleImageTouchEnd = (event) => {
   try {
      if (!event) return;
      imageDrag.handleTouchEnd(event);
   } catch (error) {
      console.error("Error in handleImageTouchEnd:", error);
   }
};

const handleImageMouseDown = (event) => {
   try {
      if (!event || !event.target) return;
      // Don't start drag if clicking on a mask
      if (isMaskElement(event.target)) {
         return;
      }
      imageDrag.handleMouseDown(event);
   } catch (error) {
      console.error("Error in handleImageMouseDown:", error);
   }
};

const handleImageMouseMove = (event) => {
   try {
      if (!event) return;
      imageDrag.handleMouseMove(event);
   } catch (error) {
      console.error("Error in handleImageMouseMove:", error);
   }
};

const handleImageMouseUp = (event) => {
   try {
      imageDrag.handleMouseUp();
   } catch (error) {
      console.error("Error in handleImageMouseUp:", error);
   }
};

// Handle wheel for drag (prevent default scroll behavior)
const handleImageWheel = (event) => {
   event.preventDefault();
};

onMounted(() => {
   // Set cursor for drag (like Map.vue)
   if (imageWrapperRef.value) {
      imageWrapperRef.value.style.cursor = "grab";
   }

   // Center image on initial load if it's already loaded
   nextTick(() => {
      if (homeImageRef.value?.complete && imageWrapperRef.value) {
         // Image already loaded, wait for dimensions to be calculated
         setTimeout(() => {
            // Recalculate dimensions if needed
            if (
               imageDimensions.value.width === 0 ||
               imageDimensions.value.height === 0
            ) {
               const containerWidth = imageWrapperRef.value.offsetWidth;
               const containerHeight = imageWrapperRef.value.offsetHeight;
               const naturalWidth = homeImageRef.value.naturalWidth;
               const naturalHeight = homeImageRef.value.naturalHeight;

               if (
                  naturalWidth &&
                  naturalHeight &&
                  containerWidth &&
                  containerHeight
               ) {
                  const aspectRatio = naturalWidth / naturalHeight;
                  const containerAspectRatio = containerWidth / containerHeight;

                  if (aspectRatio > containerAspectRatio) {
                     imageDimensions.value = {
                        width: containerHeight * aspectRatio,
                        height: containerHeight,
                     };
                  } else {
                     imageDimensions.value = {
                        width: containerWidth,
                        height: containerWidth / aspectRatio,
                     };
                  }
               }
            }
            // Center after dimensions are set
            setTimeout(() => {
               imageDrag.centerPosition();
            }, 50);
         }, 100); // Small delay to ensure dimensions are calculated
      }
   });

   // Add resize listener for image dimensions
   window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
   transitions.cleanup();
   window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.home {
   width: 100%;
   /* Use dynamic viewport height - adjusts for browser UI */
   height: 100dvh;
   overflow: hidden;
   position: relative;

   /* Fallback for browsers that don't support dvh */
   height: 100vh;
}

/* Modern browsers with dvh support */
@supports (height: 100dvh) {
   .home {
      height: 100dvh;
   }
}

.home-image-wrapper {
   width: 100%;
   height: 100%;
   position: relative;
   overflow: hidden;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
}

/* Wrapper для drag (аналогично Map.vue) */
.home-image-wrapper {
   touch-action: none;
   cursor: grab;
}

.home-image-wrapper:active {
   cursor: grabbing;
}

.home-image-content {
   position: absolute;
   top: 0;
   left: 0;
   will-change: transform;
   cursor: grab;
   touch-action: none;
   -webkit-touch-callout: none;
   -webkit-user-select: none;
   user-select: none;
}

.home-image-content:active {
   cursor: grabbing;
}

/* На мобильных устройствах убираем курсор */
@media (hover: none) and (pointer: coarse) {
   .home-image-content {
      cursor: default;
   }

   .home-image-content:active {
      cursor: default;
   }
}

.home-video {
   width: 100%;
   height: 100%;
   object-fit: cover;
   object-position: center;
   position: absolute;
   top: 0;
   left: 0;
   /* Maximum hardware acceleration for smoother video playback on mobile */
   transform: translate3d(0, 0, 0);
   -webkit-transform: translate3d(0, 0, 0);
   will-change: transform, opacity;
   backface-visibility: hidden;
   -webkit-backface-visibility: hidden;
   perspective: 1000px;
   -webkit-perspective: 1000px;
   /* Optimize rendering */
   image-rendering: -webkit-optimize-contrast;
   image-rendering: crisp-edges;
   /* Prevent flickering */
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   /* GPU layer promotion */
   isolation: isolate;
   /* Smooth video playback */
   -webkit-tap-highlight-color: transparent;
}

.home-image {
   /* Изображение НЕ использует object-fit: cover, чтобы можно было прокручивать обрезанные части */
   display: block;
   /* Размер определяется в JS на основе соотношения сторон */
   z-index: 1;
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   pointer-events: none;
   /* Hardware acceleration for smoother rendering */
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
   backface-visibility: hidden;
   -webkit-backface-visibility: hidden;
}

.home-image-preload {
   position: absolute;
   top: -9999px;
   left: -9999px;
   width: 1px;
   height: 1px;
   opacity: 0;
   pointer-events: none;
   z-index: -1;
}

.home-video-transition {
   opacity: 1;
   z-index: 10;
   /* Maximum optimization for transition videos */
   will-change: transform, opacity, contents;
   /* Ensure video is on its own layer for smooth playback */
   transform: translate3d(0, 0, 0);
   -webkit-transform: translate3d(0, 0, 0);
   /* Prevent repaints during playback */
   contain: layout style paint;
   /* Optimize for mobile */
   -webkit-tap-highlight-color: transparent;
}

.home-content-wrapper {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   z-index: 10;
   pointer-events: none;
}

.home-content-wrapper > * {
   pointer-events: all;
}

.home-content {
   display: flex;
   justify-content: space-between;
   padding: 3rem 4rem;
}

@media (max-width: 768px) {
   .home-content {
      padding: 1.5rem 1rem;
   }
}

.home-content-top {
   display: flex;
   justify-content: space-between;
   align-items: center;
   transition: transform 0.3s ease;
}

.home-content-top-actions {
   display: flex;
   align-items: center;
   gap: 0.5rem;
}

.home-content-top-back {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #fff;
   color: #0e0e0e;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   cursor: pointer;
   transition: all 0.3s ease;
   text-decoration: none;
   &:hover:not(.home-content-top-back-disabled) {
      opacity: 0.8;
   }
}

.home-content-top-back-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.home-content-top-title {
   font-weight: 500;
   font-size: 1.7rem;
}

.home-content-top-about {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #fff;
   color: #0e0e0e;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   cursor: pointer;
   transition: all 0.3s ease;
   &:hover {
      opacity: 0.8;
   }
}

.home-content-top-edit-mode {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   background-color: #ff6b6b;
   color: #fff;
   padding: 0.5rem 1rem;
   border-radius: 1rem;
   font-weight: 600;
}

.home-content-slider {
   margin: 0 auto;
   max-width: 50%;
   width: 100%;
}

.home-content-slider-arrow {
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   width: 44px;
   height: 44px;
   border-radius: 50%;
   padding: 0.5rem;
   cursor: pointer;
   transition: all 0.3s ease;
   &:hover:not(.home-content-slider-arrow-disabled) {
      background-color: rgba(14, 14, 14, 0.8);
   }
}

.home-content-slider-arrow-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.home-content-bottom {
   justify-content: flex-end;
}

.home-content-arrows {
   position: absolute;
   top: 50%;
   left: 0;
   right: 0;
   transform: translateY(-50%);
   display: flex;
   justify-content: space-between;
   padding: 0 4rem;
   z-index: 10;
   pointer-events: none;
}

.home-content-arrows > * {
   pointer-events: all;
}

.home-content-arrow {
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   width: 60px;
   height: 60px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   transition: all 0.3s ease;
   color: #fff;
}

.home-content-arrow:hover:not(.home-content-arrow-disabled) {
   background-color: rgba(14, 14, 14, 0.8);
   transform: scale(1.1);
}

.home-content-arrow-disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none;
}

.home-content-arrow-right {
   transform: rotate(180deg);
}

.home-content-arrow-right:hover:not(.home-content-arrow-disabled) {
   transform: rotate(180deg) scale(1.1);
}

/* Red disclaimer masks (non-clickable) */
.home-disclaimer-mask :deep(.house-outline-wrapper) {
   z-index: 5; /* Под обычными масками (z-index: 6) */
}

.home-disclaimer-mask :deep(.house-outline-canvas) {
   mix-blend-mode: normal; /* Убираем screen blend mode для красного цвета */
}

.home-disclaimer-mask :deep(.house-outline-hit-area) {
   pointer-events: none;
   cursor: default;
}

/* Navigation arrows */
.home-navigation-arrows {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 1rem;
   pointer-events: none;
   z-index: 15;
}

.home-nav-arrow {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 56px;
   height: 56px;
   background-color: rgba(14, 14, 14, 0.6);
   backdrop-filter: blur(8px);
   border: 1px solid rgba(255, 255, 255, 0.2);
   border-radius: 50%;
   color: #fff;
   cursor: pointer;
   pointer-events: all;
   transition: all 0.2s ease;
}

.home-nav-arrow:hover {
   background-color: rgba(14, 14, 14, 0.8);
   border-color: rgba(255, 255, 255, 0.4);
   transform: scale(1.05);
}

.home-nav-arrow:active {
   transform: scale(0.95);
}

.home-nav-arrow-disabled {
   opacity: 0.3;
   cursor: not-allowed;
   pointer-events: none;
}

@media (max-width: 768px) {
   .home-navigation-arrows {
      padding: 0 0.5rem;
   }

   .home-nav-arrow {
      width: 44px;
      height: 44px;
   }
}
</style>
