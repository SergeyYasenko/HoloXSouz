/**
 * Координаты масок квартир для каждого этажа.
 * Точки в процентах от размера изображения этажа (x, y: 0-100).
 * При клике на маску открывается 2D схема квартиры (scheme2D).
 */

import { floor1ApartmentMasks } from "./floors/floor1ApartmentMasks";
import { floor2ApartmentMasks } from "./floors/floor2ApartmentMasks";
import { floor3ApartmentMasks } from "./floors/floor3ApartmentMasks";
import { floor4ApartmentMasks } from "./floors/floor4ApartmentMasks";
import { floorGApartmentMasks } from "./floors/floorGApartmentMasks";

// Реэкспорт для обратной совместимости
export { floor1ApartmentMasks, floor2ApartmentMasks, floor3ApartmentMasks, floor4ApartmentMasks, floorGApartmentMasks };

export const floorApartmentMasksByFloor = {
   "1": floor1ApartmentMasks,
   "2": floor2ApartmentMasks,
   "3": floor3ApartmentMasks,
   "4": floor4ApartmentMasks,
   g: floorGApartmentMasks,
};

export default floorApartmentMasksByFloor;
