<template>
   <div
      class="house-outline-wrapper"
      :style="wrapperStyle"
      :data-always-visible="alwaysVisible"
   >
      <canvas
         ref="canvasRef"
         class="house-outline-canvas"
         :class="{
            'house-outline-canvas-visible': isVisible || props.alwaysVisible,
            'house-outline-canvas-instant': alwaysVisibleChanging,
         }"
         :style="canvasStyle"
      ></canvas>
      <div
         ref="hitAreaRef"
         class="house-outline-hit-area"
         :class="{ 'house-outline-hit-area-pointer': isCursorInside }"
         :style="{ ...wrapperStyle, clipPath: getClipPath() }"
         @mousemove="handleMouseMove"
         @mouseenter="handleMouseEnter"
         @mouseleave="handleMouseLeave"
         @click.stop="handleClick"
         @touchstart.stop="handleTouchStart"
         @touchend.stop="handleTouchEnd"
      ></div>
   </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = defineProps({
   // Координаты контура дома (массив точек {x, y} в процентах от размера видео)
   // Например: [{x: 20, y: 30}, {x: 80, y: 30}, {x: 80, y: 70}, {x: 20, y: 70}]
   points: {
      type: Array,
      default: () => [],
   },
   // Или SVG path строка (более гибкий вариант)
   path: {
      type: String,
      default: "",
   },
   // Цвет обводки
   strokeColor: {
      type: String,
      default: "transparent",
   },
   // Ширина обводки
   strokeWidth: {
      type: Number,
      default: 3,
   },
   // Цвет подсветки/заливки (с прозрачностью)
   glowColor: {
      type: String,
      default: "rgba(0, 255, 255, 0.2)",
   },
   // Интенсивность свечения (размытие)
   glowBlur: {
      type: Number,
      default: 20,
   },
   // Включить анимацию пульсации
   animated: {
      type: Boolean,
      default: true,
   },
   // Скорость анимации (мс)
   animationSpeed: {
      type: Number,
      default: 2000,
   },
   // Кастомный обработчик клика (если не указан, используется window.location.reload())
   onClick: {
      type: Function,
      default: null,
   },
   // Показывать маску постоянно (не только при наведении)
   alwaysVisible: {
      type: Boolean,
      default: false, // По умолчанию маски показываются только при наведении
   },
});

const canvasRef = ref(null);
const hitAreaRef = ref(null);
const canvasStyle = ref({});
const wrapperStyle = ref({});
const isVisible = ref(false);
const alwaysVisibleChanging = ref(false);
let animationFrame = null;
let animationStartTime = 0;

