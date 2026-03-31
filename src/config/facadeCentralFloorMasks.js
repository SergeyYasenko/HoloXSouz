/**
 * Маски этажей центрального корпуса на статичных кадрах обхода фасада.
 * Для каждого фасадного уровня (builds, builds-2, view-4, view-5, view-6, build8)
 * задаётся набор узких горизонтальных полос — по одной на каждый этаж.
 *
 * Точки в процентах (0–100) от размера изображения уровня.
 * Координаты примерные — подстройте под финальные кадры при необходимости
 * через режим редактирования (?edit=true на главной).
 */
import facadeCentralFloorPlanImage from "../assets/holo/Build-floor.jpeg";

export { facadeCentralFloorPlanImage };

export const FACADE_ORBIT_LEVELS = [
   "builds",
   "builds-2",
   "view-4",
   "view-5",
   "view-6",
   "build8",
];

export const FACADE_ORBIT_LEVEL_SET = new Set(FACADE_ORBIT_LEVELS);

/**
 * Для простоты все уровни используют одинаковое горизонтальное положение маски,
 * отличается только вертикальное смещение по этажам.
 *
 * Можно отредактировать только массив y‑координат, если нужно «подогнать» этажи.
 */
const BASE_X_LEFT = 45;
const BASE_X_RIGHT = 62.7;

// Примерная СЕТКА БЕЗ ПРОПУСКОВ — каждый «этаж» идёт сразу за предыдущим.
// Шаг небольшой (около 2.5% по высоте), чтобы не было ощущения «через этаж».
// При необходимости скорректируйте только top/bottom под финальное изображение.
const FLOOR_Y_ROWS = [
   // исходный диапазон этажей
   { top: 30, bottom: 32.5 },
   { top: 32.5, bottom: 35 },
   { top: 35, bottom: 37.5 },
   { top: 37.5, bottom: 40 },
   { top: 40, bottom: 42.5 },
   { top: 42.5, bottom: 45 },
   { top: 45, bottom: 47.5 },
   { top: 47.5, bottom: 50 },
   { top: 50, bottom: 52.5 },
   { top: 52.5, bottom: 55 },
   { top: 55, bottom: 57.5 },
   { top: 57.5, bottom: 60 },
   { top: 60, bottom: 62.5 },
   { top: 62.5, bottom: 65 },
   { top: 65, bottom: 67.5 },
   // +6 этажей ВНИЗ (ближе к земле, y больше)
   { top: 67.5, bottom: 70 },
   { top: 70, bottom: 72.5 },
   { top: 72.5, bottom: 75 },
   { top: 75, bottom: 77.5 },
   { top: 77.5, bottom: 80 },
   { top: 80, bottom: 82.5 },
];

const makeFloorStripes = (xLeft, xRight) =>
   FLOOR_Y_ROWS.map((row, index) => ({
      id: `floor-${index + 1}`,
      points: [
         { x: xLeft, y: row.top },
         { x: xRight, y: row.top },
         { x: xRight, y: row.bottom },
         { x: xLeft, y: row.bottom },
      ],
      path: "",
   }));

export const facadeCentralFloorMasks = {
   /** Build3 — полосы по этажам на всю ширину центрального корпуса */
   builds: makeFloorStripes(BASE_X_LEFT, BASE_X_RIGHT),

   /** Appartments-right1 — такой же набор полос по этажам */
   "builds-2": makeFloorStripes(27, 73),

   "view-4": makeFloorStripes(26, 72),

   "view-5": makeFloorStripes(25.5, 71.5),

   "view-6": makeFloorStripes(26, 71),

   /** Build8 — полосы по этажам для крайнего ракурса */
   build8: makeFloorStripes(32, 68),
};
