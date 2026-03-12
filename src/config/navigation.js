// Конфигурация навигации: видео, картинки и координаты масок

// Импорт статических изображений
import mapImage from "../assets/holo/Build-start.jpeg";
import twoProjectsBaseImage from "../assets/video/2Projects.png";
import buildEndImage from "../assets/holo/Build-end.jpeg";
import build2EndImage from "../assets/holo/Build2-end.jpeg";
import build3EndImage from "../assets/holo/Build3-end.jpeg";
import apartmentsImage1 from "../assets/holo/Appartments-right1.jpeg";
import apartmentsImage2 from "../assets/holo/Appartments-right2.jpeg";
import apartmentsImage3 from "../assets/holo/Appartments-right3.jpeg";
import apartmentsImage4 from "../assets/holo/Appartments-right4.jpeg";

// Импорт видео переходов (новый контент)
import build1Video from "../assets/holo/Build1.mp4";
import build2Video from "../assets/holo/Build2.mp4";
import build3Video from "../assets/holo/Build3.mp4";
import build4Video from "../assets/holo/Build4.mp4";
import build5Video from "../assets/holo/Build5.mp4";
import build6Video from "../assets/holo/Build6.mp4";
import build7Video from "../assets/holo/Build7.mp4";
import build8Video from "../assets/holo/Build8.mp4";

// Импорт reverse-видео для обратного перехода и стрелки влево
import build1Reverse from "../assets/holo/Build1-reverse.mp4";
import build2Reverse from "../assets/holo/Build2-reverse.mp4";
import build3Reverse from "../assets/holo/Build3-reverse.mp4";
import build4Reverse from "../assets/holo/Build4-reverse.mp4";
import build5Reverse from "../assets/holo/Build5-reverse.mp4";
import build6Reverse from "../assets/holo/Build6-reverse.mp4";
import build7Reverse from "../assets/holo/Build7-reverse.mp4";
import build8Reverse from "../assets/holo/Build8-reverse.mp4";

// Конфигурация масок для уровня Map (квадрат по центру)
export const mapMasks = {
   house2: {
      id: "house2",
      name: "",
      points: [
         { x: 51, y: 48.6 },
         { x: 53.5, y: 48.8 },
         { x: 54, y: 52 },
         { x: 53.6, y: 54 },
         { x: 52, y: 55.5 },
         { x: 50.4, y: 55 },
         { x: 50.5, y: 52 },
      ],
      path: "",
   },
};

// Конфигурация масок для уровня 2-projects (квадрат по центру)
export const twoProjectsMasks = {
   project2: {
      id: "project2",
      name: "",
      points: [
         { x: 50.5, y: 46 },
         { x: 52.3, y: 44.5 },
         { x: 55, y: 45 },
         { x: 55.5, y: 57 },
         { x: 54, y: 60 },
         { x: 53, y: 61 },
         { x: 49.5, y: 60 },
         { x: 49.3, y: 55 },
         { x: 49.5, y: 49 },
      ],
      path: "",
   },
};

// Конфигурация масок для уровня Start (квадрат по центру для перехода к аппартаментам)
export const startMasks = {
   toApartments: {
      id: "toApartments",
      name: "Appartments",
      points: [
         { x: 40, y: 11 },
         { x: 46, y: 6 },
         { x: 56, y: 6 },
         { x: 66.5, y: 6 },
         { x: 67, y: 16 },
         { x: 66.8, y: 26 },
         { x: 63, y: 37.5 },
         { x: 60, y: 37 },
         { x: 54, y: 36 },
         { x: 48, y: 35 },
         { x: 45, y: 37 },
         { x: 43.6, y: 37 },
         { x: 37.5, y: 27 },
      ],
      path: "",
   },
};

// Конфигурация этажей временно отключена для этого проекта
export const floorsConfig = {};

// Конфигурация уровней и их изображений
export const levelImages = {
   map: mapImage,
   "2-projects": buildEndImage,
   start: build2EndImage,
   "facade-start": build3EndImage,
   "facade-start-2": apartmentsImage1,
   "view-4": apartmentsImage2,
   "view-5": apartmentsImage3,
   "view-6": apartmentsImage4,
};

// Конфигурация видео переходов между уровнями
export const levelTransitions = {
   // Forward transitions
   "map-to-2-projects": build1Video,
   "2-projects-to-start": build2Video,
   "map-to-start": build1Video, // Для обратной совместимости
   "start-to-facade-start": build3Video,
   "start-to-facade-start-2": build4Video,
   "facade-start-to-view-4": build5Video,
   "view-4-to-view-5": build6Video,
   "view-5-to-view-6": build7Video,
   "view-6-to-facade-start": build8Video,

   // Reverse transitions (обратный переход и стрелка влево)
   "2-projects-to-map": build1Reverse,
   "start-to-2-projects": build2Reverse,
   "facade-start-to-start": build3Reverse,
   "facade-start-2-to-start": build4Reverse,
   "facade-start-2-to-facade-start": build4Reverse,
   "view-4-to-facade-start": build5Reverse,
   "view-5-to-view-4": build6Reverse,
   "view-6-to-view-5": build7Reverse,
   "facade-start-to-view-6": build8Reverse,
};

// Экспорт всех конфигураций
export default {
   mapMasks,
   twoProjectsMasks,
   startMasks,
   floorsConfig,
   levelImages,
   levelTransitions,
};