// Получить реальные размеры и позицию изображения с учетом object-fit: cover
const getImageCoverInfo = () => {
   // Сначала проверяем видео - находим видимое видео (не скрытое через v-show)
   const videos = document.querySelectorAll(".home-video");
   let video = null;

   // Ищем видимое видео (то, которое не скрыто)
   for (const v of videos) {
      const style = window.getComputedStyle(v);
      if (
         style.display !== "none" &&
         style.visibility !== "hidden" &&
         style.opacity !== "0"
      ) {
         video = v;
         break;
      }
   }

   // Если не нашли видимое, берем первое с загруженными метаданными
   if (!video && videos.length > 0) {
      for (const v of videos) {
         if (v.videoWidth > 0 || v.naturalWidth > 0) {
            video = v;
            break;
         }
      }
      // Если все еще не нашли, берем первое
      if (!video) {
         video = videos[0];
      }
   }

   if (video) {
      // Получаем natural размеры видео
      const videoWidth = video.videoWidth || video.naturalWidth || 0;
      const videoHeight = video.videoHeight || video.naturalHeight || 0;

      // Получаем размеры контейнера
      let containerWidth = video.offsetWidth;
      let containerHeight = video.offsetHeight;

      // Если контейнер скрыт через v-show, используем размеры окна
      if (containerWidth <= 0 || containerHeight <= 0) {
         containerWidth = window.innerWidth;
         containerHeight = window.innerHeight;
      }

      // Если natural размеры не загружены, используем размеры контейнера
      const finalVideoWidth = videoWidth > 0 ? videoWidth : containerWidth;
      const finalVideoHeight = videoHeight > 0 ? videoHeight : containerHeight;

      // Вычисляем масштаб для object-fit: cover
      const scaleX = containerWidth / finalVideoWidth;
      const scaleY = containerHeight / finalVideoHeight;
      const scale = Math.max(scaleX, scaleY);

      // Вычисляем реальный размер отображаемого изображения
      const displayWidth = finalVideoWidth * scale;
      const displayHeight = finalVideoHeight * scale;

      // Вычисляем смещение (центрирование) - это смещение изображения в контейнере
      // Для object-fit: cover изображение может быть больше контейнера
      const offsetX = (containerWidth - displayWidth) / 2;
      const offsetY = (containerHeight - displayHeight) / 2;

      // Проверяем, что offsetX и offsetY не NaN
      const finalOffsetX = isNaN(offsetX) ? 0 : offsetX;
      const finalOffsetY = isNaN(offsetY) ? 0 : offsetY;

      return {
         containerWidth,
         containerHeight,
         imageWidth: finalVideoWidth,
         imageHeight: finalVideoHeight,
         displayWidth,
         displayHeight,
         scale,
         offsetX: finalOffsetX,
         offsetY: finalOffsetY,
      };
   }

   // Затем проверяем изображение - находим видимое изображение
   const images = document.querySelectorAll(".home-image");
   let image = null;

   // Сначала ищем видимое изображение (то, которое не скрыто)
   for (const img of images) {
      const style = window.getComputedStyle(img);
      if (
         style.display !== "none" &&
         style.visibility !== "hidden" &&
         style.opacity !== "0"
      ) {
         // Проверяем, что изображение загружено (имеет natural размеры)
         if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            image = img;
            break;
         }
      }
   }

   // Если не нашли видимое, ищем любое с загруженными natural размерами
   if (!image) {
      for (const img of images) {
         if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            image = img;
            break;
         }
      }
   }

   // Если не нашли с natural размерами, берем первое
   if (!image && images.length > 0) {
      image = images[0];
   }

   if (image) {
      // Natural размеры изображения (для расчета координат масок)
      const naturalWidth = image.naturalWidth || image.width || 0;
      const naturalHeight = image.naturalHeight || image.height || 0;

      // Получаем размеры контейнера
      // Сначала пробуем найти родительский контейнер
      const wrapper =
         image.closest(".home-image-wrapper") ||
         image.closest(".home-image-content");

      // Получаем размеры контейнера, проверяя разные способы
      let containerWidth = 0;
      let containerHeight = 0;

      if (wrapper) {
         containerWidth = wrapper.offsetWidth;
         containerHeight = wrapper.offsetHeight;
      }

      // Если контейнер скрыт через v-show, пробуем получить размеры через computed style
      if (containerWidth <= 0 || containerHeight <= 0) {
         if (wrapper) {
            const computedStyle = window.getComputedStyle(wrapper);
            containerWidth =
               parseFloat(computedStyle.width) || window.innerWidth;
            containerHeight =
               parseFloat(computedStyle.height) || window.innerHeight;
         } else {
            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
         }
      }

      // Если все еще невалидны, используем размеры окна
      if (containerWidth <= 0 || containerHeight <= 0) {
         containerWidth = window.innerWidth;
         containerHeight = window.innerHeight;
      }

      // Если natural размеры не загружены, используем размеры контейнера
      const finalNaturalWidth =
         naturalWidth > 0 ? naturalWidth : containerWidth;
      const finalNaturalHeight =
         naturalHeight > 0 ? naturalHeight : containerHeight;

      // Вычисляем масштаб для object-fit: cover
      const scaleX = containerWidth / finalNaturalWidth;
      const scaleY = containerHeight / finalNaturalHeight;
      const scale = Math.max(scaleX, scaleY);

      // Вычисляем реальный размер отображаемого изображения с учетом scale
      const scaledDisplayWidth = finalNaturalWidth * scale;
      const scaledDisplayHeight = finalNaturalHeight * scale;

      // Вычисляем смещение (центрирование)
      const offsetX = (containerWidth - scaledDisplayWidth) / 2;
      const offsetY = (containerHeight - scaledDisplayHeight) / 2;

      return {
         containerWidth,
         containerHeight,
         imageWidth: finalNaturalWidth,
         imageHeight: finalNaturalHeight,
         displayWidth: scaledDisplayWidth,
         displayHeight: scaledDisplayHeight,
         scale,
         offsetX,
         offsetY,
      };
   }

   // Fallback на размеры окна
   const width = window.innerWidth;
   const height = window.innerHeight;
   return {
      containerWidth: width,
      containerHeight: height,
      imageWidth: width,
      imageHeight: height,
      displayWidth: width,
      displayHeight: height,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
   };
};

// Получить размеры видео/изображения контейнера (для обратной совместимости)
const getVideoSize = () => {
   const info = getImageCoverInfo();
   // Возвращаем размеры контейнера для координат масок
   // Координаты масок должны быть относительно реального изображения
   return {
      width: info.displayWidth,
      height: info.displayHeight,
      offsetX: info.offsetX,
      offsetY: info.offsetY,
   };
};

