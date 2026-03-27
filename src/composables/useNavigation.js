import { computed, nextTick } from "vue";
import { levelImages, apartmentsRightLevelImages, levelTransitions, floorsConfig } from "../config/navigation.js";

/** Периферия обхода фасада — «Назад» обрабатывается в Home (мгновенно на builds). */
const FACADE_PERIPHERAL_LEVELS = new Set([
   "builds-2",
   "view-4",
   "view-5",
   "view-6",
   "build8",
]);

export function useNavigation(
   currentLevel,
   levelHistory,
   isTransitioning,
   disabledArrowLeft,
   disabledArrowRight,
   startLevelTransition,
   goBackToLevel,
   isReverseTransition = null,
   reverseSourceLevel = null,
   forwardSourceLevel = null
) {
   const getLevelImage = (level) => {
      // For reverse transitions (prev/left chain) use dedicated left images.
      if (isReverseTransition?.value && apartmentsRightLevelImages?.[level]) {
         return apartmentsRightLevelImages[level];
      }
      if (levelImages[level]) return levelImages[level];

      if (level?.startsWith("floor-")) {
         const floorId = level.replace("floor-", "");
         return floorsConfig[floorId]?.image || levelImages.start;
      }
      return null;
   };

   const getActiveLevel = () => {
      if (isTransitioning?.value && isReverseTransition?.value && reverseSourceLevel?.value) {
         return reverseSourceLevel.value;
      }
      if (isTransitioning?.value && forwardSourceLevel?.value) {
         return forwardSourceLevel.value;
      }
      return currentLevel.value;
   };

   const allLevelImages = computed(() => {
      const images = [];
      for (const [level, image] of Object.entries(levelImages)) {
         images.push({ level, image });
      }
      for (const [floorId, floor] of Object.entries(floorsConfig)) {
         if (floor.image) {
            images.push({ level: `floor-${floorId}`, image: floor.image });
         }
      }
      return images;
   });

   const getLevelImageZIndex = (level) => {
      const activeLevel = getActiveLevel();
      if (level === activeLevel) return 2;
      return 1;
   };

   const currentStaticImage = computed(() => {
      return getLevelImage(getActiveLevel());
   });

   const handleHouse1Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["map-to-2-projects"], "start");
   };

   const handleHouse2Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["map-to-2-projects"], "start");
   };

   const handleProject1Click = () => {
      window.location.reload();
   };

   const handleProject2Click = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["2-projects-to-start"], "plane");
   };

   const handleFacadeStartClick = async () => {
      if (isTransitioning.value) return;

      const previousLevel = currentLevel.value;
      const wasTransitioning = isTransitioning.value;

      startLevelTransition(
         levelTransitions["start-to-facade-start"],
         "builds"
      );

      await nextTick();

      if (isTransitioning.value && !wasTransitioning) {
         disabledArrowRight.value = true;

         setTimeout(() => {
            if (currentLevel.value !== "builds" && currentLevel.value === previousLevel) {
               disabledArrowRight.value = false;
            }
         }, 2000);
      }
   };

   const handleFacadeStart2Click = () => {
      if (isTransitioning.value) return;

      startLevelTransition(
         levelTransitions["start-to-facade-start-2"],
         "builds-2"
      );
   };

   const handleBackToStartFromFacade = () => {
      if (isTransitioning.value) return;
      goBackToLevel("plane");
   };

   const handleBackToStartFromFacade2 = () => {
      if (isTransitioning.value) return;
      goBackToLevel("plane");
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

   const handleLeftFootballFieldClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-leftFootballField"], "leftFootballField");
   };

   const handleSportsCourtsClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-sportsCourts"], "sportsCourts");
   };

   const handleSportsCenterClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-sportsCenter"], "sportsCenter");
   };

   const handleSportsCenterTopClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-sportsCenterTop"], "sportsCenterTop");
   };

   const handleRightStadiumClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-rightStadium"], "rightStadium");
   };

   const handleInnerCourtyardClick = () => {
      if (isTransitioning.value) return;
      levelHistory.value.push(currentLevel.value);
      startLevelTransition(levelTransitions["start-to-innerCourtyard"], "innerCourtyard");
   };

   const handleBackClick = () => {
      if (isTransitioning.value) return;

      if (currentLevel.value === "builds") {
         goBackToLevel("plane");
         return;
      }

      if (FACADE_PERIPHERAL_LEVELS.has(currentLevel.value)) {
         currentLevel.value = "builds";
         return;
      }

      if (currentLevel.value === "plane") {
         const previousLevel = levelHistory.value.pop();
         if (!previousLevel) {
            goBackToLevel("start");
            return;
         }
         goBackToLevel(previousLevel);
         return;
      }

      if (
         currentLevel.value === "leftFootballField" ||
         currentLevel.value === "sportsCourts" ||
         currentLevel.value === "sportsCenter" ||
         currentLevel.value === "sportsCenterTop" ||
         currentLevel.value === "rightStadium" ||
         currentLevel.value === "innerCourtyard"
      ) {
         goBackToLevel("plane");
         return;
      }

      const previousLevel = levelHistory.value.pop();
      if (!previousLevel) {
         if (currentLevel.value.startsWith("floor-")) {
            goBackToLevel("plane");
         } else if (currentLevel.value === "start") {
            goBackToLevel("map");
         }
         return;
      }

      goBackToLevel(previousLevel);
   };

   const handleBackFromFacade = (isStepToRight) => {
      const level = currentLevel.value;

      if (level === "builds") {
         if (isStepToRight) {
            handleBackToStartFromFacade();
         }
      } else if (level === "builds-2") {
         if (!isStepToRight) {
            handleBackToStartFromFacade2();
         }
      }
   };

   return {
      currentStaticImage,
      allLevelImages,
      getLevelImageZIndex,
      getActiveLevel,
      getLevelImage,
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
      handleBackFromFacade,
      handleLeftFootballFieldClick,
      handleSportsCourtsClick,
      handleSportsCenterClick,
      handleSportsCenterTopClick,
      handleRightStadiumClick,
      handleInnerCourtyardClick,
   };
}
