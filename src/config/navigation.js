// Конфигурация навигации: видео, картинки и координаты масок

// Импорт статических изображений
import mapImage from "../assets/video/Map.png";
import startImage from "../assets/video/Start.png";
import twoProjectsImage from "../assets/video/2Projects.png";
import leftImage from "../assets/video/Left.png";
import rightImage from "../assets/video/Right.png";

// Импорт картинок этажей
import floorImage1 from "../assets/video/1.png";
import floorImage2 from "../assets/video/2.png";
import floorImage3 from "../assets/video/3.png";
import floorImage4 from "../assets/video/4.png";
import floorImageG from "../assets/video/G.png";

// Импорт видео переходов
import internetCityVideo from "../assets/video/InternetCity.mp4";
import theRoyalYachtVideo from "../assets/video/TheRoyalYacht.mp4";
import facadeStartVideo from "../assets/video/FacadeStart.mp4";
import facadeStart2Video from "../assets/video/FacadeStart2.mp4";
import floor1Video from "../assets/video/Floor1.mp4";
import floor2Video from "../assets/video/Floor2.mp4";
import floor3Video from "../assets/video/Floor3.mp4";
import floor4Video from "../assets/video/Floor4.mp4";
import floorGVideo from "../assets/video/FloorG.mp4";

// Конфигурация масок для уровня Map
export const mapMasks = {
   house1: {
      id: "house1",
      name: "House 1",
      points: [
         // Координаты первой маски (в процентах от размера изображения)
         { x: 76.3, y: 24.6 },
         { x: 77.8, y: 23.5 },
         { x: 78.8, y: 24.5 },
         { x: 78.6, y: 29.5 },
         { x: 76, y: 28.5 },
      ],
      path: "", // SVG path (если используется)
   },
   house2: {
      id: "house2",
      name: "House 2",
      points: [
         // Координаты второй маски (в процентах от размера изображения)
         { x: 59, y: 40.8 },
         { x: 60, y: 35 },
         { x: 61, y: 32.1 },
         { x: 63, y: 33 },
         { x: 64.5, y: 34.5 },
         { x: 66, y: 41.0 },
         { x: 62, y: 43.5 },
      ],
      path: "", // SVG path (если используется)
   },
   // Территория для красной маски (disclaimer mode)
   territory: {
      id: "territory",
      name: "Territory",
      points: [
         // Координаты территории, охватывающей оба дома (в процентах от размера изображения)
         // Можно настроить под конкретную территорию
         { x: 28, y: 27.4 },
         { x: 30, y: 18.3 },
         { x: 20, y: 8 },
         { x: 65, y: 4 },
         { x: 95, y: 36.6 },
         { x: 98, y: 66 },
         { x: 30, y: 66.8 },
         { x: 10, y: 66.0 },
         { x: 7, y: 62.4 },
         { x: 9.3, y: 43.9 },
         { x: 11, y: 38.3 },
         { x: 20, y: 33.5 },
         { x: 23, y: 31.9 },
      ],
      path: "", // SVG path (если используется)
   },
};

// Конфигурация масок для уровня 2-projects (такие же как на Map)
export const twoProjectsMasks = {
   project1: {
      id: "project1",
      name: "Project 1",
      points: [
         // Координаты первой маски (в процентах от размера изображения)
         { x: 78.3, y: 15.1 },
         { x: 82.4, y: 16.0 },
         { x: 82, y: 27.5 },
         { x: 80, y: 32.0 },
         { x: 77.5, y: 31.1 },
         { x: 77.5, y: 28.2 },
         { x: 75.5, y: 27.5 },
         { x: 76, y: 17.9 },
      ],
      path: "", // SVG path (если используется)
   },
   project2: {
      id: "project2",
      name: "Project 2",
      points: [
         // Координаты второй маски (в процентах от размера изображения)
         { x: 31, y: 63.1 },
         { x: 32.7, y: 47 },
         { x: 33.5, y: 45 },
         { x: 35, y: 44 },
         { x: 39.5, y: 45 },
         { x: 39.2, y: 47 },
         { x: 39.5, y: 47 },
         { x: 40.3, y: 45.7 },
         { x: 42, y: 45.3 },
         { x: 44, y: 46 },
         { x: 50, y: 50.5 },
         { x: 50.2, y: 51.1 },
         { x: 50, y: 52.9 },
         { x: 52.4, y: 55.2 },
         { x: 52, y: 56.3 },
         { x: 53, y: 57.5 },
         { x: 52.5, y: 58.3 },
         { x: 53.5, y: 59.5 },
         { x: 54, y: 62 },
         { x: 54.3, y: 65.4 },
         { x: 54.3, y: 70.0 },
         { x: 40, y: 78.2 },
         { x: 33, y: 75.6 },
         { x: 30.7, y: 75.6 },
      ],
      path: "", // SVG path (если используется)
   },
};