// Проверка, находится ли точка внутри контура
// Используем canvas API для более точной проверки
// Должна использовать ту же логику расчета масштаба, что и drawOutline
// x, y - координаты относительно hitArea (контейнера)
// offsetX, offsetY - смещение изображения в контейнере
const isPointInPath = (x, y, offsetX = 0, offsetY = 0) => {
   if (props.points.length < 3) return false;

   // Получаем информацию об изображении для правильного масштабирования
   const imageInfo = getImageCoverInfo();
   if (!imageInfo || !imageInfo.imageWidth || !imageInfo.imageHeight) {
      return false;
   }

   // Координаты x, y уже в display координатах (относительно hitArea)
   // hitArea имеет размеры контейнера, но координаты масок заданы относительно изображения
   // Нужно преобразовать координаты из hitArea в координаты изображения

   // Сначала вычитаем offset (смещение изображения в контейнере)
   // offsetX и offsetY - это смещение изображения относительно контейнера
   const relativeX = x - offsetX;
   const relativeY = y - offsetY;

   // Получаем реальные отображаемые размеры изображения (та же логика, что и в drawOutline)
   const naturalWidth = imageInfo.imageWidth;
   const naturalHeight = imageInfo.imageHeight;

   // Находим само изображение/видео для получения его реальных отображаемых размеров
   const videos = document.querySelectorAll(".home-video");
   const images = document.querySelectorAll(".home-image");
   let element = null;

   // Ищем видимое изображение/видео
   for (const v of videos) {
      const style = window.getComputedStyle(v);
      if (
         style.display !== "none" &&
         style.visibility !== "hidden" &&
         style.opacity !== "0"
      ) {
         element = v;
         break;
      }
   }
   if (!element) {
      for (const img of images) {
         const style = window.getComputedStyle(img);
         if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
         ) {
            element = img;
            break;
         }
      }
   }

   // Получаем реальные отображаемые размеры изображения
   let actualDisplayWidth = naturalWidth;
   let actualDisplayHeight = naturalHeight;

   if (element) {
      // Используем getBoundingClientRect для получения реальных отображаемых размеров
      const rect = element.getBoundingClientRect();
      actualDisplayWidth = rect.width || naturalWidth;
      actualDisplayHeight = rect.height || naturalHeight;
   }

   // Масштаб рассчитываем относительно реальных размеров изображения (та же логика, что и в drawOutline)
   const scaleX = actualDisplayWidth / naturalWidth;
   const scaleY = actualDisplayHeight / naturalHeight;

   // Проверяем, что масштаб валиден
   if (
      isNaN(scaleX) ||
      isNaN(scaleY) ||
      scaleX <= 0 ||
      scaleY <= 0 ||
      !isFinite(scaleX) ||
      !isFinite(scaleY)
   ) {
      return false;
   }

   // Проверяем, что координаты в пределах отображаемого изображения
   if (
      relativeX < 0 ||
      relativeY < 0 ||
      relativeX > actualDisplayWidth ||
      relativeY > actualDisplayHeight
   ) {
      return false;
   }

   // Преобразуем координаты из display в natural для проверки
   const naturalX = relativeX / scaleX;
   const naturalY = relativeY / scaleY;

   // Создаем временный canvas для проверки (используем natural размеры)
   const tempCanvas = document.createElement("canvas");
   tempCanvas.width = naturalWidth;
   tempCanvas.height = naturalHeight;
   const ctx = tempCanvas.getContext("2d");

   // Рисуем полигон на canvas (координаты в процентах от natural)
   ctx.beginPath();
   ctx.moveTo(
      (props.points[0].x / 100) * naturalWidth,
      (props.points[0].y / 100) * naturalHeight
   );
   for (let i = 1; i < props.points.length; i++) {
      ctx.lineTo(
         (props.points[i].x / 100) * naturalWidth,
         (props.points[i].y / 100) * naturalHeight
      );
   }
   ctx.closePath();

   // Используем встроенный метод canvas для проверки точки (в natural координатах)
   return ctx.isPointInPath(naturalX, naturalY);
};

// Проверка координат относительно контейнера
const checkMousePosition = (clientX, clientY) => {
   if (!hitAreaRef.value) return false;

   const rect = hitAreaRef.value.getBoundingClientRect();
   const x = clientX - rect.left;
   const y = clientY - rect.top;

   // Проверяем, что координаты в пределах области
   if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return false;
   }

   const size = getVideoSize();

   // Проверяем, что size валиден
   if (
      !size ||
      !size.width ||
      !size.height ||
      size.width <= 0 ||
      size.height <= 0
   ) {
      return false;
   }

   return isPointInPath(x, y, size.offsetX || 0, size.offsetY || 0);
};

