// Конфигурация навигации: видео, картинки и координаты масок
// Порядок импортов: для каждого build — сначала фото, затем forward-видео, затем reverse (где есть).

// --- Build 1
import build1Image from "../assets/holo/Build1.jpeg";
import build1Video from "../assets/holo/Build1.mp4";
import build1Reverse from "../assets/holo/build1-reverse.mp4";

// --- Build 2
import build2Image from "../assets/holo/Build2.jpeg";
import build2Video from "../assets/holo/Build2.mp4";
import build2Reverse from "../assets/holo/Build2-reverse.mp4";

// --- Build 3
import build3Image from "../assets/holo/Build3.jpeg";
import build3Video from "../assets/holo/Build3.mp4";
import build3Reverse from "../assets/holo/Build3-reverse.mp4";

// --- Build 4–7 (только видео)
import build4Video from "../assets/holo/Build4.mp4";
import build4Reverse from "../assets/holo/Build4-reverse.mp4";
import build5Video from "../assets/holo/Build5.mp4";
import build5Reverse from "../assets/holo/Build5-reverse.mp4";
import build6Video from "../assets/holo/Build6.mp4";
import build6Reverse from "../assets/holo/Build6-reverse.mp4";
import build7Video from "../assets/holo/Build7.mp4";
import build7Reverse from "../assets/holo/Build7-reverse.mp4";

// --- Build 8
import build8Image from "../assets/holo/Build8.jpeg";
import build8Video from "../assets/holo/Build8.mp4";
import build8Reverse from "../assets/holo/Build8-reverse.mp4";

// --- Карта и квартиры
import mapImage from "../assets/holo/map.jpeg";
import apartmentsImage1 from "../assets/holo/Appartments-right1.jpeg";
import apartmentsImage2 from "../assets/holo/Appartments-right2.jpeg";
import apartmentsImage3 from "../assets/holo/Appartments-right3.jpeg";
import apartmentsImage4 from "../assets/holo/Appartments-right4.jpeg";

// --- Переходы по локациям (картинки превью)
import leftFootballFieldImage from "../assets/holo/moves/leftFootballField.jpg";
import sportsCourtsImage from "../assets/holo/moves/sportsCourts.jpg";
import sportsCenterImage from "../assets/holo/moves/sportsCenter.jpg";
import sportsCenterTopImage from "../assets/holo/moves/sportsCenterTop.jpg";
import rightStadiumImage from "../assets/holo/moves/rightStadium.jpeg";
import innerCourtyardImage from "../assets/holo/moves/innerCourtyard.jpeg";

// --- Видео переходов по локациям
import leftFootballFieldVideo from "../assets/holo/moves/leftFootballField.mp4";
import sportsCourtsVideo from "../assets/holo/moves/sportsCourts.mp4";
import sportsCenterVideo from "../assets/holo/moves/sportsCenter.mp4";
import sportsCenterTopVideo from "../assets/holo/moves/sportsCenterTop.mp4";
import rightStadiumVideo from "../assets/holo/moves/rightStadium.mp4";
import innerCourtyardVideo from "../assets/holo/moves/innerCourtyard.mp4";

// --- Reverse переходов по локациям
import leftFootballFieldReverse from "../assets/holo/moves/reverse/leftFootballField-reverse4.mp4";
import sportsCourtsReverse from "../assets/holo/moves/reverse/sportsCourts-reverse3.mp4";
import sportsCenterReverse from "../assets/holo/moves/reverse/sportsCenter-reverse1.mp4";
import sportsCenterTopReverse from "../assets/holo/moves/reverse/sportsCenterTop-reverse5.mp4";
import rightStadiumReverse from "../assets/holo/moves/reverse/rightStadium-reverse2.mp4";
import innerCourtyardReverse from "../assets/holo/moves/reverse/innerCourtyard-reverse6.mp4";

