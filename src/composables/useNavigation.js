import { computed, nextTick } from "vue";
import { levelImages, levelTransitions, floorsConfig } from "../config/navigation.js";

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

   const handleFacadeStartClick = async () => {
      if (isTransitioning.value) return;

      const previousLevel = currentLevel.value;
      const wasTransitioning = isTransitioning.value;

      startLevelTransition(
         levelTransitions["start-to-facade-start"],
         "facade-start"
      );

      await nextTick();

      if (isTransitioning.value && !wasTransitioning) {
         disabledArrowRight.value = true;

         setTimeout(() => {
            if (currentLevel.value !== "facade-start" && currentLevel.value === previousLevel) {
               disabledArrowRight.value = false;
            }
         }, 2000);
      }
   };

   const handleFacadeStart2Click = () => {
      if (isTransitioning.value) return;

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

      // При просмотре ЖК: с любого вида один шаг "Назад" возвращает на facade-start (Build3-end)
      if (
         currentLevel.value === "facade-start-2" ||
         currentLevel.value === "view-4" ||
         currentLevel.value === "view-5" ||
         currentLevel.value === "view-6"
      ) {
         goBackToLevel("facade-start");
         return;
      }

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

      if (
         currentLevel.value === "leftFootballField" ||
         currentLevel.value === "sportsCourts" ||
         currentLevel.value === "sportsCenter" ||
         currentLevel.value === "sportsCenterTop" ||
         currentLevel.value === "rightStadium" ||
         currentLevel.value === "innerCourtyard"
      ) {
         goBackToLevel("start");
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

   const handleBackFromFacade = (isStepToRight) => {
      const level = currentLevel.value;

      if (level === "facade-start") {
         if (isStepToRight) {
            handleBackToStartFromFacade();
         }
      } else if (level === "facade-start-2") {
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