// Рисование контура
const drawOutline = (
   ctx,
   width,
   height,
   progress = 0,
   forceDraw = false,
   offsetX = 0,
   offsetY = 0,
   scaleX = 1,
   scaleY = 1
) => {
   // Получаем размеры canvas для clearRect
   const canvasWidth = ctx.canvas.width || width;
   const canvasHeight = ctx.canvas.height || height;
   ctx.clearRect(0, 0, canvasWidth, canvasHeight);

   // Проверяем, что есть точки или path для рисования
   if (props.points.length === 0 && !props.path) {
      return; // Нет данных для рисования
   }

   // Если alwaysVisible включен, всегда рисуем и устанавливаем isVisible
   if (props.alwaysVisible) {
      // Устанавливаем isVisible в true для alwaysVisible
      isVisible.value = true;
      // Всегда рисуем для alwaysVisible
   } else {
      // Не рисуем контур, если не видим (кроме случая forceDraw для инициализации)
      if (!isVisible.value && !forceDraw) {
         return;
      }
   }

   // Если forceDraw или alwaysVisible, рисуем даже если не видим (для инициализации)
   // Это нужно для правильной инициализации canvas перед показом маски

   // Вычисляем текущие параметры с учетом анимации
   const opacity = props.animated
      ? 0.5 + 0.5 * Math.sin((progress / props.animationSpeed) * Math.PI * 2)
      : 1;
   const currentGlowBlur =
      props.glowBlur * (props.animated ? 0.5 + 0.5 * opacity : 1);

   ctx.save();

   // Рисуем свечение (подсветку)
   if (props.glowColor) {
      ctx.beginPath();
      ctx.shadowColor = props.glowColor;
      ctx.shadowBlur = currentGlowBlur;
      ctx.fillStyle = props.glowColor;
      // Увеличиваем непрозрачность для лучшей видимости
      // Для alwaysVisible используем более высокую непрозрачность
      const baseAlpha = props.alwaysVisible ? 0.8 : 0.7;
      ctx.globalAlpha = Math.max(
         opacity * baseAlpha,
         props.alwaysVisible ? 0.8 : 0.5
      );

      // Включаем тени для свечения
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Убеждаемся, что тени включены
      ctx.shadowBlur = currentGlowBlur > 0 ? currentGlowBlur : 20;

      if (props.path) {
         // Используем SVG path с трансформацией
         // Если path задан в абсолютных координатах (не в процентах),
         // нужно применить масштабирование и смещение
         // Если path задан в процентах, нужно преобразовать его как points
         // Предполагаем, что path задан в абсолютных координатах относительно natural размеров
         ctx.save();
         ctx.translate(offsetX, offsetY);
         ctx.scale(scaleX, scaleY);
         const path2d = new Path2D(props.path);
         ctx.fill(path2d);
         ctx.restore();
      } else if (props.points.length > 0) {
         // Используем массив точек с учетом смещения и масштаба
         // Координаты в процентах от naturalWidth/naturalHeight
         // width и height здесь - это naturalWidth/naturalHeight
         // scaleX и scaleY - это масштаб от natural к display (displayWidth/naturalWidth)
         // offsetX и offsetY - это смещение изображения в контейнере (для центрирования)
         //
         // Формула для пропорционального масштабирования:
         // Координаты в процентах от natural размеров преобразуются в координаты canvas
         // (x / 100) * naturalWidth * scale + offsetX = (x / 100) * displayWidth + offsetX
         // Используем одинаковый scale для обеих осей для пропорционального масштабирования
         ctx.beginPath();
         const x0 = (props.points[0].x / 100) * width * scaleX + offsetX;
         const y0 = (props.points[0].y / 100) * height * scaleY + offsetY;
         ctx.moveTo(x0, y0);
         for (let i = 1; i < props.points.length; i++) {
            const xi = (props.points[i].x / 100) * width * scaleX + offsetX;
            const yi = (props.points[i].y / 100) * height * scaleY + offsetY;
            ctx.lineTo(xi, yi);
         }
         ctx.closePath();
         ctx.fill();
      }
   }

   ctx.restore();
   ctx.save();

   // Рисуем обводку
   ctx.beginPath();
   ctx.strokeStyle = props.strokeColor;
   ctx.lineWidth = props.strokeWidth;
   ctx.shadowColor = props.strokeColor;
   ctx.shadowBlur = currentGlowBlur * 0.5;
   // Увеличиваем непрозрачность для лучшей видимости
   // Для alwaysVisible используем максимальную непрозрачность
   ctx.globalAlpha = props.alwaysVisible ? 1.0 : Math.max(opacity, 0.8); // Минимум 0.8 для видимости

   if (props.path) {
      // Используем SVG path с трансформацией
      // Если path задан в абсолютных координатах (не в процентах),
      // нужно применить масштабирование и смещение
      // Если path задан в процентах, нужно преобразовать его как points
      // Предполагаем, что path задан в абсолютных координатах относительно natural размеров
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scaleX, scaleY);
      const path2d = new Path2D(props.path);
      ctx.stroke(path2d);
      ctx.restore();
   } else if (props.points.length > 0) {
      // Используем массив точек с учетом смещения и масштаба
      // Координаты в процентах от naturalWidth/naturalHeight
      // width и height здесь - это naturalWidth/naturalHeight
      // scaleX и scaleY - это масштаб от natural к display (displayWidth/naturalWidth)
      // offsetX и offsetY - это смещение изображения в контейнере (для центрирования)
      //
      // Формула для пропорционального масштабирования:
      // Координаты в процентах от natural размеров преобразуются в координаты canvas
      // (x / 100) * naturalWidth * scale + offsetX = (x / 100) * displayWidth + offsetX
      // Используем одинаковый scale для обеих осей для пропорционального масштабирования
      ctx.beginPath();
      const x0 = (props.points[0].x / 100) * width * scaleX + offsetX;
      const y0 = (props.points[0].y / 100) * height * scaleY + offsetY;
      ctx.moveTo(x0, y0);
      for (let i = 1; i < props.points.length; i++) {
         const xi = (props.points[i].x / 100) * width * scaleX + offsetX;
         const yi = (props.points[i].y / 100) * height * scaleY + offsetY;
         ctx.lineTo(xi, yi);
      }
      ctx.closePath();
      ctx.stroke();
   }

   ctx.restore();
};