// Конфигурация этажей для уровня Start
export const floorsConfig = {
   g: {
      id: "g",
      name: "Ground Floor",
      transitionVideo: floorGVideo,
      image: floorImageG,
      path: "", // SVG path (если используется)
      points: [
         // Координаты маски для этажа G (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start
         { x: 24, y: 62 },
         { x: 26, y: 63 },
         { x: 28, y: 63.7 },
         { x: 32, y: 64 },
         { x: 37, y: 63.5 },
         { x: 38, y: 63.1 },
         { x: 39.5, y: 61.6 },
         { x: 39.5, y: 61.6 },
         { x: 41, y: 59 },
         { x: 42.6, y: 57.0 },
         { x: 46, y: 46.2 },
         { x: 50, y: 46.5 },
         { x: 60, y: 51 },
         { x: 70, y: 56.2 },
         { x: 80, y: 60.2 },
         { x: 85, y: 59.4 },
         { x: 90, y: 56.6 },
         { x: 93, y: 59 },
         { x: 92, y: 70.0 },
         { x: 85, y: 75.0 },
         { x: 77, y: 79.1 },
         { x: 70, y: 81.4 },
         { x: 60, y: 86.0 },
         { x: 52, y: 89.6 },
         { x: 40.5, y: 86.3 },
         { x: 40.5, y: 66.1 },
         { x: 34, y: 77.8 },
         { x: 31, y: 78.4 },
         { x: 29, y: 77.0 },
         { x: 27, y: 71.4 },
         { x: 24.8, y: 67.0 },
      ],
   },
   1: {
      id: "1",
      name: "Floor 1",
      transitionVideo: floor1Video,
      image: floorImage1, // Пока нет картинки для этажа 1
      path: "",
      points: [
         // Координаты маски для этажа 1 (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start
         { x: 24.2, y: 59.0 },
         { x: 24.7, y: 52.5 },
         { x: 26, y: 53.7 },
         { x: 28, y: 54 },
         { x: 30, y: 54.3 },
         { x: 35, y: 54.6 },
         { x: 39, y: 54 },
         { x: 40, y: 53 },
         { x: 43.7, y: 48.0 },
         { x: 45.5, y: 41.3 },
         { x: 50, y: 41.3 },
         { x: 60, y: 45.7 },
         { x: 70, y: 50 },
         { x: 75, y: 52.5 },
         { x: 77, y: 53 },
         { x: 85, y: 52 },
         { x: 89, y: 49 },
         { x: 90.5, y: 49.8 },
         { x: 90.5, y: 50.7 },
         { x: 92, y: 52.5 },
         { x: 90.3, y: 56.2 },
         { x: 88, y: 58.0 },
         { x: 84, y: 59.7 },
         { x: 80, y: 60.2 },
         { x: 70, y: 56.2 },
         { x: 60, y: 51 },
         { x: 50, y: 46.5 },
         { x: 46, y: 46.2 },
         { x: 42.7, y: 57.0 },
         { x: 39, y: 62.0 },
         { x: 37.5, y: 63.3 },
         { x: 36, y: 63.6 },
         { x: 32, y: 64 },
         { x: 27, y: 63.5 },
         { x: 24, y: 62.1 },
         { x: 23.6, y: 61.6 },
      ],
   },
   2: {
      id: "2",
      name: "Floor 2",
      transitionVideo: floor2Video,
      image: floorImage2,
      path: "",
      points: [
         // Координаты маски для этажа 2 (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start
         { x: 26, y: 45.3 },
         { x: 28, y: 45.8 },
         { x: 30, y: 46.2 },
         { x: 33, y: 46.4 },
         { x: 39, y: 46.2 },
         { x: 40, y: 45.3 },
         { x: 44.2, y: 41 },
         { x: 45.5, y: 36 },
         { x: 50, y: 36 },
         { x: 65, y: 42 },
         { x: 74, y: 45.6 },
         { x: 76, y: 45.8 },
         { x: 78, y: 45.5 },
         { x: 80, y: 45 },
         { x: 85.3, y: 43 },
         { x: 87, y: 43 },
         { x: 88.5, y: 43.5 },
         { x: 89.5, y: 44.2 },
         { x: 90.5, y: 46.2 },
         { x: 89, y: 48.9 },
         { x: 85, y: 52 },
         { x: 83, y: 52.5 },
         { x: 81, y: 53 },
         { x: 78, y: 53 },
         { x: 77, y: 53 },
         { x: 68, y: 49 },
         { x: 58, y: 45 },
         { x: 50, y: 41.3 },
         { x: 45.5, y: 41.3 },
         { x: 44.3, y: 46.2 },
         { x: 43.5, y: 48.4 },
         { x: 40, y: 53.5 },
         { x: 39, y: 54 },
         { x: 37, y: 54.5 },
         { x: 33, y: 54.7 },
         { x: 30, y: 54.6 },
         { x: 25.5, y: 53.6 },
         { x: 24.7, y: 52.5 },
      ],
   },
   3: {
      id: "3",
      name: "Floor 3",
      transitionVideo: floor3Video,
      image: floorImage3,
      path: "",
      points: [
         // Координаты маски для этажа 3 (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start
         { x: 26.5, y: 37.5 },
         { x: 35, y: 38.7 },
         { x: 38, y: 38.5 },
         { x: 40, y: 38 },
         { x: 41, y: 37.5 },
         { x: 44.5, y: 33.6 },
         { x: 45.3, y: 30.9 },
         { x: 45.5, y: 30.5 },
         { x: 50, y: 30.5 },
         { x: 60, y: 34 },
         { x: 65, y: 35.6 },
         { x: 70, y: 38 },
         { x: 73, y: 38.6 },
         { x: 77, y: 38.4 },
         { x: 80, y: 37.6 },
         { x: 85, y: 35.9 },
         { x: 87.8, y: 38.8 },
         { x: 86.7, y: 41.2 },
         { x: 86, y: 42.6 },
         { x: 80, y: 45.3 },
         { x: 76, y: 45.8 },
         { x: 74, y: 45.6 },
         { x: 70, y: 44.0 },
         { x: 50, y: 36 },
         { x: 45.5, y: 36 },
         { x: 44, y: 41.3 },
         { x: 40, y: 45.8 },
         { x: 37, y: 46.3 },
         { x: 30, y: 46.3 },
         { x: 26, y: 45.3 },
      ],
   },
   4: {
      id: "4",
      name: "Floor 4",
      transitionVideo: floor4Video,
      image: floorImage4,
      path: "",
      points: [
         // Координаты маски для этажа 4 (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start
         { x: 27.3, y: 28.4 },
         { x: 29, y: 29.6 },
         { x: 35, y: 30.5 },
         { x: 39, y: 30 },
         { x: 43, y: 29 },
         { x: 44.3, y: 28.2 },
         { x: 46.4, y: 24 },
         { x: 50, y: 24 },
         { x: 58, y: 27.0 },
         { x: 62, y: 28.1 },
         { x: 68, y: 29 },
         { x: 78, y: 29 },
         { x: 86, y: 31.7 },
         { x: 86, y: 32.4 },
         { x: 84.5, y: 36 },
         { x: 80, y: 37.6 },
         { x: 76, y: 38.6 },
         { x: 72, y: 38.6 },
         { x: 67, y: 36.6 },
         { x: 60, y: 34 },
         { x: 50, y: 30.5 },
         { x: 45.5, y: 30.5 },
         { x: 44.5, y: 33.8 },
         { x: 42, y: 36.3 },
         { x: 40.5, y: 38 },
         { x: 38, y: 38.6 },
         { x: 35, y: 38.6 },
         { x: 30, y: 38.6 },
         { x: 26.4, y: 37.6 },
      ],
   },
   5: {
      id: "5",
      name: "Floor 5",
      transitionVideo: null, // Пока нет видео для этажа 5
      image: null, // Пока нет картинки для этажа 5
      path: "",
      points: [
         // Координаты маски для этажа 5 (в процентах от размера изображения)
         // Нужно настроить под вашу картинку Start

         { x: 27, y: 22.9 },
         { x: 30, y: 18.3 },
         { x: 33.2, y: 14.4 },
         { x: 40, y: 14.4 },
         { x: 46.2, y: 14.7 },
         { x: 46, y: 17.5 },
         { x: 49, y: 17.5 },
         { x: 49.7, y: 15.5 },
         { x: 52, y: 15 },
         { x: 59.5, y: 15.5 },
         { x: 78.5, y: 20.3 },
         { x: 80, y: 22 },
         { x: 79, y: 23 },
         { x: 78, y: 23.5 },
         { x: 77.7, y: 29 },
         { x: 67, y: 29 },
         { x: 50, y: 24 },
         { x: 46.3, y: 24 },
         { x: 44.3, y: 28.3 },
         { x: 40, y: 30.1 },
         { x: 35, y: 30.5 },
         { x: 29, y: 29.7 },
         { x: 27, y: 28.2 },
      ],
   },
};

// Конфигурация уровней и их изображений
export const levelImages = {
   map: mapImage,
   "2-projects": twoProjectsImage,
   start: startImage,
   "facade-start": rightImage, // Используем right.png для перехода вправо
   "facade-start-2": leftImage, // Используем Left.png для перехода влево
};

// Конфигурация видео переходов между уровнями
export const levelTransitions = {
   "map-to-2-projects": internetCityVideo,
   "2-projects-to-start": theRoyalYachtVideo,
   "map-to-start": internetCityVideo, // Для обратной совместимости
   "start-to-facade-start": facadeStartVideo,
   "start-to-facade-start-2": facadeStart2Video,
};

// Экспорт всех конфигураций
export default {
   mapMasks,
   twoProjectsMasks,
   floorsConfig,
   levelImages,
   levelTransitions,
};