export const mapMasks = {
   house2: {
      id: "house2",
      name: "ЖК \"СОЮЗ\"",
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

export const twoProjectsMasks = {
   project2: {
      id: "project2",
      name: "ЖК \"СОЮЗ\"",
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
   innerCourtyard: {
      id: "innerCourtyard",
      name: "Внутренний двор",
      points: [
         { x: 48.5, y: 20 },
         { x: 45.8, y: 21.5 },
         { x: 43.3, y: 23 },
         { x: 45.1, y: 24.5 },
         { x: 46.7, y: 26.2 },
         { x: 49.5, y: 29.8 },
         { x: 51, y: 23.2 },
         { x: 56.5, y: 25.6 },
         { x: 55.5, y: 30.8 },
         { x: 58.5, y: 30.8 },
         { x: 60, y: 23 },
         { x: 64, y: 23 },
         { x: 65.5, y: 20 },
         { x: 58, y: 18.4 },
         { x: 56.5, y: 18.4 },
         { x: 55, y: 19 },
      ],
      path: "",
   },
   leftFootballField: {
      id: "leftFootballField",
      name: "Футбольное поле",
      points: [
         { x: 32.5, y: 67 },
         { x: 32.5, y: 95 },
         { x: 42.5, y: 95 },
         { x: 42.5, y: 67 },
      ],
      path: "",
   },
   sportsCourts: {
      id: "sportsCourts",
      name: "Корты и парковка",
      points: [
         { x: 37, y: 40 },
         { x: 34, y: 51 },
         { x: 32.5, y: 66.5 },
         { x: 43.5, y: 66.5 },
         { x: 43.5, y: 42 },
      ],
      path: "",
   },
   sportsCenter: {
      id: "sportsCenter",
      name: "Спортцентр",
      points: [
         { x: 44.5, y: 67 },
         { x: 44.5, y: 93 },
         { x: 52.5, y: 93 },
         { x: 52.5, y: 67 },
      ],
      path: "",
   },
   sportsCenterTop: {
      id: "sportsCenterTop",
      name: "Площадка",
      points: [
         { x: 46, y: 45.5 },
         { x: 46, y: 58.5 },
         { x: 52.5, y: 58.5 },
         { x: 52.5, y: 45.5 },
      ],
      path: "",
   },
   rightStadium: {
      id: "rightStadium",
      name: "Стадион",
      points: [
         { x: 60, y: 42 },
         { x: 59, y: 43 },
         { x: 56.5, y: 44.6 },
         { x: 54.7, y: 50 },
         { x: 54.5, y: 52 },
         { x: 54.5, y: 55.5 },
         { x: 54.5, y: 59.5 },
         { x: 54.5, y: 64.5 },
         { x: 54.7, y: 68.5 },
         { x: 54.9, y: 72 },
         { x: 55.2, y: 76 },
         { x: 56.5, y: 78.8 },
         { x: 59, y: 81.6 },
         { x: 62, y: 82.3 },
         { x: 66, y: 79 },
         { x: 67, y: 76 },
         { x: 67, y: 72 },
         { x: 66.9, y: 68 },
         { x: 66.8, y: 64 },
         { x: 66.8, y: 59.5 },
         { x: 66.8, y: 57 },
         { x: 66.8, y: 53.5 },
         { x: 66.7, y: 50 },
         { x: 66.7, y: 49 },
         { x: 66.4, y: 47.5 },
         { x: 65.8, y: 46 },
         { x: 62.8, y: 42.5 },
      ],
      path: "",
   },
};

// Конфигурация этажей временно отключена для этого проекта
export const floorsConfig = {};

// Конфигурация уровней и их изображений
export const levelImages = {
   map: mapImage,
   start: build1Image,
   plane: build2Image,
   // next/right chain: right1 -> right2 -> right3 -> right4 -> build3 (close chain)
   builds: build3Image,
   build8: build8Image,
   "builds-2": apartmentsImage1,
   "view-4": apartmentsImage2,
   "view-5": apartmentsImage3,
   "view-6": apartmentsImage4,
   leftFootballField: leftFootballFieldImage,
   sportsCourts: sportsCourtsImage,
   sportsCenter: sportsCenterImage,
   sportsCenterTop: sportsCenterTopImage,
   rightStadium: rightStadiumImage,
   innerCourtyard: innerCourtyardImage,
};

// prev/left chain should use "right" static images.
export const apartmentsRightLevelImages = {
   builds: build3Image,
   build8: build8Image,
   "builds-2": apartmentsImage1,
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
   "start-to-leftFootballField": leftFootballFieldVideo,
   "start-to-sportsCourts": sportsCourtsVideo,
   "start-to-sportsCenter": sportsCenterVideo,
   "start-to-sportsCenterTop": sportsCenterTopVideo,
   "start-to-rightStadium": rightStadiumVideo,
   "start-to-innerCourtyard": innerCourtyardVideo,

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
   "leftFootballField-to-start": leftFootballFieldReverse,
   "sportsCourts-to-start": sportsCourtsReverse,
   "sportsCenter-to-start": sportsCenterReverse,
   "sportsCenterTop-to-start": sportsCenterTopReverse,
   "rightStadium-to-start": rightStadiumReverse,
   "innerCourtyard-to-start": innerCourtyardReverse,
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