// Создание clip-path из points для CSS с учетом смещения изображения
const getClipPath = () => {
   if (props.points.length < 3) return "";

   const imageInfo = getImageCoverInfo();
   const size = getVideoSize();

   // Если есть смещение, нужно пересчитать координаты
   // Координаты в процентах от исходного изображения нужно преобразовать
   // в проценты от контейнера с учетом смещения
   if (size.offsetX !== 0 || size.offsetY !== 0) {
      const pointsStr = props.points
         .map((p) => {
            // Преобразуем проценты исходного изображения в пиксели
            const xPx = (p.x / 100) * size.width + (size.offsetX || 0);
            const yPx = (p.y / 100) * size.height + (size.offsetY || 0);
            // Преобразуем обратно в проценты контейнера
            const xPercent = (xPx / imageInfo.containerWidth) * 100;
            const yPercent = (yPx / imageInfo.containerHeight) * 100;
            return `${xPercent}% ${yPercent}%`;
         })
         .join(", ");
      return `polygon(${pointsStr})`;
   }

   // Если смещения нет, используем обычные проценты
   const pointsStr = props.points.map((p) => `${p.x}% ${p.y}%`).join(", ");
   return `polygon(${pointsStr})`;
};

// Обновление canvas
const updateCanvas = (forceDraw = false) => {
   if (!canvasRef.value) {
      // Canvas еще не инициализирован, просто выходим без предупреждения
      return;
   }

   const imageInfo = getImageCoverInfo();

   // Проверяем, что размеры валидны
   if (
      !imageInfo ||
      !imageInfo.containerWidth ||
      !imageInfo.containerHeight ||
      !imageInfo.imageWidth ||
      !imageInfo.imageHeight ||
      imageInfo.containerWidth <= 0 ||
      imageInfo.containerHeight <= 0 ||
      imageInfo.imageWidth <= 0 ||
      imageInfo.imageHeight <= 0 ||
      isNaN(imageInfo.containerWidth) ||
      isNaN(imageInfo.containerHeight) ||
      isNaN(imageInfo.imageWidth) ||
      isNaN(imageInfo.imageHeight)
   ) {
      // Размеры невалидны - не обновляем canvas, просто выходим
      return;
   }

   const size = getVideoSize();

   // Проверяем, что size валиден
   if (
      !size ||
      !size.width ||
      !size.height ||
      size.width <= 0 ||
      size.height <= 0 ||
      isNaN(size.width) ||
      isNaN(size.height)
   ) {
      // Размеры невалидны - не обновляем canvas
      return;
   }

   const canvas = canvasRef.value;
   const ctx = canvas.getContext("2d");

   // Устанавливаем размеры canvas равными контейнеру
   canvas.width = imageInfo.containerWidth;
   canvas.height = imageInfo.containerHeight;

   // Устанавливаем стили для правильного отображения
   canvasStyle.value = {
      width: `${imageInfo.containerWidth}px`,
      height: `${imageInfo.containerHeight}px`,
   };

   wrapperStyle.value = {
      width: `${imageInfo.containerWidth}px`,
      height: `${imageInfo.containerHeight}px`,
   };

   // Очищаем и рисуем с учетом смещения
   const currentTime = Date.now() - animationStartTime;

   // Координаты масок заданы в процентах от naturalWidth/naturalHeight изображения
   // Масштабируем маски относительно реальных отображаемых размеров изображения, а не контейнера
   // Получаем реальные отображаемые размеры изображения напрямую
   const naturalWidth = imageInfo.imageWidth; // natural width изображения
   const naturalHeight = imageInfo.imageHeight; // natural height изображения

   // Находим само изображение/видео для получения его реальных отображаемых размеров
   const videos = document.querySelectorAll(".home-video");
   const images = document.querySelectorAll(".home-image");
   let element = null;

   // Ищем видимое изображение/видео
   for (const v of videos) {
      const style = window.getComputedStyle(v);
      if (
         style.display !== "none" &&
         style.visibility !== "hidden" &&
         style.opacity !== "0"
      ) {
         element = v;
         break;
      }
   }
   if (!element) {
      for (const img of images) {
         const style = window.getComputedStyle(img);
         if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
         ) {
            element = img;
            break;
         }
      }
   }

   // Получаем реальные отображаемые размеры изображения
   let actualDisplayWidth = naturalWidth;
   let actualDisplayHeight = naturalHeight;

   if (element) {
      // Используем getBoundingClientRect для получения реальных отображаемых размеров
      const rect = element.getBoundingClientRect();
      actualDisplayWidth = rect.width || naturalWidth;
      actualDisplayHeight = rect.height || naturalHeight;
   }

   // Масштаб рассчитываем относительно реальных размеров изображения, а не контейнера
   // Это обеспечивает, что маски масштабируются вместе с изображением, независимо от размера контейнера
   const scaleX = actualDisplayWidth / naturalWidth;
   const scaleY = actualDisplayHeight / naturalHeight;

   // Проверяем, что масштаб валиден
   if (
      isNaN(scaleX) ||
      isNaN(scaleY) ||
      scaleX <= 0 ||
      scaleY <= 0 ||
      !isFinite(scaleX) ||
      !isFinite(scaleY)
   ) {
      return; // Масштаб невалиден
   }

   // Если alwaysVisible включен, устанавливаем isVisible в true перед рисованием
   if (props.alwaysVisible) {
      isVisible.value = true;
   }

   // Всегда рисуем, если forceDraw, isVisible или alwaysVisible
   // forceDraw используется для инициализации, даже если маска еще не видна
   // Передаем natural размеры изображения и правильные offset для позиционирования на canvas
   // Координаты масок заданы в процентах от natural размеров изображения
   // При рисовании: (x / 100) * naturalWidth * scaleX + offsetX = (x / 100) * displayWidth + offsetX
   //
   // Важно: маски масштабируются относительно размеров самого изображения, а не контейнера
   // При изменении размеров изображения маски остаются на тех же позициях относительно изображения
   drawOutline(
      ctx,
      naturalWidth, // Используем natural width изображения для расчета координат
      naturalHeight, // Используем natural height изображения для расчета координат
      currentTime,
      forceDraw || props.alwaysVisible, // forceDraw если alwaysVisible
      size.offsetX || 0, // Смещение изображения в контейнере (для центрирования при object-fit: cover)
      size.offsetY || 0, // Смещение изображения в контейнере (для центрирования при object-fit: cover)
      scaleX, // Масштаб относительно изображения (displayWidth / naturalWidth)
      scaleY // Масштаб относительно изображения (displayHeight / naturalHeight)
   );
};

