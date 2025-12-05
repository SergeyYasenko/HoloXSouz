import { computed } from "vue";
import { levelImages, levelTransitions, floorsConfig } from "../config/navigation.js";

/**
 * Composable for navigation logic and handlers
 */
export function useNavigation(
   currentLevel,
   levelHistory,
   isTransitioning,
   disabledArrowLeft,
   disabledArrowRight,
   startLevelTransition,
   goBackToLevel,
   isReverseTransition = null,
   reverseSourceLevel = null
) {
   // Get level image
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

   // During reverse transition, show the source level's image (old image)
   // to keep it visible for 1 second while reverse video plays
   // During normal transition, also keep current image until transition completes
   const currentStaticImage = computed(() => {
      // If transitioning in reverse, show old image
      if (isReverseTransition?.value && reverseSourceLevel?.value) {
         return getLevelImage(reverseSourceLevel.value);
      }

      // If transitioning normally, keep current image (don't change until transition completes)
      // This prevents image from changing before video finishes
      if (isTransitioning?.value) {
         // Keep showing current level's image during transition
         return getLevelImage(currentLevel.value);
      }

      // Normal case: show current level's image
      return getLevelImage(currentLevel.value);
   });

   // Navigation handlers
   const handleHouse1Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["map-to-2-projects"], "2-projects");
   };

   const handleHouse2Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["map-to-2-projects"], "2-projects");
   };

   const handleProject1Click = () => {
      window.location.reload();
   };

   const handleProject2Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["2-projects-to-start"], "start");
   };

   const handleFacadeStartClick = () => {
      if (isTransitioning.value) return;
      if (!disabledArrowRight.value) {
         disabledArrowRight.value = true;
      } else {
         disabledArrowRight.value = false;
      }
      startLevelTransition(
         levelTransitions["start-to-facade-start"],
         "facade-start"
      );
   };

   const handleFacadeStart2Click = () => {
      if (isTransitioning.value) return;
      if (!disabledArrowLeft.value) {
         disabledArrowLeft.value = true;
      } else {
         disabledArrowLeft.value = false;
      }
      startLevelTransition(
         levelTransitions["start-to-facade-start-2"],
         "facade-start-2"
      );
   };

   const handleBackToStartFromFacade = () => {
      if (isTransitioning.value) return;
      goBackToLevel("start");
   };

   const handleBackToStartFromFacade2 = () => {
      if (isTransitioning.value) return;
      goBackToLevel("start");
   };

   const handleFloorClick = (floorId) => {
      if (isTransitioning.value) return;
      const floor = floorsConfig[floorId];
      if (!floor) return;

      levelHistory.value.push(currentLevel.value);
      if (floor.transitionVideo) {
         startLevelTransition(floor.transitionVideo, `floor-${floorId}`);
      } else if (floor.image) {
         currentLevel.value = `floor-${floorId}`;
      }
   };

   const handleBackClick = () => {
      if (isTransitioning.value) return;

      if (
         currentLevel.value === "facade-start" ||
         currentLevel.value === "facade-start-2"
      ) {
         goBackToLevel("start");
         return;
      }

      if (currentLevel.value === "start") {
         const previousLevel = levelHistory.value.pop();
         if (!previousLevel) {
            goBackToLevel("2-projects");
            return;
         }
         goBackToLevel(previousLevel);
         return;
      }

      const previousLevel = levelHistory.value.pop();
      if (!previousLevel) {
         if (currentLevel.value.startsWith("floor-")) {
            goBackToLevel("start");
         } else if (currentLevel.value === "2-projects") {
            goBackToLevel("map");
         }
         return;
      }

      goBackToLevel(previousLevel);
   };

   // Swipe handler
   const handleSwipe = (swipeRight) => {
      const level = currentLevel.value;

      if (level === "start") {
         // Инвертированная логика для центрального отображения:
         // Свайп слева направо (swipeRight = true) = свайп влево → facade-start-2
         // Свайп справа налево (swipeRight = false) = свайп вправо → facade-start
         if (swipeRight) {
            // Свайп слева направо = свайп влево → facade-start-2
            handleFacadeStart2Click();
         } else {
            // Свайп справа налево = свайп вправо → facade-start
            handleFacadeStartClick();
         }
      } else if (level === "facade-start") {
         if (swipeRight) {
            handleBackToStartFromFacade();
         }
      } else if (level === "facade-start-2") {
         if (!swipeRight) {
            handleBackToStartFromFacade2();
         }
      }
   };

   return {
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
   };
}

