<template>
   <div class="home">
      <div
         class="home-image-wrapper"
         :class="{
            'home-swipe-enabled':
               currentLevel === 'start' ||
               currentLevel === 'facade-start' ||
               currentLevel === 'facade-start-2',
         }"
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd"
         @mousedown="handleMouseDown"
         @mousemove="handleMouseMove"
         @mouseup="handleMouseUp"
         @mouseleave="handleMouseUp"
      >
         <!-- Preload image for seamless transition -->
         <img
            v-if="preloadImage"
            :src="preloadImage"
            class="home-image-preload"
            alt=""
            @load="onPreloadImageLoaded"
         />
         <!-- Static image (Map, Start, etc.) -->
         <img
            v-if="currentStaticImage"
            :key="`${currentLevel}-${currentStaticImage}`"
            :src="currentStaticImage"
            class="home-image"
            alt=""
         />
         <!-- Transition video -->
         <video
            v-if="isTransitioning && transitionVideoSrc"
            ref="transitionVideo"
            :src="transitionVideoSrc"
            class="home-video home-video-transition"
            muted
            playsinline
            @ended="handleTransitionEnd"
            @loadedmetadata="handleVideoLoaded"
         ></video>
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
               v-if="currentLevel === 'start' && getFloorMaskConfig(floorId)"
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
               <div
                  v-if="currentLevel === 'map'"
                  class="home-content-top-about"
                  @click="toggleDisclaimerMode"
               >
                  <Icon name="attention" :size="24" color="currentColor" />
                  <p>About</p>
               </div>
            </div>
            <!-- Swipe hint modal for start level -->
            <transition name="modal-fade">
               <div
                  v-if="currentLevel === 'start' && showSwipeHint"
                  class="home-swipe-hint"
                  @click="hideSwipeHint"
               >
                  <div class="home-swipe-hint-content">
                     <div class="home-swipe-hint-icons">
                        <div class="home-swipe-hint-icon">
                           <Icon name="arrow" :size="54" color="currentColor" />
                        </div>
                        <div class="home-swipe-hint-icon">
                           <Icon
                              name="arrow"
                              :size="54"
                              color="currentColor"
                              style="transform: rotate(180deg)"
                           />
                        </div>
                     </div>
                     <div class="home-swipe-hint-text">
                        <p>Swipe left or right to explore</p>
                     </div>
                  </div>
               </div>
            </transition>
            <div class="home-content-bottom home-content">
               <BottomActions :show-labels="true" :disabled="isTransitioning" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
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
import { useSwipe } from "../composables/useSwipe.js";
import { useNavigation } from "../composables/useNavigation.js";
import { useTransitions } from "../composables/useTransitions.js";

// Level system for navigation hierarchy
// Levels: 'map' -> '2-projects' -> 'start' -> 'video-sides' (1, 2, 3, 4)

// Use level storage composable
const { currentLevel, levelHistory } = useLevelStorage();

// Use masks composable
const {
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
   handleVideoLoaded,
   handleTransitionEnd,
   startLevelTransition,
   goBackToLevel: goBackToLevelTransition,
   onPreloadImageLoaded,
} = transitions;

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
   goBackToLevel
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

// Use swipe composable (after navigation is defined)
const swipeHandlers = useSwipe(currentLevel, isTransitioning, {
   onSwipe: handleSwipe,
});

const {
   showSwipeHint,
   handleTouchStart,
   handleTouchMove,
   handleTouchEnd,
   handleMouseDown,
   handleMouseMove,
   handleMouseUp,
   hideSwipeHint,
} = swipeHandlers;

onMounted(() => {
   // Уровень уже восстановлен из localStorage при инициализации ref
});

onUnmounted(() => {
   transitions.cleanup();
});
</script>

<style scoped>
.home {
   width: 100%;
   height: 100vh;
   overflow: hidden;
   position: relative;
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

.home-video,
.home-image {
   width: 100%;
   height: 100%;
   object-fit: cover;
   object-position: center;
   position: absolute;
   top: 0;
   left: 0;
}

.home-image {
   z-index: 1;
   /* Убираем transition для мгновенного переключения при смене уровня */
   user-select: none;
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   pointer-events: none; /* Позволяем событиям проходить через картинку к wrapper */
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
}

.home-content-wrapper {
   position: absolute;
   top: 92px;
   left: 0;
   width: 100%;
   height: calc(100% - 92px);
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

.home-content-top {
   display: flex;
   justify-content: space-between;
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

/* Swipe hint modal */
.home-swipe-hint {
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background-color: rgba(14, 14, 14, 0.5);
   backdrop-filter: blur(5px);
   color: #fff;
   padding: 1rem;
   border-radius: 1rem;
   font-size: 1.2rem;
   z-index: 20;
   text-align: center;
   cursor: pointer;
}

.home-swipe-hint-content {
   max-width: 200px;
   width: 100%;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 1rem;
}

.home-swipe-hint-icons {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 1rem;
   color: #fff;
}

.home-swipe-hint-icon {
   display: flex;
   align-items: center;
   justify-content: center;
}

.home-swipe-hint-text {
   color: #fff;
}

/* Enable swipe on start level */
.home-swipe-enabled {
   touch-action: pan-y; /* Разрешаем вертикальный скролл, но обрабатываем горизонтальные свайпы */
   user-select: none;
}

/* Modal fade animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
   transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from {
   opacity: 0;
   transform: translate(-50%, -50%) scale(0.9);
}

.modal-fade-leave-to {
   opacity: 0;
   transform: translate(-50%, -50%) scale(0.9);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
   opacity: 1;
   transform: translate(-50%, -50%) scale(1);
}
</style>