// Текущее состояние курсора (внутри контура или нет)
const isCursorInside = ref(false);

// Глобальный обработчик движения мыши
const handleGlobalMouseMove = (event) => {
   // Если alwaysVisible включен, маска всегда видна
   if (props.alwaysVisible) {
      // Убеждаемся, что маска видна
      if (!isVisible.value) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         // Обновляем canvas даже если маска уже видна (для анимации)
         if (canvasRef.value) {
            updateCanvas(true);
         }
      }
      return; // Не обрабатываем наведение для alwaysVisible
   }

   // Обычное поведение: показывать только при наведении
   // Проверяем позицию курсора только если canvas готов
   if (!canvasRef.value || !hitAreaRef.value) {
      return; // Canvas или hitArea еще не готовы
   }

   const isInside = checkMousePosition(event.clientX, event.clientY);
   isCursorInside.value = isInside;

   // Обновляем видимость маски в зависимости от позиции курсора
   if (isInside) {
      // Курсор внутри контура - показываем маску
      if (!isVisible.value) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         // Курсор все еще внутри - обновляем canvas для анимации
         if (canvasRef.value) {
            updateCanvas(true);
         }
      }
   } else {
      // Курсор вне контура - скрываем маску
      if (isVisible.value) {
         isVisible.value = false;
         if (canvasRef.value) {
            updateCanvas();
         }
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }
   }
};

// Обработчики событий мыши
const handleMouseMove = (event) => {
   // Если событие mousemove сработало на hit-area, значит курсор в видимой области clip-path
   // Устанавливаем cursor: pointer и обновляем состояние
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";

      // Дополнительно проверяем через более точный алгоритм для обновления состояния маски
      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();

      // Проверяем, что size валиден
      if (size && size.width > 0 && size.height > 0) {
         const isInside = isPointInPath(
            x,
            y,
            size.offsetX || 0,
            size.offsetY || 0
         );
         isCursorInside.value = isInside;

         // Если курсор внутри, показываем маску
         if (isInside && !props.alwaysVisible) {
            if (!isVisible.value) {
               isVisible.value = true;
               nextTick(() => {
                  if (canvasRef.value) {
                     updateCanvas(true);
                     if (props.animated) {
                        animate();
                     }
                  }
               });
            } else if (canvasRef.value) {
               updateCanvas(true);
            }
         }
      }
   }
   // Также вызываем глобальный обработчик для общей логики
   handleGlobalMouseMove(event);
};

// Обработчик входа курсора в область маски (для дополнительной надежности)
const handleMouseEnter = (event) => {
   // Устанавливаем cursor: pointer, так как clip-path уже ограничивает область
   // Если mouseenter сработал, значит курсор точно в видимой области clip-path
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "pointer";
      isCursorInside.value = true;

      // Дополнительно проверяем координаты для точности
      const rect = hitAreaRef.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = getVideoSize();

      // Проверяем, что size валиден
      if (size && size.width > 0 && size.height > 0) {
         const isInside = isPointInPath(
            x,
            y,
            size.offsetX || 0,
            size.offsetY || 0
         );
         isCursorInside.value = isInside;

         // Показываем маску при входе в область (только если не alwaysVisible)
         if (isInside && !props.alwaysVisible) {
            isVisible.value = true;
            nextTick(() => {
               if (canvasRef.value) {
                  updateCanvas(true);
                  if (props.animated) {
                     animate();
                  }
               }
            });
         }
      }
   }
};

// Обработчик выхода курсора из области маски
const handleMouseLeave = () => {
   // При выходе из области скрываем маску (только если не alwaysVisible)
   isCursorInside.value = false;

   if (!props.alwaysVisible && isVisible.value) {
      isVisible.value = false;
      if (canvasRef.value) {
         updateCanvas();
      }
      if (animationFrame) {
         cancelAnimationFrame(animationFrame);
         animationFrame = null;
      }
   }
};

// Глобальный обработчик клика
const handleGlobalClick = (event) => {
   // Проверяем, был ли клик по области контура
   const isInside = checkMousePosition(event.clientX, event.clientY);

   if (!isInside) {
      return; // Клик не по контуру, не обрабатываем
   }

   // Проверяем, не был ли клик по другому интерактивному элементу
   const target = event.target;
   const isInteractiveElement =
      target.closest("a") ||
      target.closest("button") ||
      target.closest(".home-content-top-back") ||
      target.closest(".home-content-top-about") ||
      target.closest(".home-content-slider-arrow") ||
      target.closest("[role='button']") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("router-link");

   // Если клик был по интерактивному элементу, не обрабатываем
   if (isInteractiveElement) {
      return;
   }

   // Клик по контуру и не по интерактивному элементу
   event.preventDefault();
   event.stopPropagation();
   event.stopImmediatePropagation();

   // Вызываем кастомный обработчик, если он есть, иначе перезагружаем страницу
   if (props.onClick && typeof props.onClick === "function") {
      props.onClick(event);
   } else {
      window.location.reload();
   }
};

// Обработчик клика на hit-area (для дополнительной надежности)
const handleClick = (event) => {
   try {
      if (!event) return;

      // If the click is directly on the hit area (via clip-path),
      // we know it's within the mask shape, so skip the position check
      event.preventDefault();
      event.stopPropagation();

      // Call the click handler directly
      if (props.onClick && typeof props.onClick === "function") {
         props.onClick(event);
      } else {
         window.location.reload();
      }
   } catch (error) {
      console.error("Error in handleClick:", error);
   }
};

// Touch handling for mobile devices
const touchStartPos = ref({ x: 0, y: 0 });
const touchStartTime = ref(0);

const handleTouchStart = (event) => {
   try {
      if (!event || !event.touches || event.touches.length === 0) return;

      if (event.touches.length === 1) {
         const touch = event.touches[0];
         touchStartPos.value = { x: touch.clientX, y: touch.clientY };
         touchStartTime.value = Date.now();

         // Show mask on touch
         if (
            hitAreaRef.value &&
            checkMousePosition(touch.clientX, touch.clientY)
         ) {
            // Stop event propagation to prevent drag from starting
            event.stopPropagation();

            isCursorInside.value = true;
            if (!isVisible.value) {
               isVisible.value = true;
               updateCanvas();
               if (props.animated) {
                  startAnimation();
               }
            }
         }
      }
   } catch (error) {
      console.error("Error in handleTouchStart:", error);
   }
};

const handleTouchEnd = (event) => {
   try {
      if (!event || !event.changedTouches || event.changedTouches.length === 0)
         return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = Math.abs(touch.clientX - touchStartPos.value.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.value.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const deltaTime = Date.now() - touchStartTime.value;

      // Only trigger click if it's a tap (not a drag)
      // More forgiving thresholds for mobile: 15px movement and less than 500ms
      const TAP_DISTANCE_THRESHOLD = 15;
      const TAP_TIME_THRESHOLD = 500;

      if (distance < TAP_DISTANCE_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
         // Double-check that we're still over the mask
         if (
            hitAreaRef.value &&
            checkMousePosition(touch.clientX, touch.clientY)
         ) {
            // Prevent the event from bubbling to drag handlers
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Small delay to ensure drag handlers have finished
            setTimeout(() => {
               // Call the click handler
               if (props.onClick && typeof props.onClick === "function") {
                  props.onClick(event);
               }
            }, 10);
         }
      }

      // Hide mask after touch
      isCursorInside.value = false;
   } catch (error) {
      console.error("Error in handleTouchEnd:", error);
   }
};

// Анимационный цикл
const animate = () => {
   if (props.animated && isVisible.value && canvasRef.value) {
      updateCanvas(true);
      animationFrame = requestAnimationFrame(animate);
   }
};

// Handlers for window events (defined outside init to be accessible in cleanup)
const handleResize = () => {
   if (canvasRef.value) {
      updateCanvas(true);
   }
};

const handleMaskUpdate = () => {
   if (canvasRef.value) {
      updateCanvas(true);
   }
};

// Инициализация
const init = () => {
   animationStartTime = Date.now();

   // Если alwaysVisible включен, показываем маску сразу
   if (props.alwaysVisible) {
      isVisible.value = true;
   }

   // Всегда инициализируем canvas (даже если маска не видна, для подготовки)
   nextTick(() => {
      // Проверяем, что canvas инициализирован
      if (!canvasRef.value) {
         // Если canvas еще не готов, ждем еще немного
         setTimeout(() => {
            init();
         }, 100);
         return;
      }

      // Сначала рисуем canvas (forceDraw для инициализации)
      updateCanvas(true);

      // Если alwaysVisible включен, убеждаемся что маска видна
      if (props.alwaysVisible) {
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
               if (props.animated) {
                  animate();
               }
            }
         });
      }

      // Дополнительная инициализация после небольшой задержки (на случай если изображение еще загружается)
      setTimeout(() => {
         if (canvasRef.value) {
            // Если alwaysVisible, убеждаемся что маска видна
            if (props.alwaysVisible) {
               isVisible.value = true;
            }
            updateCanvas(true);
            if (props.alwaysVisible && props.animated) {
               nextTick(() => {
                  if (canvasRef.value) {
                     animate();
                  }
               });
            }
         }
      }, 300);
   });

   // Слушаем глобальное движение мыши для точного отслеживания
   document.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: true,
   });

   // Слушаем глобальные клики для надежного отслеживания (bubbling phase)
   document.addEventListener("click", handleGlobalClick);

   // Слушаем изменение размера окна
   window.addEventListener("resize", handleResize, {
      passive: true,
   });

   // Слушаем событие обновления масок (отдельно от resize, чтобы не конфликтовать)
   window.addEventListener("mask-update", handleMaskUpdate, {
      passive: true,
   });

   // Слушаем загрузку изображения для пересчета масок
   // Используем querySelectorAll чтобы найти все изображения (v-show может скрывать)
   const images = document.querySelectorAll(".home-image");
   const video = document.querySelector(".home-video");

   // Обрабатываем все изображения (даже скрытые через v-show)
   images.forEach((image) => {
      if (image.complete && image.naturalWidth > 0) {
         if (canvasRef.value) {
            updateCanvas(true);
         }
      } else {
         image.addEventListener("load", () => {
            nextTick(() => {
               if (canvasRef.value) {
                  updateCanvas(true);
               }
            });
         });
      }
   });

   // Если не нашли изображения, все равно инициализируем с текущими размерами
   if (images.length === 0 && canvasRef.value) {
      updateCanvas(true);
   }

   if (video) {
      video.addEventListener("loadedmetadata", () => {
         nextTick(() => {
            if (canvasRef.value) {
               updateCanvas(true);
            }
         });
      });
   }
};

// Очистка
const cleanup = () => {
   if (animationFrame) {
      cancelAnimationFrame(animationFrame);
   }
   // Восстанавливаем курсор по умолчанию
   document.body.style.cursor = "";
   if (hitAreaRef.value) {
      hitAreaRef.value.style.cursor = "default";
   }
   document.removeEventListener("mousemove", handleGlobalMouseMove);
   document.removeEventListener("click", handleGlobalClick);
   window.removeEventListener("resize", handleResize);
   window.removeEventListener("mask-update", handleMaskUpdate);
};

// Наблюдаем за изменениями props
watch(
   () => [props.points, props.path, props.strokeColor, props.glowColor],
   () => {
      // Обновляем canvas только если он уже инициализирован
      if (canvasRef.value) {
         updateCanvas(isVisible.value);
      }
   },
   { deep: true }
);

// Наблюдаем за изменением alwaysVisible
watch(
   () => props.alwaysVisible,
   (newValue) => {
      // Включаем флаг для мгновенного перехода (убираем CSS transition)
      alwaysVisibleChanging.value = true;

      if (newValue) {
         // Включаем alwaysVisible - показываем маску мгновенно
         isVisible.value = true;
         nextTick(() => {
            if (canvasRef.value) {
               // Сначала рисуем canvas
               updateCanvas(true);
               // Затем запускаем анимацию если нужно
               if (props.animated) {
                  animate();
               }
            }
         });
      } else {
         // Выключаем alwaysVisible - скрываем маску мгновенно
         isVisible.value = false;
         if (canvasRef.value) {
            updateCanvas();
         }
         if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      }

      // Возвращаем transition после небольшой задержки (чтобы переход успел произойти)
      nextTick(() => {
         setTimeout(() => {
            alwaysVisibleChanging.value = false;
         }, 100);
      });
   },
   { flush: "sync", immediate: true } // Включаем immediate для правильной инициализации
);

onMounted(() => {
   nextTick(() => {
      init();
   });
});

onUnmounted(() => {
   cleanup();
});
</script>

<style scoped>
.house-outline-wrapper {
   position: absolute;
   top: 0;
   left: 0;
   z-index: 14 !important;
   pointer-events: none;
   isolation: isolate; /* Создает новый stacking context */
   width: 100%;
   height: 100%;
}

.house-outline-wrapper .house-outline-hit-area {
   pointer-events: all !important;
   z-index: 14 !important;
}

.house-outline-canvas {
   position: absolute;
   top: 0;
   left: 0;
   pointer-events: none;
   mix-blend-mode: screen;
   opacity: 0;
   transition: opacity 0.3s ease;
   /* Ensure canvas is always rendered */
   display: block !important;
   visibility: visible !important;
   /* Ensure canvas is above other content */
   z-index: 15 !important;
   /* Ensure canvas is visible when drawn */
   will-change: opacity;
   /* Force hardware acceleration */
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
}

.house-outline-canvas-visible {
   opacity: 1 !important;
   visibility: visible !important;
   display: block !important;
   z-index: 15 !important;
   /* Force visibility */
   pointer-events: none !important;
   /* Ensure canvas is visible when drawn */
   will-change: opacity;
   /* Ensure canvas is rendered */
   transform: translateZ(0);
   -webkit-transform: translateZ(0);
}

/* Мгновенное скрытие/показ при изменении alwaysVisible (disclaimer mode) */
.house-outline-canvas-instant {
   transition: opacity 0s !important;
}

.house-outline-hit-area {
   position: absolute;
   top: 0;
   left: 0;
   cursor: pointer;
   background: transparent;
   z-index: 14 !important;
   pointer-events: all !important;
   /* Enable touch on mobile */
   touch-action: manipulation;
   -webkit-tap-highlight-color: transparent;
}

.house-outline-hit-area-pointer {
   cursor: pointer;
}

/* Better touch feedback on mobile */
@media (hover: none) and (pointer: coarse) {
   .house-outline-hit-area {
      /* Increase touch area slightly on mobile */
      min-width: 44px;
      min-height: 44px;
   }
}
</style>
